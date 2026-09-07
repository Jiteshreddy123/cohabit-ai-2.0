"""Chat ORM models — maps to 'chat_conversations' and 'chat_messages' tables.

Privacy-first design:
- API responses only return sender_name, never email, phone, or roll_number.
- A conversation links two students optionally to a listing or gig.
"""

from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class ChatConversation(Base):
    __tablename__ = "chat_conversations"

    id = Column(Integer, primary_key=True, index=True)
    student1_id = Column(Integer, ForeignKey("student.id", ondelete="CASCADE"), nullable=False)
    student2_id = Column(Integer, ForeignKey("student.id", ondelete="CASCADE"), nullable=False)

    # Optional context — conversation started from a listing or a gig
    listing_id = Column(
        Integer, ForeignKey("marketplace_listings.id", ondelete="SET NULL"), nullable=True
    )
    gig_id = Column(
        Integer, ForeignKey("micro_gigs.id", ondelete="SET NULL"), nullable=True
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        # Prevent duplicate conversations about the same item between the same pair
        UniqueConstraint("student1_id", "student2_id", "listing_id", name="uq_conv_listing"),
        UniqueConstraint("student1_id", "student2_id", "gig_id", name="uq_conv_gig"),
    )

    # ── Relationships ──────────────────────────────────────────
    student1 = relationship("Student", foreign_keys=[student1_id])
    student2 = relationship("Student", foreign_keys=[student2_id])
    listing = relationship("MarketplaceListing", back_populates="chat_conversations")
    gig = relationship("MicroGig", back_populates="chat_conversations")
    messages = relationship(
        "ChatMessage", back_populates="conversation", cascade="all, delete-orphan",
        order_by="ChatMessage.sent_at"
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(
        Integer, ForeignKey("chat_conversations.id", ondelete="CASCADE"), nullable=False
    )
    sender_id = Column(Integer, ForeignKey("student.id", ondelete="CASCADE"), nullable=False)
    message = Column(Text, nullable=False)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())

    # ── Relationships ──────────────────────────────────────────
    conversation = relationship("ChatConversation", back_populates="messages")
    sender = relationship("Student", foreign_keys=[sender_id])
