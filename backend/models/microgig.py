"""MicroGig ORM model — maps to the 'micro_gigs' table.

Gigs automatically expire 48 hours after creation.
The backend never deletes them; it simply filters WHERE expires_at > NOW().
"""

from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, CheckConstraint, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime, timedelta, timezone

from database import Base


def _default_expiry():
    return datetime.now(timezone.utc) + timedelta(hours=48)


class MicroGig(Base):
    __tablename__ = "micro_gigs"

    id = Column(Integer, primary_key=True, index=True)
    poster_id = Column(Integer, ForeignKey("student.id", ondelete="CASCADE"), nullable=False)
    college_id = Column(Integer, ForeignKey("college.id", ondelete="CASCADE"), nullable=False)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    # Reward can be a rupee amount (store as float) or 0 for "favour"
    reward = Column(Float, nullable=False, default=0.0)
    reward_type = Column(String(10), nullable=False, default="money")   # money | favour
    category = Column(String(100), nullable=False, default="General")

    status = Column(String(20), nullable=False, default="open")  # open | accepted | expired
    accepted_by = Column(Integer, ForeignKey("student.id", ondelete="SET NULL"), nullable=True)

    expires_at = Column(DateTime(timezone=True), nullable=False, default=_default_expiry)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ── Constraints ────────────────────────────────────────────
    __table_args__ = (
        CheckConstraint(
            "status IN ('open', 'accepted', 'expired')",
            name="chk_gig_status",
        ),
        CheckConstraint(
            "reward_type IN ('money', 'favour')",
            name="chk_gig_reward_type",
        ),
    )

    # ── Relationships ──────────────────────────────────────────
    poster = relationship("Student", foreign_keys=[poster_id], backref="posted_gigs")
    acceptor = relationship("Student", foreign_keys=[accepted_by], backref="accepted_gigs")
    college = relationship("College", backref="micro_gigs")
    chat_conversations = relationship(
        "ChatConversation", back_populates="gig", cascade="all, delete-orphan"
    )
