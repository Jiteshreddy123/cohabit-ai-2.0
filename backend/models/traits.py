"""Traits ORM model — maps to the 'traits' table.

preferred_room_size is extracted from the AI interview.
It is the student's stated preference for room capacity (1=single, 2=double, etc.)
and acts as a HARD CONSTRAINT in the room allocation optimizer.
"""

from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class Traits(Base):
    __tablename__ = "traits"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(
        Integer,
        ForeignKey("student.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,  # One trait profile per student
    )
    sleep_time = Column(String(100))
    wake_time = Column(String(100))
    study_style = Column(String(255))
    noise_tolerance = Column(Float, nullable=False)
    cleanliness = Column(Float, nullable=False)
    social_level = Column(Float, nullable=False)

    # Hard constraint: student's preferred room size (1=single, 2=double, 3=triple, 4=quad)
    # Extracted from the AI interview, not entered manually.
    preferred_room_size = Column(Integer, nullable=True)

    flexible_preferences = Column(Text)
    non_negotiable_preferences = Column(Text)
    personality_summary = Column(Text)

    # ── Relationships ─────────────────────────────────────────
    student = relationship("Student", back_populates="traits")

