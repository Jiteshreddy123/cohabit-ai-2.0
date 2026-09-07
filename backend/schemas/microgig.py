"""Pydantic schemas for Micro-Gigs."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class MicroGigCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    reward: float = Field(default=0.0, ge=0)
    reward_type: str = Field(default="money", pattern="^(money|favour)$")
    category: str = Field(default="General", max_length=100)


class MicroGigResponse(BaseModel):
    id: int
    poster_id: int
    college_id: int
    title: str
    description: Optional[str]
    reward: float
    reward_type: str
    category: str
    status: str
    accepted_by: Optional[int]
    expires_at: datetime
    created_at: datetime
    # Poster display info — NO email, NO phone
    poster_name: Optional[str] = None
    acceptor_name: Optional[str] = None

    model_config = {"from_attributes": True}
