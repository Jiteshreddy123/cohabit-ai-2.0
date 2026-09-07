from pydantic import BaseModel
from typing import List, Optional
from schemas.student import StudentResponse

class RecommendationMemberResponse(BaseModel):
    id: int
    recommendation_id: int
    student_id: int
    student: StudentResponse

    class Config:
        from_attributes = True

class RecommendationResponse(BaseModel):
    id: int
    allocation_session_id: int
    room_number: str
    compatibility_score: float
    reason: str
    members: List[RecommendationMemberResponse] = []

    class Config:
        from_attributes = True
