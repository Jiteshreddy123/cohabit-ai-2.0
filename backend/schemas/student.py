from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Literal, Optional

class StudentBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    roll_number: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    branch: str = Field(..., min_length=1, max_length=100)
    year_of_study: int = Field(..., ge=1, le=5)
    gender: Literal["Male", "Female", "Other"]

class StudentCreate(StudentBase):
    college_id: Optional[int] = None
    allocation_session_id: int


class StudentResponse(StudentBase):
    id: int
    college_id: int
    allocation_session_id: int
    interview_status: str

    class Config:
        from_attributes = True

class StudentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    roll_number: Optional[str] = Field(None, min_length=1, max_length=50)
    email: Optional[EmailStr] = None
    branch: Optional[str] = Field(None, min_length=1, max_length=100)
    year_of_study: Optional[int] = Field(None, ge=1, le=5)
    gender: Optional[Literal["Male", "Female", "Other"]] = None
    allocation_session_id: Optional[int] = None

class StudentLoginRequest(BaseModel):
    college_code: str
    email: EmailStr
    password: str
