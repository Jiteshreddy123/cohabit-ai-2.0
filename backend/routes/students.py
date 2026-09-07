from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from schemas.student import StudentCreate, StudentResponse, StudentUpdate
from schemas.college import CollegeResponse
import services.student_service as student_service
from routes.auth import get_current_college
from utils.exceptions import AuthenticationError

router = APIRouter(prefix="/students", tags=["Students"])

@router.post(
    "",
    response_model=StudentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new Student record",
    description="Adds a new student record to the specified allocation session for the logged-in college."
)
def create_student(
    student_in: StudentCreate,
    db: Session = Depends(get_db),
    current_college: CollegeResponse = Depends(get_current_college)
):
    # Enforce that college_id matches the logged-in college
    student_in.college_id = current_college.id
    return student_service.create_student(db, student_in)

@router.get(
    "",
    response_model=list[StudentResponse],
    summary="List all Students",
    description="Retrieves list of all students enrolled under the logged-in college, with optional session filtering."
)
def get_students(
    session_id: Optional[int] = Query(None, description="Filter students by allocation session ID"),
    db: Session = Depends(get_db),
    current_college: CollegeResponse = Depends(get_current_college)
):
    return student_service.get_students(db, college_id=current_college.id, session_id=session_id)

@router.get(
    "/{id}",
    response_model=StudentResponse,
    summary="Get Student details by ID",
    description="Retrieves detailed student profile using their ID, only if they belong to the logged-in college."
)
def get_student(
    id: int,
    db: Session = Depends(get_db),
    current_college: CollegeResponse = Depends(get_current_college)
):
    student = student_service.get_student_by_id(db, student_id=id)
    if student.college_id != current_college.id:
        raise AuthenticationError("You do not have permission to access this student record")
    return student

@router.put(
    "/{id}",
    response_model=StudentResponse,
    summary="Update a Student record",
    description="Updates an existing student's details for the logged-in college."
)
def update_student(
    id: int,
    student_in: StudentUpdate,
    db: Session = Depends(get_db),
    current_college: CollegeResponse = Depends(get_current_college)
):
    return student_service.update_student(db, id, current_college.id, student_in)

@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a Student record",
    description="Deletes a student record for the logged-in college."
)
def delete_student(
    id: int,
    db: Session = Depends(get_db),
    current_college: CollegeResponse = Depends(get_current_college)
):
    student_service.delete_student(db, id, current_college.id)

@router.post(
    "/{id}/reset-password",
    status_code=status.HTTP_200_OK,
    summary="Reset Student Password",
    description="Resets a student's password back to their roll number."
)
def reset_student_password(
    id: int,
    db: Session = Depends(get_db),
    current_college: CollegeResponse = Depends(get_current_college)
):
    student_service.reset_student_password(db, id, current_college.id)
    return {"message": "Password successfully reset to roll number"}