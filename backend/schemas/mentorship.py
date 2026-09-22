"""
Pydantic schemas for Academic Mentorship & Monthly Student Check-in Calls.
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class AcademicMentorResponse(BaseModel):
    id: int
    college_id: int
    name: str
    email: str
    department: str
    designation: str
    phone: Optional[str] = None
    office_location: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None

    class Config:
        from_attributes = True


class PreNotesRequest(BaseModel):
    student_pre_notes: str


class CheckinCallLogRequest(BaseModel):
    wellbeing_score: int  # 1 to 5
    mentor_notes: str
    confidential_summary: Optional[str] = None
    flag_status: str = "Normal"  # Normal, Academic Risk, Roommate / Hostel Distress, Mental Health / Isolation
    action_items: Optional[str] = None
    completed_date: Optional[str] = None


class CheckinCallScheduleRequest(BaseModel):
    student_id: int
    month_year: str
    scheduled_date: str
    call_mode: str = "Video Call"
    meeting_link: Optional[str] = None


class CheckinCallResponse(BaseModel):
    id: int
    student_id: int
    mentor_id: int
    month_year: str
    scheduled_date: str
    completed_date: Optional[str] = None
    status: str
    call_mode: str
    meeting_link: Optional[str] = None
    student_pre_notes: Optional[str] = None
    mentor_notes: Optional[str] = None
    confidential_summary: Optional[str] = None
    wellbeing_score: Optional[int] = None
    flag_status: Optional[str] = "Normal"
    action_items: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StudentMentorshipProfileResponse(BaseModel):
    mentor: Optional[AcademicMentorResponse] = None
    current_call: Optional[CheckinCallResponse] = None
    history: List[CheckinCallResponse] = []


class MenteeItemResponse(BaseModel):
    student_id: int
    name: str
    roll_number: str
    branch: str
    year_of_study: int
    email: str
    monthly_status: str  # "Completed", "Scheduled", "Pending Log", "Not Scheduled"
    current_call_id: Optional[int] = None
    current_scheduled_date: Optional[str] = None
    current_call_mode: Optional[str] = None
    latest_wellbeing_score: Optional[int] = None
    latest_flag_status: Optional[str] = "Normal"
    student_pre_notes: Optional[str] = None
    has_pre_notes: bool = False
    past_calls_count: int = 0
