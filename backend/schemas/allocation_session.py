"""
Pydantic schemas for AllocationSession.

room_inventory is a dictionary mapping room capacity (as string) to the number
of rooms of that capacity available.

Example:
    {"2": 20, "3": 10}
    → 20 double rooms and 10 triple rooms = 70 total beds

Validation ensures:
  - Keys must be integers 1-5
  - Values must be positive integers
  - Total bed capacity must be >= session_size (enough beds for all students)
"""

from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, Dict
import re


class AllocationSessionBase(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    academic_year: str = Field(..., description="Academic year format e.g. 2024-2025")
    session_size: int = Field(..., gt=0, description="Number of students to allocate")
    room_inventory: Optional[Dict[str, int]] = Field(
        None,
        description="Map of room capacity to number of rooms. e.g. {'2': 20, '3': 10}"
    )

    @field_validator("academic_year")
    @classmethod
    def validate_academic_year(cls, v: str) -> str:
        pattern = r"^\d{4}(-\d{2,4})?$"
        if not re.match(pattern, v):
            raise ValueError("Academic year must be in format YYYY or YYYY-YY or YYYY-YYYY")
        return v

    @field_validator("room_inventory")
    @classmethod
    def validate_room_inventory(cls, v: Optional[Dict[str, int]]) -> Optional[Dict[str, int]]:
        if v is None:
            return v
        for key, count in v.items():
            try:
                capacity = int(key)
                if capacity < 1 or capacity > 5:
                    raise ValueError(f"Room capacity key '{key}' must be between 1 and 5")
            except (ValueError, TypeError):
                raise ValueError(f"Room inventory key '{key}' must be an integer string (e.g. '2')")
            if count < 0:
                raise ValueError(f"Room count for capacity '{key}' must be non-negative")
        return v

    @model_validator(mode="after")
    def validate_inventory_capacity(self) -> "AllocationSessionBase":
        """Ensure total available beds >= session_size if inventory is provided."""
        if self.room_inventory:
            total_beds = sum(int(k) * v for k, v in self.room_inventory.items())
            if total_beds < self.session_size:
                raise ValueError(
                    f"Total hostel capacity ({total_beds} beds) is less than "
                    f"session size ({self.session_size} students). "
                    f"Add more rooms or reduce the student count."
                )
        return self


class AllocationSessionCreate(AllocationSessionBase):
    college_id: Optional[int] = None


class AllocationSessionResponse(AllocationSessionBase):
    id: int
    college_id: int
    session_status: str
    is_published: bool

    class Config:
        from_attributes = True


class RoomInventoryUpdate(BaseModel):
    room_inventory: Dict[str, int] = Field(
        ...,
        description="Updated room inventory. e.g. {'2': 20, '3': 10}"
    )

    @field_validator("room_inventory")
    @classmethod
    def validate_inventory(cls, v: Dict[str, int]) -> Dict[str, int]:
        for key, count in v.items():
            try:
                capacity = int(key)
                if capacity < 1 or capacity > 5:
                    raise ValueError(f"Room capacity key must be between 1 and 5, got '{key}'")
            except (ValueError, TypeError):
                raise ValueError(f"Room inventory key '{key}' must be an integer string")
            if count < 0:
                raise ValueError(f"Room count must be non-negative, got {count}")
        return v


class SessionStatusUpdate(BaseModel):
    session_status: str = Field(..., description="New status: Draft, Active, or Completed")

    @field_validator("session_status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"Draft", "Active", "Completed"}
        if v not in allowed:
            raise ValueError(f"Status must be one of: {', '.join(allowed)}")
        return v

