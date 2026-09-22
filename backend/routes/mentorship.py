"""
Academic Mentorship & Monthly Student Check-in Call Routes.
"""

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timezone

from database import get_db
from models.mentorship import AcademicMentor, MonthlyCheckinCall
from models.student import Student
from models.college import College
from schemas.mentorship import (
    AcademicMentorResponse,
    PreNotesRequest,
    CheckinCallLogRequest,
    CheckinCallScheduleRequest,
    CheckinCallResponse,
    StudentMentorshipProfileResponse,
    MenteeItemResponse,
)
from routes.auth import get_current_student, get_current_college
from utils.exceptions import NotFoundError, ValidationError

router = APIRouter(prefix="/mentorship", tags=["Mentorship"])


def _get_or_assign_mentor(student: Student, db: Session) -> Optional[AcademicMentor]:
    """Helper to retrieve or assign an academic mentor to a student."""
    if student.mentor_id:
        mentor = db.query(AcademicMentor).filter(AcademicMentor.id == student.mentor_id).first()
        if mentor:
            return mentor

    # Find an academic mentor from the same college
    mentor = db.query(AcademicMentor).filter(AcademicMentor.college_id == student.college_id).first()
    if not mentor:
        # Fallback to any mentor
        mentor = db.query(AcademicMentor).first()

    if mentor:
        student.mentor_id = mentor.id
        db.commit()
        db.refresh(student)

    return mentor


