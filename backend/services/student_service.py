from sqlalchemy.orm import Session
from schemas.student import StudentCreate, StudentUpdate
from models.student import Student
import crud.student as crud_student
import crud.college as crud_college
import crud.allocation_session as crud_session
from utils.exceptions import NotFoundError, DuplicateError, ValidationError
from services.auth_service import hash_password

def create_student(db: Session, student: StudentCreate) -> Student:
    # Validate college exists
    college = crud_college.get_college_by_id(db, college_id=student.college_id)
    if not college:
        raise NotFoundError(f"College with ID {student.college_id} does not exist")

    # Validate session exists and belongs to the same college
    session = crud_session.get_session_by_id(db, session_id=student.allocation_session_id)
    if not session:
        raise NotFoundError(f"Allocation session with ID {student.allocation_session_id} not found")
    if session.college_id != student.college_id:
        raise ValidationError("Allocation session does not belong to the student's college")

    # Check duplicate email
    existing_email = crud_student.get_student_by_email(db, email=student.email)
    if existing_email:
        raise DuplicateError(f"Student with email '{student.email}' already exists")

    # Check duplicate roll number
    existing_roll = crud_student.get_student_by_roll_number(db, roll_number=student.roll_number)
    if existing_roll:
        raise DuplicateError(f"Student with roll number '{student.roll_number}' already exists")

    # Check gender (though validated by schema, ensure consistency)
    if student.gender not in ("Male", "Female", "Other"):
        raise ValidationError("Gender must be 'Male', 'Female', or 'Other'")

    # Check year of study
    if not (1 <= student.year_of_study <= 5):
        raise ValidationError("Year of study must be between 1 and 5")

    hashed_pwd = hash_password(student.roll_number)
    return crud_student.create_student(db, student, hashed_pwd)

def get_students(
    db: Session, 
    college_id: int | None = None, 
    session_id: int | None = None
) -> list[Student]:
    return crud_student.get_students(db, college_id=college_id, session_id=session_id)

def get_student_by_id(db: Session, student_id: int) -> Student:
    student = crud_student.get_student_by_id(db, student_id=student_id)
    if not student:
        raise NotFoundError(f"Student with ID {student_id} not found")
    return student

def update_student(db: Session, student_id: int, college_id: int, student_update: StudentUpdate) -> Student:
    db_student = get_student_by_id(db, student_id)
    if db_student.college_id != college_id:
        raise NotFoundError(f"Student with ID {student_id} not found in your college")

    update_data = student_update.model_dump(exclude_unset=True)
    
    if "email" in update_data and update_data["email"] != db_student.email:
        existing = crud_student.get_student_by_email(db, email=update_data["email"])
        if existing:
            raise DuplicateError(f"Student with email '{update_data['email']}' already exists")
            
    if "roll_number" in update_data and update_data["roll_number"] != db_student.roll_number:
        existing = crud_student.get_student_by_roll_number(db, roll_number=update_data["roll_number"])
        if existing:
            raise DuplicateError(f"Student with roll number '{update_data['roll_number']}' already exists")
            
    if "allocation_session_id" in update_data and update_data["allocation_session_id"] != db_student.allocation_session_id:
        session = crud_session.get_session_by_id(db, session_id=update_data["allocation_session_id"])
        if not session or session.college_id != college_id:
            raise NotFoundError(f"Allocation session with ID {update_data['allocation_session_id']} not found")

    return crud_student.update_student(db, db_student, update_data)

def delete_student(db: Session, student_id: int, college_id: int) -> None:
    db_student = get_student_by_id(db, student_id)
    if db_student.college_id != college_id:
        raise NotFoundError(f"Student with ID {student_id} not found in your college")
    crud_student.delete_student(db, db_student)

def reset_student_password(db: Session, student_id: int, college_id: int) -> None:
    db_student = get_student_by_id(db, student_id)
    if db_student.college_id != college_id:
        raise NotFoundError(f"Student with ID {student_id} not found in your college")
    
    hashed_pwd = hash_password(db_student.roll_number)
    db_student.password = hashed_pwd
    db.commit()
