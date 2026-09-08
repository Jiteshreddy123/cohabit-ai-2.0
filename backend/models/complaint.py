"""Complaint, ComplaintImage, and ComplaintUpdate ORM models."""

from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_code = Column(String(50), unique=True, index=True, nullable=False)

    student_id = Column(Integer, ForeignKey("student.id", ondelete="CASCADE"), nullable=False)
    college_id = Column(Integer, ForeignKey("college.id", ondelete="CASCADE"), nullable=False)
    hostel_id = Column(Integer, ForeignKey("hostels.id", ondelete="SET NULL"), nullable=True)

    category = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(255), nullable=False)  # e.g., "Hostel Block B, Room 304"

    # Priority: LOW | MEDIUM | HIGH | EMERGENCY
    priority = Column(String(20), nullable=False, default="MEDIUM")
    # Visibility: PRIVATE | PUBLIC
    visibility = Column(String(20), nullable=False, default="PRIVATE")
    # Status: NEW | UNDER_REVIEW | ASSIGNED | IN_PROGRESS | RESOLVED | REJECTED | REOPENED
    status = Column(String(30), nullable=False, default="NEW")

    assigned_to = Column(String(255), nullable=True)
    management_response = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # ── Constraints ────────────────────────────────────────────
    __table_args__ = (
        CheckConstraint(
            "priority IN ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY')",
            name="chk_complaint_priority",
        ),
        CheckConstraint(
            "visibility IN ('PRIVATE', 'PUBLIC')",
            name="chk_complaint_visibility",
        ),
        CheckConstraint(
            "status IN ('NEW', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'REOPENED')",
            name="chk_complaint_status",
        ),
    )

    # ── Relationships ──────────────────────────────────────────
    student = relationship("Student", backref="complaints")
    college = relationship("College", backref="complaints")
    hostel = relationship("Hostel", back_populates="complaints")
    images = relationship("ComplaintImage", back_populates="complaint", cascade="all, delete-orphan")
    updates = relationship(
        "ComplaintUpdate", back_populates="complaint", cascade="all, delete-orphan",
        order_by="ComplaintUpdate.created_at"
    )


class ComplaintImage(Base):
    __tablename__ = "complaint_images"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False)
    file_url = Column(Text, nullable=False)
    file_name = Column(String(255), nullable=True)
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String(100), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ── Relationships ──────────────────────────────────────────
    complaint = relationship("Complaint", back_populates="images")


class ComplaintUpdate(Base):
    __tablename__ = "complaint_updates"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False)

    author_role = Column(String(20), nullable=False)  # "admin" | "student"
    author_name = Column(String(255), nullable=True)
    old_status = Column(String(30), nullable=True)
    new_status = Column(String(30), nullable=True)
    note = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ── Relationships ──────────────────────────────────────────
    complaint = relationship("Complaint", back_populates="updates")
