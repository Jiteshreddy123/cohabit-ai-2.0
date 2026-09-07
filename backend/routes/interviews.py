from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas.interview import InterviewMessageRequest, InterviewMessageResponse, InterviewStartResponse
from services.ai_service import get_or_create_interview, process_interview_message
from pydantic import BaseModel
from typing import List, Dict
from routes.auth import get_current_student
from fastapi import HTTPException

router = APIRouter(prefix="/interviews", tags=["Interviews"])

@router.post(
    "/{student_id}/start",
    response_model=InterviewStartResponse,
    summary="Start or Resume an Interview",
    description="Starts a new AI interview for the student or resumes an existing one."
)
def start_interview(student_id: int, db: Session = Depends(get_db), current_student = Depends(get_current_student)):
    if current_student.id != student_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    interview_id, history = get_or_create_interview(db, student_id)
    return {"interview_id": interview_id, "history": history}

@router.post(
    "/{student_id}/message",
    response_model=InterviewMessageResponse,
    summary="Send a message to the AI Interviewer",
    description="Sends a student's response to the AI and gets the next question."
)
def send_message(student_id: int, request: InterviewMessageRequest, db: Session = Depends(get_db), current_student = Depends(get_current_student)):
    if current_student.id != student_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    response_text, history, is_complete = process_interview_message(db, student_id, request.message)
    return {
        "response": response_text,
        "is_complete": is_complete,
        "history": history
    }

@router.post(
    "/{student_id}/end",
    summary="End an Interview and Extract Traits",
    description="Manually concludes an interview and triggers AI trait extraction."
)
def end_interview(student_id: int, db: Session = Depends(get_db), current_student = Depends(get_current_student)):
    if current_student.id != student_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    from services.ai_service import process_interview_end
    traits = process_interview_end(db, student_id)
    return {"message": "Interview ended and traits extracted successfully.", "traits": traits}
