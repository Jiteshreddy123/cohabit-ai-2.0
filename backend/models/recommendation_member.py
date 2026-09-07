"""RecommendationMember ORM model — maps to the 'recommendation_members' table."""

from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from database import Base


class RecommendationMember(Base):
    __tablename__ = "recommendation_members"

    id = Column(Integer, primary_key=True, index=True)
    recommendation_id = Column(
        Integer,
        ForeignKey("recommendations.id", ondelete="CASCADE"),
        nullable=False,
    )
    student_id = Column(
        Integer,
        ForeignKey("student.id", ondelete="CASCADE"),
        nullable=False,
    )

    # ── Constraints ───────────────────────────────────────────
    __table_args__ = (
        UniqueConstraint(
            "recommendation_id", "student_id",
            name="unique_room_student",
        ),
    )

    # ── Relationships ─────────────────────────────────────────
    recommendation = relationship(
        "Recommendation", back_populates="members"
    )
    student = relationship(
        "Student", back_populates="recommendation_memberships"
    )
