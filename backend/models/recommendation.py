"""Recommendation ORM model — maps to the 'recommendations' table."""

from sqlalchemy import (
    Column, Integer, String, Float, Text, ForeignKey, CheckConstraint,
)
from sqlalchemy.orm import relationship

from database import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    allocation_session_id = Column(
        Integer,
        ForeignKey("allocation_sessions.id", ondelete="CASCADE"),
        nullable=False,
    )
    room_number = Column(String(50), nullable=False)
    compatibility_score = Column(Float, nullable=False)
    reason = Column(Text, nullable=False)

    # ── Constraints ───────────────────────────────────────────
    __table_args__ = (
        CheckConstraint(
            "compatibility_score >= 0 AND compatibility_score <= 100",
            name="chk_compatibility_score",
        ),
    )

    # ── Relationships ─────────────────────────────────────────
    allocation_session = relationship(
        "AllocationSession", back_populates="recommendations"
    )
    members = relationship(
        "RecommendationMember", back_populates="recommendation",
        cascade="all, delete-orphan"
    )
