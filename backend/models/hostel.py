"""Hostel ORM model — maps to the 'hostels' table."""

from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class Hostel(Base):
    __tablename__ = "hostels"

    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("college.id", ondelete="CASCADE"), nullable=False)

    name = Column(String(255), nullable=False)
    gender = Column(String(20), nullable=False, default="Co-ed")  # Male | Female | Co-ed
    hostel_type = Column(String(20), nullable=False, default="Both")  # AC | Non-AC | Both
    room_types = Column(JSON, nullable=True, default=["Single", "Double", "Triple"])
    facilities = Column(JSON, nullable=True, default=[
        "Wi-Fi", "Mess", "Laundry", "Study Room", "24/7 Power Backup", "Water Purifier", "Security"
    ])
    fee_structure = Column(String(255), nullable=True, default="₹75,000 - ₹95,000 / year")
    total_capacity = Column(Integer, nullable=False, default=150)
    description = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ── Relationships ──────────────────────────────────────────
    college = relationship("College", backref="hostels")
    reviews = relationship("Review", back_populates="hostel", cascade="all, delete-orphan")
    complaints = relationship("Complaint", back_populates="hostel")
