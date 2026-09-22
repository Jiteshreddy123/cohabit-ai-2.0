"""
Pydantic schemas for Hos-Clubs (Hostel Clubs & Committees).
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ClubActivityBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: str
    venue: str
    event_type: str = "Meetup"


class ClubActivityCreate(ClubActivityBase):
    pass


class ClubActivityResponse(ClubActivityBase):
    id: int
    club_id: int
    rsvp_count: int = 0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ClubBase(BaseModel):
    name: str
    category: str  # Cultural & Arts, Academics & Tech, Social Service, Sports & Fitness, Hostel Committees
    tagline: Optional[str] = None
    description: str
    image_url: Optional[str] = None
    faculty_advisor: Optional[str] = None
    student_lead: Optional[str] = None
    meeting_schedule: Optional[str] = None
    venue: Optional[str] = None
    is_mandatory_eligible: bool = True


class ClubCreate(ClubBase):
    pass


class ClubResponse(ClubBase):
    id: int
    college_id: int
    created_at: Optional[datetime] = None
    member_count: int = 0
    is_enrolled: bool = False
    student_role: Optional[str] = None

    class Config:
        from_attributes = True


class ClubDetailResponse(ClubResponse):
    activities: List[ClubActivityResponse] = []


class EngagementStatusResponse(BaseModel):
    is_compliant: bool
    enrolled_count: int
    minimum_required: int = 1
    status_label: str # "Compliant", "Action Required", "Campus Star"
    status_color: str # "emerald", "amber", "purple"
    message: str
    enrolled_clubs: List[ClubResponse] = []
