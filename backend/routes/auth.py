from fastapi import APIRouter, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from schemas.college import CollegeCreate, CollegeResponse, LoginRequest, TokenResponse, ForgotPasswordRequest, ResetPasswordRequest
from schemas.student import StudentLoginRequest, StudentResponse
from services.auth_service import authenticate_college, authenticate_student, create_access_token, hash_password, verify_token
import crud.college as crud_college
import crud.student as crud_student
from utils.exceptions import AuthenticationError, DuplicateError, NotFoundError, ValidationError
import uuid
from datetime import datetime, timedelta, timezone
from services.email_service import send_reset_password_email

router = APIRouter(tags=["Authentication"])
security = HTTPBearer()

def get_current_college(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> CollegeResponse:
    payload = verify_token(credentials.credentials)
    if payload.get("role") != "admin":
        raise AuthenticationError("Admin privileges required")
    email = payload.get("sub")
    if not email:
        raise AuthenticationError("Invalid authentication token")
    college = crud_college.get_college_by_email(db, email=email)
    if not college:
        raise AuthenticationError("College not found")
    if not college.college_code:
        college.college_code = str(uuid.uuid4())[:8].upper()
        db.commit()
        db.refresh(college)
    return college

def get_current_student(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> StudentResponse:
    payload = verify_token(credentials.credentials)
    if payload.get("role") != "student":
        raise AuthenticationError("Student privileges required")
    student_id = payload.get("sub")
    if not student_id:
        raise AuthenticationError("Invalid authentication token")
    student = crud_student.get_student_by_id(db, student_id=int(student_id))
    if not student:
        raise AuthenticationError("Student not found")
    return student

@router.get("/auth/me", response_model=CollegeResponse, summary="Get current logged in college")
def get_me(college: CollegeResponse = Depends(get_current_college)):
    """
    Returns the currently authenticated college's profile details, including college_code.
    """
    return college

@router.post("/register", response_model=CollegeResponse, status_code=status.HTTP_201_CREATED, summary="Register a new College")
def register(college_in: CollegeCreate, db: Session = Depends(get_db)):
    """
    Registers a new College account.
    """
    existing = crud_college.get_college_by_email(db, email=college_in.email)
    if existing:
        raise DuplicateError("A college with this email is already registered")
    
    hashed_pwd = hash_password(college_in.password)
    return crud_college.create_college(db, college_in, hashed_pwd)

@router.post("/login", response_model=TokenResponse, summary="Log in as a College")
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates a College using email and password, returning a JWT token.
    """
    college = authenticate_college(db, email=login_data.email, password=login_data.password)
    if not college.college_code:
        college.college_code = str(uuid.uuid4())[:8].upper()
        db.commit()
        db.refresh(college)
    token = create_access_token(data={"sub": college.email, "role": "admin"})
    return {"access_token": token, "token_type": "bearer", "college_code": college.college_code}

@router.post("/student/login", response_model=TokenResponse, summary="Log in as a Student")
def student_login(login_data: StudentLoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates a Student returning a JWT token.
    """
    student = authenticate_student(db, college_code=login_data.college_code, email=login_data.email, password=login_data.password)
    token = create_access_token(data={"sub": str(student.id), "role": "student"})
    return {
        "access_token": token, 
        "token_type": "bearer", 
        "student_id": student.id,
        "student_name": student.name
    }

@router.post("/forgot-password", summary="Request Admin Password Reset")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    college = crud_college.get_college_by_email(db, email=request.email)
    if not college:
        return {"message": "If that email is registered, a password reset link has been sent."}

    reset_token = str(uuid.uuid4())
    expiry = datetime.now(timezone.utc) + timedelta(hours=1)

    college.reset_token = reset_token
    college.reset_token_expiry = expiry
    db.commit()

    send_reset_password_email(college.email, reset_token)

    return {"message": "If that email is registered, a password reset link has been sent."}

@router.post("/reset-password", summary="Reset Admin Password using Token")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    college = db.query(crud_college.College).filter(crud_college.College.reset_token == request.token).first()
    
    if not college:
        raise ValidationError("Invalid or expired reset token.")
    
    if not college.reset_token_expiry or college.reset_token_expiry < datetime.now(timezone.utc):
        raise ValidationError("Invalid or expired reset token.")
    
    hashed_pwd = hash_password(request.new_password)
    college.password = hashed_pwd
    college.reset_token = None
    college.reset_token_expiry = None
    
    db.commit()
    
    return {"message": "Password successfully reset. You can now log in."}
