"""
Academic Mentorship & Monthly Student Check-in Call ORM models.

Supports monthly 1-on-1 check-ins between students and academic mentors,
pre-call problem submissions by students, confidential mentor logs,
wellbeing scoring, and long-term recorded audit trails.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from database import Base


class AcademicMentor(Base):
    __tablename__ = "academic_mentors"

    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("college.id"), nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    department = Column(String(100), nullable=False)  # e.g., "Computer Science & Engineering"
    designation = Column(String(100), nullable=False) # e.g., "Associate Professor & Faculty Advisor"
    phone = Column(String(50), nullable=True)
    office_location = Column(String(255), nullable=True) # e.g., "Block B, Room 304"
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    college = relationship("College", foreign_keys=[college_id])
    mentees = relationship("Student", back_populates="mentor")
    checkin_calls = relationship("MonthlyCheckinCall", back_populates="mentor", cascade="all, delete-orphan")


class MonthlyCheckinCall(Base):
    __tablename__ = "monthly_checkin_calls"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student.id"), nullable=False)
    mentor_id = Column(Integer, ForeignKey("academic_mentors.id"), nullable=False)
    month_year = Column(String(50), nullable=False)  # e.g. "September 2026"
    scheduled_date = Column(String(100), nullable=False) # e.g. "2026-09-25 15:30"
    completed_date = Column(String(100), nullable=True)
    status = Column(String(30), default="Scheduled") # "Scheduled", "Completed", "Missed", "Rescheduled"
    call_mode = Column(String(50), default="Video Call") # "Video Call", "Voice Call", "In-Person Meeting"
    meeting_link = Column(String(500), nullable=True)

    # Student input (shared with mentor before/during the call)
    student_pre_notes = Column(Text, nullable=True)  # Problems faced, hostel life experience, struggles

    # Mentor recorded audit details
    mentor_notes = Column(Text, nullable=True)       # Academic progress, adjustment observations
    confidential_summary = Column(Text, nullable=True) # Confidential institutional log for future tracking
    wellbeing_score = Column(Integer, nullable=True) # 1 (Critical Distress) to 5 (Thriving)
    flag_status = Column(String(50), default="Normal") # "Normal", "Academic Risk", "Roommate / Hostel Distress", "Mental Health / Isolation"
    action_items = Column(Text, nullable=True)       # Agreed next steps for the upcoming month
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    student = relationship("Student", back_populates="mentor_calls")
    mentor = relationship("AcademicMentor", back_populates="checkin_calls")
