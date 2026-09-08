"""Review and ReviewImage ORM models — maps to 'reviews' and 'review_images' tables."""

from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student.id", ondelete="CASCADE"), nullable=False)
    college_id = Column(Integer, ForeignKey("college.id", ondelete="CASCADE"), nullable=False)
    hostel_id = Column(Integer, ForeignKey("hostels.id", ondelete="SET NULL"), nullable=True)

    category = Column(String(100), nullable=False, default="Hostel Facilities")
    rating = Column(Integer, nullable=False)  # 1 to 5
    title = Column(String(255), nullable=False)
    review_text = Column(Text, nullable=False)

    # Verification status: VERIFIED_STUDENT, PENDING_REVIEW, FLAGGED, REMOVED
    verification_status = Column(String(50), nullable=False, default="VERIFIED_STUDENT")
    # Moderation status: APPROVED, FLAGGED, REJECTED
    moderation_status = Column(String(50), nullable=False, default="APPROVED")
    flag_reason = Column(Text, nullable=True)
    helpful_count = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # ── Constraints ────────────────────────────────────────────
    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="chk_review_rating"),
        CheckConstraint(
            "verification_status IN ('VERIFIED_STUDENT', 'PENDING_REVIEW', 'FLAGGED', 'REMOVED')",
            name="chk_review_verification_status",
        ),
        CheckConstraint(
            "moderation_status IN ('APPROVED', 'FLAGGED', 'REJECTED')",
            name="chk_review_moderation_status",
        ),
    )

    # ── Relationships ──────────────────────────────────────────
    student = relationship("Student", backref="reviews")
    college = relationship("College", backref="reviews")
    hostel = relationship("Hostel", back_populates="reviews")
    images = relationship("ReviewImage", back_populates="review", cascade="all, delete-orphan")


class ReviewImage(Base):
    __tablename__ = "review_images"

    id = Column(Integer, primary_key=True, index=True)
    review_id = Column(Integer, ForeignKey("reviews.id", ondelete="CASCADE"), nullable=False)
    file_url = Column(Text, nullable=False)
    file_name = Column(String(255), nullable=True)
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String(100), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ── Relationships ──────────────────────────────────────────
    review = relationship("Review", back_populates="images")
