"""Pydantic schemas for In-App Privacy Chat.

Key privacy rule: ChatMessageResponse and ConversationResponse never expose
email, phone number, or roll_number of any participant.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ChatMessageCreate(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)


class ChatMessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    sender_name: str          # Only name — never email/phone
    message: str
    sent_at: datetime

    model_config = {"from_attributes": True}


class ConversationStartRequest(BaseModel):
    other_student_id: int
    listing_id: Optional[int] = None
    gig_id: Optional[int] = None


class ConversationResponse(BaseModel):
    id: int
    student1_id: int
    student2_id: int
    listing_id: Optional[int]
    gig_id: Optional[int]
    created_at: datetime
    # Display-safe partner info
    other_student_name: Optional[str] = None
    listing_title: Optional[str] = None
    gig_title: Optional[str] = None
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
