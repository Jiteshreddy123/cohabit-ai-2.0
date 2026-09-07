from sqlalchemy.orm import Session
from models.student import Student
from schemas.student import StudentCreate

def create_student(db: Session, student: StudentCreate, hashed_password: str) -> Student:
    db_student = Student(
        college_id=student.college_id,
        allocation_session_id=student.allocation_session_id,
        name=student.name,
        roll_number=student.roll_number,
        email=student.email,
        branch=student.branch,
        year_of_study=student.year_of_study,
        gender=student.gender,
        password=hashed_password
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def get_students(
    db: Session, 
    college_id: int | None = None, 
    session_id: int | None = None
) -> list[Student]:
    query = db.query(Student)
    if college_id is not None:
        query = query.filter(Student.college_id == college_id)
    if session_id is not None:
        query = query.filter(Student.allocation_session_id == session_id)
    return query.all()

def get_student_by_id(db: Session, student_id: int) -> Student | None:
    return db.query(Student).filter(Student.id == student_id).first()

def get_student_by_email(db: Session, email: str) -> Student | None:
    return db.query(Student).filter(Student.email == email).first()

def get_student_by_roll_number(db: Session, roll_number: str) -> Student | None:
    return db.query(Student).filter(Student.roll_number == roll_number).first()

def update_student(db: Session, db_student: Student, update_data: dict) -> Student:
    for key, value in update_data.items():
        setattr(db_student, key, value)
    db.commit()
    db.refresh(db_student)
    return db_student

def delete_student(db: Session, db_student: Student) -> None:
    db.delete(db_student)
    db.commit()
