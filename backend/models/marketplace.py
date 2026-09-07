"""Marketplace Listing ORM model — maps to the 'marketplace_listings' table."""

from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, CheckConstraint, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class MarketplaceListing(Base):
    __tablename__ = "marketplace_listings"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student.id", ondelete="CASCADE"), nullable=False)
    college_id = Column(Integer, ForeignKey("college.id", ondelete="CASCADE"), nullable=False)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    condition = Column(String(20), nullable=False, default="Good")
    category = Column(String(100), nullable=False, default="Other")
    image_url = Column(Text, nullable=True)
    listing_type = Column(String(10), nullable=False, default="sell")  # sell | rent
    status = Column(String(20), nullable=False, default="available")   # available | sold | removed

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ── Constraints ────────────────────────────────────────────
    __table_args__ = (
        CheckConstraint(
            "condition IN ('New', 'Good', 'Fair')",
            name="chk_listing_condition",
        ),
        CheckConstraint(
            "status IN ('available', 'sold', 'removed')",
            name="chk_listing_status",
        ),
        CheckConstraint(
            "listing_type IN ('sell', 'rent')",
            name="chk_listing_type",
        ),
    )

    # ── Relationships ──────────────────────────────────────────
    student = relationship("Student", backref="marketplace_listings")
    college = relationship("College", backref="marketplace_listings")
    chat_conversations = relationship(
        "ChatConversation", back_populates="listing", cascade="all, delete-orphan"
    )
