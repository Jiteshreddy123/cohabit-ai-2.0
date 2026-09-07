"""CompatibilityScore ORM model — maps to the 'compatibility_score' table."""

from sqlalchemy import (
    Column, Integer, Numeric, TIMESTAMP, ForeignKey,
    CheckConstraint, UniqueConstraint, func,
)
from sqlalchemy.orm import relationship

from database import Base


class CompatibilityScore(Base):
    __tablename__ = "compatibility_score"

    id = Column(Integer, primary_key=True, index=True)
    allocation_session_id = Column(
        Integer,
        ForeignKey("allocation_sessions.id", ondelete="CASCADE"),
        nullable=False,
    )
    student1_id = Column(
        Integer,
        ForeignKey("student.id", ondelete="CASCADE"),
        nullable=False,
    )
    student2_id = Column(
        Integer,
        ForeignKey("student.id", ondelete="CASCADE"),
        nullable=False,
    )
    compatibility_score = Column(Numeric(5, 2), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # ── Constraints ───────────────────────────────────────────
    __table_args__ = (
        CheckConstraint(
            "student1_id <> student2_id",
            name="chk_different_students",
        ),
        UniqueConstraint(
            "allocation_session_id", "student1_id", "student2_id",
            name="uq_session_student_pair",
        ),
    )

    # ── Relationships ─────────────────────────────────────────
    student1 = relationship(
        "Student", foreign_keys=[student1_id]
    )
    student2 = relationship(
        "Student", foreign_keys=[student2_id]
    )