@router.get("/my-mentor", response_model=StudentMentorshipProfileResponse, summary="Get student's assigned mentor and monthly check-in call status")
def get_my_mentor(
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    mentor = _get_or_assign_mentor(current_student, db)

    # Check for current or upcoming call
    current_month_str = datetime.now().strftime("%B %Y")
    
    current_call = db.query(MonthlyCheckinCall).filter(
        MonthlyCheckinCall.student_id == current_student.id,
        MonthlyCheckinCall.month_year == current_month_str,
    ).first()

    # If no call exists for this month, auto-provision a scheduled check-in call for demonstration
    if not current_call and mentor:
        current_call = MonthlyCheckinCall(
            student_id=current_student.id,
            mentor_id=mentor.id,
            month_year=current_month_str,
            scheduled_date=f"{datetime.now().strftime('%Y-%m-28')} 15:30",
            status="Scheduled",
            call_mode="Video Call",
            meeting_link="https://meet.google.com/cohabit-mentor-call",
        )
        db.add(current_call)
        db.commit()
        db.refresh(current_call)

    # Fetch history of all completed calls
    history = db.query(MonthlyCheckinCall).filter(
        MonthlyCheckinCall.student_id == current_student.id,
        MonthlyCheckinCall.status == "Completed",
    ).order_by(MonthlyCheckinCall.id.desc()).all()

    mentor_resp = None
    if mentor:
        mentor_resp = AcademicMentorResponse(
            id=mentor.id,
            college_id=mentor.college_id,
            name=mentor.name,
            email=mentor.email,
            department=mentor.department,
            designation=mentor.designation,
            phone=mentor.phone,
            office_location=mentor.office_location,
            avatar_url=mentor.avatar_url,
            bio=mentor.bio,
        )

    return StudentMentorshipProfileResponse(
        mentor=mentor_resp,
        current_call=current_call,
        history=history,
    )


@router.post("/pre-call-notes", response_model=CheckinCallResponse, summary="Submit student problems / notes before the monthly call")
def submit_pre_call_notes(
    body: PreNotesRequest,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    current_month_str = datetime.now().strftime("%B %Y")
    call = db.query(MonthlyCheckinCall).filter(
        MonthlyCheckinCall.student_id == current_student.id,
        MonthlyCheckinCall.month_year == current_month_str,
    ).first()

    if not call:
        mentor = _get_or_assign_mentor(current_student, db)
        if not mentor:
            raise ValidationError("No mentor currently assigned to this student")
        call = MonthlyCheckinCall(
            student_id=current_student.id,
            mentor_id=mentor.id,
            month_year=current_month_str,
            scheduled_date=f"{datetime.now().strftime('%Y-%m-28')} 15:30",
            status="Scheduled",
            call_mode="Video Call",
            meeting_link="https://meet.google.com/cohabit-mentor-call",
            student_pre_notes=body.student_pre_notes,
        )
        db.add(call)
    else:
        call.student_pre_notes = body.student_pre_notes

    db.commit()
    db.refresh(call)
    return call


@router.get("/academic-roster", response_model=List[MenteeItemResponse], summary="Academic/Mentor portal mentee overview")
def get_academic_roster(
    college: College = Depends(get_current_college),
    db: Session = Depends(get_db),
):
    students = db.query(Student).filter(Student.college_id == college.id).all()
    current_month_str = datetime.now().strftime("%B %Y")

    result = []
    for s in students:
        _get_or_assign_mentor(s, db)
        
        call = db.query(MonthlyCheckinCall).filter(
            MonthlyCheckinCall.student_id == s.id,
            MonthlyCheckinCall.month_year == current_month_str,
        ).first()

        past_calls_count = db.query(MonthlyCheckinCall).filter(
            MonthlyCheckinCall.student_id == s.id,
            MonthlyCheckinCall.status == "Completed",
        ).count()

        latest_completed = db.query(MonthlyCheckinCall).filter(
            MonthlyCheckinCall.student_id == s.id,
            MonthlyCheckinCall.status == "Completed",
        ).order_by(MonthlyCheckinCall.id.desc()).first()

        monthly_status = "Not Scheduled"
        current_call_id = None
        current_scheduled_date = None
        current_call_mode = None
        student_pre_notes = None

        if call:
            current_call_id = call.id
            current_scheduled_date = call.scheduled_date
            current_call_mode = call.call_mode
            student_pre_notes = call.student_pre_notes
            monthly_status = call.status

        result.append(
            MenteeItemResponse(
                student_id=s.id,
                name=s.name,
                roll_number=s.roll_number,
                branch=s.branch,
                year_of_study=s.year_of_study,
                email=s.email,
                monthly_status=monthly_status,
                current_call_id=current_call_id,
                current_scheduled_date=current_scheduled_date,
                current_call_mode=current_call_mode,
                latest_wellbeing_score=latest_completed.wellbeing_score if latest_completed else None,
                latest_flag_status=latest_completed.flag_status if latest_completed else (call.flag_status if call else "Normal"),
                student_pre_notes=student_pre_notes,
                has_pre_notes=bool(student_pre_notes and student_pre_notes.strip()),
                past_calls_count=past_calls_count,
            )
        )

    return result


@router.get("/student/{student_id}/history", response_model=List[CheckinCallResponse], summary="Get full recorded call history for a student")
def get_student_history(
    student_id: int,
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise NotFoundError("Student not found")

    history = db.query(MonthlyCheckinCall).filter(
        MonthlyCheckinCall.student_id == student_id
    ).order_by(MonthlyCheckinCall.id.desc()).all()

    return history


@router.post("/calls/{call_id}/log", response_model=CheckinCallResponse, summary="Log mentor notes and record completed monthly check-in")
def log_checkin_call(
    call_id: int,
    log_data: CheckinCallLogRequest,
    db: Session = Depends(get_db),
):
    call = db.query(MonthlyCheckinCall).filter(MonthlyCheckinCall.id == call_id).first()
    if not call:
        raise NotFoundError("Check-in call not found")

    call.wellbeing_score = log_data.wellbeing_score
    call.mentor_notes = log_data.mentor_notes
    call.confidential_summary = log_data.confidential_summary
    call.flag_status = log_data.flag_status
    call.action_items = log_data.action_items
    call.completed_date = log_data.completed_date or datetime.now().strftime("%Y-%m-%d %H:%M")
    call.status = "Completed"

    db.commit()
    db.refresh(call)
    return call


@router.post("/schedule", response_model=CheckinCallResponse, summary="Schedule or reschedule a monthly check-in call")
def schedule_call(
    req: CheckinCallScheduleRequest,
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.id == req.student_id).first()
    if not student:
        raise NotFoundError("Student not found")

    mentor = _get_or_assign_mentor(student, db)
    if not mentor:
        raise ValidationError("Could not assign an academic mentor to this student")

    existing = db.query(MonthlyCheckinCall).filter(
        MonthlyCheckinCall.student_id == req.student_id,
        MonthlyCheckinCall.month_year == req.month_year,
    ).first()

    if existing:
        existing.scheduled_date = req.scheduled_date
        existing.call_mode = req.call_mode
        existing.meeting_link = req.meeting_link or existing.meeting_link
        existing.status = "Scheduled"
        db.commit()
        db.refresh(existing)
        return existing

    new_call = MonthlyCheckinCall(
        student_id=req.student_id,
        mentor_id=mentor.id,
        month_year=req.month_year,
        scheduled_date=req.scheduled_date,
        call_mode=req.call_mode,
        meeting_link=req.meeting_link or "https://meet.google.com/cohabit-mentor-call",
        status="Scheduled",
    )
    db.add(new_call)
    db.commit()
    db.refresh(new_call)
    return new_call
