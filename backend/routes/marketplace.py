"""Marketplace routes — campus-scoped item listings.

All listings are automatically filtered by the requesting student's college_id,
so students can only ever see items on their own campus.
"""

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from database import get_db
from models.marketplace import MarketplaceListing
from schemas.marketplace import (
    MarketplaceListingCreate,
    MarketplaceListingUpdate,
    MarketplaceListingResponse,
)
from routes.auth import get_current_student
from utils.exceptions import NotFoundError, AuthenticationError

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])


def _to_response(listing: MarketplaceListing) -> MarketplaceListingResponse:
    """Build a response dict, injecting seller_name from the relationship."""
    data = MarketplaceListingResponse.model_validate(listing)
    data.seller_name = listing.student.name if listing.student else None
    return data


@router.get(
    "",
    response_model=List[MarketplaceListingResponse],
    summary="List campus marketplace items",
    description=(
        "Returns all available listings on the same campus as the logged-in student. "
        "Optionally filter by category or listing_type."
    ),
)
def list_listings(
    category: Optional[str] = Query(None),
    listing_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_student=Depends(get_current_student),
):
    query = (
        db.query(MarketplaceListing)
        .filter(
            MarketplaceListing.college_id == current_student.college_id,
            MarketplaceListing.status == "available",
        )
    )
    if category:
        query = query.filter(MarketplaceListing.category == category)
    if listing_type:
        query = query.filter(MarketplaceListing.listing_type == listing_type)
    listings = query.order_by(MarketplaceListing.created_at.desc()).all()
    return [_to_response(l) for l in listings]


@router.post(
    "",
    response_model=MarketplaceListingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Post a new marketplace listing",
)
def create_listing(
    listing_in: MarketplaceListingCreate,
    db: Session = Depends(get_db),
    current_student=Depends(get_current_student),
):
    listing = MarketplaceListing(
        **listing_in.model_dump(),
        student_id=current_student.id,
        college_id=current_student.college_id,
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return _to_response(listing)


@router.put(
    "/{listing_id}",
    response_model=MarketplaceListingResponse,
    summary="Update a marketplace listing",
)
def update_listing(
    listing_id: int,
    updates: MarketplaceListingUpdate,
    db: Session = Depends(get_db),
    current_student=Depends(get_current_student),
):
    listing = db.query(MarketplaceListing).filter(MarketplaceListing.id == listing_id).first()
    if not listing:
        raise NotFoundError("Listing not found")
    if listing.student_id != current_student.id:
        raise AuthenticationError("You can only edit your own listings")
    for field, value in updates.model_dump(exclude_none=True).items():
        setattr(listing, field, value)
    db.commit()
    db.refresh(listing)
    return _to_response(listing)


@router.post(
    "/{listing_id}/mark-sold",
    response_model=MarketplaceListingResponse,
    summary="Mark your listing as sold/rented",
)
def mark_sold(
    listing_id: int,
    db: Session = Depends(get_db),
    current_student=Depends(get_current_student),
):
    listing = db.query(MarketplaceListing).filter(MarketplaceListing.id == listing_id).first()
    if not listing:
        raise NotFoundError("Listing not found")
    if listing.student_id != current_student.id:
        raise AuthenticationError("You can only update your own listings")
    listing.status = "sold"
    db.commit()
    db.refresh(listing)
    return _to_response(listing)


@router.delete(
    "/{listing_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a marketplace listing",
)
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_student=Depends(get_current_student),
):
    listing = db.query(MarketplaceListing).filter(MarketplaceListing.id == listing_id).first()
    if not listing:
        raise NotFoundError("Listing not found")
    if listing.student_id != current_student.id:
        raise AuthenticationError("You can only remove your own listings")
    listing.status = "removed"
    db.commit()
