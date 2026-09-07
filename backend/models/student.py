"""Student ORM model — maps to the 'student' table."""

from sqlalchemy import Column, Integer, String, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship

from database import Base


class Student(Base):
    __tablename__ = "student"

    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("college.id"), nullable=False)
    allocation_session_id = Column(
        Integer, ForeignKey("allocation_sessions.id"), nullable=False
    )
    name = Column(String(255), nullable=False)
    roll_number = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    branch = Column(String(100), nullable=False)
    year_of_study = Column(Integer, nullable=False)
    gender = Column(String(10), nullable=False)
    password = Column(String(255), nullable=True)
    interview_status = Column(String(20), default="Pending")

    # ── Check Constraints ─────────────────────────────────────
    __table_args__ = (
        CheckConstraint(
            "gender IN ('Male', 'Female', 'Other')",
            name="check_gender",
        ),
    )

    # ── Relationships ─────────────────────────────────────────
    college = relationship("College", back_populates="students")
    allocation_session = relationship(
        "AllocationSession", back_populates="students"
    )
    interview = relationship(
        "Interview", back_populates="student", uselist=False,
        cascade="all, delete-orphan"
    )
    traits = relationship(
        "Traits", back_populates="student", uselist=False,
        cascade="all, delete-orphan"
    )
    recommendation_memberships = relationship(
        "RecommendationMember", back_populates="student",
        cascade="all, delete-orphan"
    )
