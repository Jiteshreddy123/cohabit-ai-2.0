"""Pydantic schemas for Reviews and Review Evidence."""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class ReviewImageResponse(BaseModel):
    id: int
    file_url: str
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ReviewCreate(BaseModel):
    hostel_id: Optional[int] = None
    category: str = Field(default="Hostel Facilities", min_length=2, max_length=100)
    rating: int = Field(ge=1, le=5)
    title: str = Field(min_length=3, max_length=255)
    review_text: str = Field(min_length=10, max_length=2000)


class ReviewUpdate(BaseModel):
    category: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    title: Optional[str] = None
    review_text: Optional[str] = None


class ReviewFlagRequest(BaseModel):
    reason: str = Field(min_length=5, max_length=500)


class ReviewResponse(BaseModel):
    id: int
    college_id: int
    college_name: Optional[str] = None
    hostel_id: Optional[int] = None
    hostel_name: Optional[str] = None

    category: str
    rating: int
    title: str
    review_text: str

    verification_status: str  # VERIFIED_STUDENT | PENDING_REVIEW | FLAGGED | REMOVED
    moderation_status: str    # APPROVED | FLAGGED | REJECTED
    helpful_count: int = 0
    is_verified_student: bool = True
    reviewer_badge: str = "Verified Student"

    # Privacy protected: is_owner is set dynamically based on requesting user
    is_owner: bool = False

    images: List[ReviewImageResponse] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
