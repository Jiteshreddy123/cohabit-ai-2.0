"""
Hos-Clubs (Hostel Clubs & Committees) ORM models.

Supports mandatory student engagement tracking, club categories (dance, singing,
academics, social service, sports, committees), and club activities.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from database import Base


class HosClub(Base):
    __tablename__ = "hos_clubs"

    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("college.id"), nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # Cultural & Arts, Academics & Tech, Social Service, Sports & Fitness, Hostel Committees
    tagline = Column(String(255), nullable=True)
    description = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=True)
    faculty_advisor = Column(String(255), nullable=True)
    student_lead = Column(String(255), nullable=True)
    meeting_schedule = Column(String(255), nullable=True)  # e.g., "Wed & Fri, 5:30 PM"
    venue = Column(String(255), nullable=True)            # e.g., "Student Activity Center Room 204"
    is_mandatory_eligible = Column(Boolean, default=True)  # Fulfills mandatory campus engagement requirement
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    college = relationship("College", foreign_keys=[college_id])
    memberships = relationship("HosClubMembership", back_populates="club", cascade="all, delete-orphan")
    activities = relationship("HosClubActivity", back_populates="club", cascade="all, delete-orphan")


class HosClubMembership(Base):
    __tablename__ = "hos_club_memberships"

    id = Column(Integer, primary_key=True, index=True)
    club_id = Column(Integer, ForeignKey("hos_clubs.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("student.id"), nullable=False)
    role = Column(String(50), default="Member")  # Member, Core Team, Lead
    joined_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    club = relationship("HosClub", back_populates="memberships")
    student = relationship("Student", back_populates="club_memberships")


class HosClubActivity(Base):
    __tablename__ = "hos_club_activities"

    id = Column(Integer, primary_key=True, index=True)
    club_id = Column(Integer, ForeignKey("hos_clubs.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    event_date = Column(String(100), nullable=False)  # e.g. "Friday, Oct 10 · 6:00 PM"
    venue = Column(String(255), nullable=False)
    event_type = Column(String(50), default="Meetup")  # Workshop, Rehearsal, Competition, Outreach, Meetup
    rsvp_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    club = relationship("HosClub", back_populates="activities")
