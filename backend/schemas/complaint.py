"""Pydantic schemas for Complaints, Evidence, and Activity Updates."""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class ComplaintImageResponse(BaseModel):
    id: int
    file_url: str
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ComplaintUpdateResponse(BaseModel):
    id: int
    author_role: str
    author_name: Optional[str] = None
    old_status: Optional[str] = None
    new_status: Optional[str] = None
    note: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ComplaintCreate(BaseModel):
    hostel_id: Optional[int] = None
    category: str = Field(min_length=2, max_length=100)
    title: str = Field(min_length=3, max_length=255)
    description: str = Field(min_length=10, max_length=3000)
    location: str = Field(min_length=2, max_length=255)
    priority: str = Field(default="MEDIUM")  # LOW | MEDIUM | HIGH | EMERGENCY
    visibility: str = Field(default="PRIVATE")  # PRIVATE | PUBLIC


class ComplaintUpdate(BaseModel):
    category: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    priority: Optional[str] = None
    visibility: Optional[str] = None


class ComplaintStatusUpdate(BaseModel):
    status: str  # NEW | UNDER_REVIEW | ASSIGNED | IN_PROGRESS | RESOLVED | REJECTED | REOPENED
    assigned_to: Optional[str] = None
    management_response: Optional[str] = None
    rejection_reason: Optional[str] = None


class ComplaintReopenRequest(BaseModel):
    reason: str = Field(min_length=5, max_length=1000)


class ComplaintResponse(BaseModel):
    id: int
    complaint_code: str
    student_id: int
    student_name: Optional[str] = None
    student_roll: Optional[str] = None
    student_branch: Optional[str] = None
    student_year: Optional[int] = None

    college_id: int
    college_name: Optional[str] = None
    hostel_id: Optional[int] = None
    hostel_name: Optional[str] = None

    category: str
    title: str
    description: str
    location: str
    priority: str
    visibility: str
    status: str

    assigned_to: Optional[str] = None
    management_response: Optional[str] = None
    rejection_reason: Optional[str] = None

    images: List[ComplaintImageResponse] = []
    updates: List[ComplaintUpdateResponse] = []

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PublicComplaintResponse(BaseModel):
    id: int
    complaint_code: str
    category: str
    title: str
    description: Optional[str] = None
    location: str
    priority: str
    status: str
    college_id: int
    college_name: Optional[str] = None
    hostel_id: Optional[int] = None
    hostel_name: Optional[str] = None
    created_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
