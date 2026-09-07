"""In-App Privacy Chat routes.

Privacy guarantees enforced at the API layer:
- Responses include sender_name ONLY — never email, roll_number, or phone.
- Students can only read conversations they are part of.
- No PII is ever serialised into a ChatMessageResponse or ConversationResponse.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models.chat import ChatConversation, ChatMessage
from models.marketplace import MarketplaceListing
from models.microgig import MicroGig
from models.student import Student
from schemas.chat import (
    ChatMessageCreate,
    ChatMessageResponse,
    ConversationStartRequest,
    ConversationResponse,
)
from routes.auth import get_current_student
from utils.exceptions import NotFoundError, AuthenticationError, ValidationError

router = APIRouter(prefix="/chat", tags=["Chat"])


# ── Helpers ────────────────────────────────────────────────────────────────────

def _build_conv_response(conv: ChatConversation, me_id: int) -> ConversationResponse:
    """Build a ConversationResponse, resolving the 'other' participant's name safely."""
    other = conv.student2 if conv.student1_id == me_id else conv.student1
    last_msg = conv.messages[-1] if conv.messages else None
    return ConversationResponse(
        id=conv.id,
        student1_id=conv.student1_id,
        student2_id=conv.student2_id,
        listing_id=conv.listing_id,
        gig_id=conv.gig_id,
        created_at=conv.created_at,
        other_student_name=other.name if other else "Unknown",
        listing_title=conv.listing.title if conv.listing else None,
        gig_title=conv.gig.title if conv.gig else None,
        last_message=last_msg.message if last_msg else None,
        last_message_at=last_msg.sent_at if last_msg else None,
    )


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.post(
    "/start",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Start or retrieve an existing conversation",
    description=(
        "Opens a conversation between the current student and another student, "
        "optionally linked to a marketplace listing or micro-gig. "
        "If a matching conversation already exists, it is returned instead of creating a duplicate."
    ),
)
def start_conversation(
    body: ConversationStartRequest,
    db: Session = Depends(get_db),
    current_student=Depends(get_current_student),
):
    me = current_student.id
    other_id = body.other_student_id

    if other_id == me:
        raise ValidationError("You cannot start a conversation with yourself")

    # Verify the other student exists
    other = db.query(Student).filter(Student.id == other_id).first()
    if not other:
        raise NotFoundError("The student you are trying to contact was not found")

    # Normalise pair so student1 is always the smaller ID (deduplication)
    s1, s2 = (me, other_id) if me < other_id else (other_id, me)

    # Check for an existing conversation about the same item / gig
    existing = None
    if body.listing_id:
        existing = (
            db.query(ChatConversation)
            .filter(
                ChatConversation.student1_id == s1,
                ChatConversation.student2_id == s2,
                ChatConversation.listing_id == body.listing_id,
            )
            .first()
        )
    elif body.gig_id:
        existing = (
            db.query(ChatConversation)
            .filter(
                ChatConversation.student1_id == s1,
                ChatConversation.student2_id == s2,
                ChatConversation.gig_id == body.gig_id,
            )
            .first()
        )

    if existing:
        return _build_conv_response(existing, me)

    conv = ChatConversation(
        student1_id=s1,
        student2_id=s2,
        listing_id=body.listing_id,
        gig_id=body.gig_id,
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return _build_conv_response(conv, me)


@router.get(
    "/conversations",
    response_model=List[ConversationResponse],
    summary="List all my conversations",
)
def list_conversations(
    db: Session = Depends(get_db),
    current_student=Depends(get_current_student),
):
    me = current_student.id
    convs = (
        db.query(ChatConversation)
        .filter(
            (ChatConversation.student1_id == me) | (ChatConversation.student2_id == me)
        )
        .order_by(ChatConversation.created_at.desc())
        .all()
    )
    return [_build_conv_response(c, me) for c in convs]


@router.get(
    "/conversations/{conv_id}/messages",
    response_model=List[ChatMessageResponse],
    summary="Get all messages in a conversation",
)
def get_messages(
    conv_id: int,
    db: Session = Depends(get_db),
    current_student=Depends(get_current_student),
):
    me = current_student.id
    conv = db.query(ChatConversation).filter(ChatConversation.id == conv_id).first()
    if not conv:
        raise NotFoundError("Conversation not found")
    if conv.student1_id != me and conv.student2_id != me:
        raise AuthenticationError("You are not part of this conversation")

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conv_id)
        .order_by(ChatMessage.sent_at.asc())
        .all()
    )

    return [
        ChatMessageResponse(
            id=m.id,
            conversation_id=m.conversation_id,
            sender_id=m.sender_id,
            sender_name=m.sender.name if m.sender else "Unknown",   # name only — no PII
            message=m.message,
            sent_at=m.sent_at,
        )
        for m in messages
    ]


@router.post(
    "/conversations/{conv_id}/messages",
    response_model=ChatMessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Send a message in a conversation",
)
def send_message(
    conv_id: int,
    body: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_student=Depends(get_current_student),
):
    me = current_student.id
    conv = db.query(ChatConversation).filter(ChatConversation.id == conv_id).first()
    if not conv:
        raise NotFoundError("Conversation not found")
    if conv.student1_id != me and conv.student2_id != me:
        raise AuthenticationError("You are not part of this conversation")

    msg = ChatMessage(
        conversation_id=conv_id,
        sender_id=me,
        message=body.message,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    return ChatMessageResponse(
        id=msg.id,
        conversation_id=msg.conversation_id,
        sender_id=msg.sender_id,
        sender_name=current_student.name,
        message=msg.message,
        sent_at=msg.sent_at,
    )
