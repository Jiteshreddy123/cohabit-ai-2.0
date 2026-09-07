from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class CollegeBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr

class CollegeCreate(CollegeBase):
    password: str = Field(..., min_length=6)

class CollegeResponse(CollegeBase):
    id: int
    college_code: Optional[str] = None

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    college_code: Optional[str] = None
    student_id: Optional[int] = None
    student_name: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)
