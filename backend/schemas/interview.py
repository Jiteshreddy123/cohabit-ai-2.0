from pydantic import BaseModel
from typing import List, Dict

class InterviewMessageRequest(BaseModel):
    message: str

class InterviewMessageResponse(BaseModel):
    response: str
    is_complete: bool
    history: List[Dict]

class InterviewStartResponse(BaseModel):
    interview_id: int
    history: List[Dict]
