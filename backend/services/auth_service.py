from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
import bcrypt
from sqlalchemy.orm import Session
from typing import Optional

from config import settings
from crud.college import get_college_by_email, get_college_by_code
from crud.student import get_student_by_email
from models.college import College
from models.student import Student
from utils.exceptions import AuthenticationError

# ── Password Hashing ──────────────────────────────────────────
def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    try:
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False


# ── JWT Token Utilities ────────────────────────────────────────
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        raise AuthenticationError("Could not validate credentials")

# ── Auth Business Logic ───────────────────────────────────────
def authenticate_college(db: Session, email: str, password: str) -> College:
    college = get_college_by_email(db, email=email)
    if not college:
        raise AuthenticationError("Invalid email or password")
    if not verify_password(password, college.password):
        raise AuthenticationError("Invalid email or password")
    return college

def authenticate_student(db: Session, college_code: str, email: str, password: str) -> Student:
    college = get_college_by_code(db, code=college_code)
    if not college:
        raise AuthenticationError("Invalid college code")
    
    student = get_student_by_email(db, email=email)
    if not student or student.college_id != college.id:
        raise AuthenticationError("Invalid email or password")
        
    if not verify_password(password, student.password):
        raise AuthenticationError("Invalid email or password")
        
    return student

