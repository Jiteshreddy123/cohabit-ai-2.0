import uuid
from sqlalchemy.orm import Session
from models.college import College
from schemas.college import CollegeCreate

def get_college_by_email(db: Session, email: str) -> College | None:
    return db.query(College).filter(College.email == email).first()

def get_college_by_code(db: Session, code: str) -> College | None:
    return db.query(College).filter(College.college_code == code).first()

def get_college_by_id(db: Session, college_id: int) -> College | None:
    return db.query(College).filter(College.id == college_id).first()

def create_college(db: Session, college: CollegeCreate, hashed_password: str) -> College:
    db_college = College(
        name=college.name,
        email=college.email,
        password=hashed_password,
        college_code=str(uuid.uuid4())[:8].upper()
    )
    db.add(db_college)
    db.commit()
    db.refresh(db_college)
    return db_college
