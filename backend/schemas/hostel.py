"""Pydantic schemas for Hostel and Discovery data."""

from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime


class HostelBase(BaseModel):
    name: str
    gender: str = "Co-ed"
    hostel_type: str = "Both"  # AC | Non-AC | Both
    room_types: Optional[List[str]] = ["Single", "Double", "Triple"]
    facilities: Optional[List[str]] = [
        "Wi-Fi", "Mess", "Laundry", "Study Room", "24/7 Power Backup", "Water Purifier", "Security"
    ]
    fee_structure: Optional[str] = "₹75,000 - ₹95,000 / year"
    total_capacity: int = 150
    description: Optional[str] = None
    image_url: Optional[str] = None


class HostelCreate(HostelBase):
    college_id: Optional[int] = None


class HostelUpdate(BaseModel):
    name: Optional[str] = None
    gender: Optional[str] = None
    hostel_type: Optional[str] = None
    room_types: Optional[List[str]] = None
    facilities: Optional[List[str]] = None
    fee_structure: Optional[str] = None
    total_capacity: Optional[int] = None
    description: Optional[str] = None
    image_url: Optional[str] = None


class HostelResponse(HostelBase):
    id: int
    college_id: int
    college_name: Optional[str] = None
    college_city: Optional[str] = None
    average_rating: float = 0.0
    total_reviews: int = 0
    resolved_issues_count: int = 0
    open_issues_count: int = 0
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CollegeDiscoverResponse(BaseModel):
    id: int
    name: str
    location: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    total_hostels: int = 0
    average_rating: float = 0.0
    total_reviews: int = 0
    total_complaints_resolved: int = 0
    hostels: List[HostelResponse] = []

    model_config = ConfigDict(from_attributes=True)
