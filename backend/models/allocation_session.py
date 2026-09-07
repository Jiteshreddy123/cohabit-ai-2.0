"""AllocationSession ORM model — maps to the 'allocation_sessions' table.

room_inventory stores a JSON object mapping room capacity (as string key) to
the number of such rooms available in the hostel.

Example:
    {"2": 20, "3": 10, "4": 5}
    means: 20 double rooms, 10 triple rooms, 5 quad rooms.

This is the single source of truth for what rooms are physically available.
session_size is the number of students to allocate in this session.
"""

from sqlalchemy import Column, Integer, String, ForeignKey, CheckConstraint, JSON, Boolean
from sqlalchemy.orm import relationship

from database import Base


class AllocationSession(Base):
    __tablename__ = "allocation_sessions"

    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("college.id"), nullable=False)
    title = Column(String(255))
    academic_year = Column(String(50), nullable=False)

    # Number of students to allocate in this session
    session_size = Column(Integer, nullable=False)

    # Room inventory: {"2": 20, "3": 10} = 20 double rooms, 10 triple rooms
    room_inventory = Column(JSON, nullable=True, default={})

    session_status = Column(String(20), nullable=False, server_default="Draft")
    is_published = Column(Boolean, default=False)

    # ── Check Constraints ─────────────────────────────────────
    __table_args__ = (
        CheckConstraint(
            "session_status IN ('Draft', 'Active', 'Completed')",
            name="check_session_status",
        ),
    )

    # ── Relationships ─────────────────────────────────────────
    college = relationship("College", back_populates="allocation_sessions")
    students = relationship(
        "Student", back_populates="allocation_session", lazy="select"
    )
    recommendations = relationship(
        "Recommendation", back_populates="allocation_session", lazy="select"
    )

