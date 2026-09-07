"""Pydantic schemas for Marketplace Listings."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class MarketplaceListingCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    price: float = Field(..., ge=0)
    condition: str = Field(default="Good", pattern="^(New|Good|Fair)$")
    category: str = Field(default="Other", max_length=100)
    image_url: Optional[str] = None
    listing_type: str = Field(default="sell", pattern="^(sell|rent)$")


class MarketplaceListingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    condition: Optional[str] = Field(None, pattern="^(New|Good|Fair)$")
    category: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(available|sold|removed)$")


class MarketplaceListingResponse(BaseModel):
    id: int
    student_id: int
    college_id: int
    title: str
    description: Optional[str]
    price: float
    condition: str
    category: str
    image_url: Optional[str]
    listing_type: str
    status: str
    created_at: datetime
    # Seller display info — NO email, NO phone, NO roll_number
    seller_name: Optional[str] = None

    model_config = {"from_attributes": True}
