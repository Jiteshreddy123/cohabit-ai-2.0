"""Interview ORM model — maps to the 'interview' table."""

from sqlalchemy import Column, Integer, Text, TIMESTAMP, ForeignKey, func
from sqlalchemy.orm import relationship

from database import Base


class Interview(Base):
    __tablename__ = "interview"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(
        Integer, ForeignKey("student.id", ondelete="CASCADE"), nullable=False
    )
    conversation = Column(Text, nullable=False)
    completed_at = Column(TIMESTAMP, server_default=func.now())

    # ── Relationships ─────────────────────────────────────────
    student = relationship("Student", back_populates="interview")
