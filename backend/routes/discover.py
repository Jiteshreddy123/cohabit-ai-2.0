"""Public & Student Discovery Routes for Colleges and Hostels."""

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List, Dict, Any

from database import get_db
from models.college import College
from models.hostel import Hostel
from models.review import Review
from models.complaint import Complaint
from schemas.hostel import (
    HostelResponse,
    CollegeDiscoverResponse,
)
from schemas.review import ReviewResponse
from schemas.complaint import PublicComplaintResponse
from routes.reviews import _format_review_response
from routes.complaints import _format_public_issue
from utils.exceptions import NotFoundError

router = APIRouter(prefix="/discover", tags=["Discovery"])


def _calculate_hostel_metrics(hostel: Hostel) -> dict:
    valid_reviews = [r for r in hostel.reviews if r.moderation_status == "APPROVED"]
    avg_rating = round(sum(r.rating for r in valid_reviews) / len(valid_reviews), 1) if valid_reviews else 0.0
    resolved_count = sum(1 for c in hostel.complaints if c.status == "RESOLVED")
    open_count = sum(1 for c in hostel.complaints if c.status in ("NEW", "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS"))
    return {
        "average_rating": avg_rating,
        "total_reviews": len(valid_reviews),
        "resolved_issues_count": resolved_count,
        "open_issues_count": open_count,
    }


# ── College Discovery ───────────────────────────────────────────

@router.get(
    "/colleges",
    response_model=List[CollegeDiscoverResponse],
    summary="Discover Colleges and Universities",
)
def discover_colleges(
    search: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(College)
    if search:
        term = f"%{search}%"
        query = query.filter(
            (College.name.ilike(term))
            | (College.city.ilike(term))
            | (College.location.ilike(term))
        )
    if city and city != "All":
        query = query.filter(College.city == city)

    colleges = query.all()
    results = []

    for col in colleges:
        hostels_data = []
        all_col_reviews = []
        col_resolved_complaints = 0

        for h in col.hostels:
            metrics = _calculate_hostel_metrics(h)
            all_col_reviews.extend([r for r in h.reviews if r.moderation_status == "APPROVED"])
            col_resolved_complaints += metrics["resolved_issues_count"]

            hr = HostelResponse.model_validate(h)
            hr.college_name = col.name
            hr.college_city = col.city
            hr.average_rating = metrics["average_rating"]
            hr.total_reviews = metrics["total_reviews"]
            hr.resolved_issues_count = metrics["resolved_issues_count"]
            hr.open_issues_count = metrics["open_issues_count"]
            hostels_data.append(hr)

        overall_rating = (
            round(sum(r.rating for r in all_col_reviews) / len(all_col_reviews), 1)
            if all_col_reviews else 0.0
        )

        results.append(
            CollegeDiscoverResponse(
                id=col.id,
                name=col.name,
                location=col.location or "Main Campus",
                city=col.city or "Bengaluru",
                state=col.state or "Karnataka",
                description=col.description or "Quality residential and academic campus.",
                image_url=col.image_url,
                total_hostels=len(col.hostels),
                average_rating=overall_rating,
                total_reviews=len(all_col_reviews),
                total_complaints_resolved=col_resolved_complaints,
                hostels=hostels_data,
            )
        )

    return results


@router.get(
    "/colleges/{college_id}",
    response_model=CollegeDiscoverResponse,
    summary="Get detailed college discovery profile",
)
def get_college_discovery(
    college_id: int,
    db: Session = Depends(get_db),
):
    col = db.query(College).filter(College.id == college_id).first()
    if not col:
        raise NotFoundError("College not found")

    hostels_data = []
    all_col_reviews = []
    col_resolved_complaints = 0

    for h in col.hostels:
        metrics = _calculate_hostel_metrics(h)
        all_col_reviews.extend([r for r in h.reviews if r.moderation_status == "APPROVED"])
        col_resolved_complaints += metrics["resolved_issues_count"]

        hr = HostelResponse.model_validate(h)
        hr.college_name = col.name
        hr.college_city = col.city
        hr.average_rating = metrics["average_rating"]
        hr.total_reviews = metrics["total_reviews"]
        hr.resolved_issues_count = metrics["resolved_issues_count"]
        hr.open_issues_count = metrics["open_issues_count"]
        hostels_data.append(hr)

    overall_rating = (
        round(sum(r.rating for r in all_col_reviews) / len(all_col_reviews), 1)
        if all_col_reviews else 0.0
    )

    return CollegeDiscoverResponse(
        id=col.id,
        name=col.name,
        location=col.location or "Main Campus",
        city=col.city or "Bengaluru",
        state=col.state or "Karnataka",
        description=col.description or "Premier academic and residential campus.",
        image_url=col.image_url,
        total_hostels=len(col.hostels),
        average_rating=overall_rating,
        total_reviews=len(all_col_reviews),
        total_complaints_resolved=col_resolved_complaints,
        hostels=hostels_data,
    )


# ── Hostel Discovery & Search ────────────────────────────────────

@router.get(
    "/hostels",
    response_model=List[HostelResponse],
    summary="Search and filter hostels",
)
def discover_hostels(
    search: Optional[str] = Query(None),
    college_id: Optional[int] = Query(None),
    gender: Optional[str] = Query(None),  # Male | Female | Co-ed
    hostel_type: Optional[str] = Query(None),  # AC | Non-AC | Both
    facility: Optional[str] = Query(None),  # e.g. Wi-Fi, Mess, AC
    min_rating: Optional[float] = Query(None),
    sort: Optional[str] = Query("recommended"),  # recommended | rating | reviews | name
    db: Session = Depends(get_db),
):
    query = db.query(Hostel)

    if college_id:
        query = query.filter(Hostel.college_id == college_id)
    if gender and gender != "All":
        query = query.filter(Hostel.gender == gender)
    if hostel_type and hostel_type != "All":
        query = query.filter(Hostel.hostel_type == hostel_type)
    if search:
        term = f"%{search}%"
        query = query.join(College).filter(
            (Hostel.name.ilike(term))
            | (College.name.ilike(term))
            | (College.city.ilike(term))
        )

    hostels = query.all()
    results = []

    for h in hostels:
        metrics = _calculate_hostel_metrics(h)

        # Check facility filter if specified
        if facility and facility != "All":
            fac_list = h.facilities or []
            if not any(facility.lower() in str(f).lower() for f in fac_list):
                continue

        # Check min rating filter
        if min_rating and metrics["average_rating"] < min_rating:
            continue

        hr = HostelResponse.model_validate(h)
        hr.college_name = h.college.name if h.college else None
        hr.college_city = h.college.city if h.college else None
        hr.average_rating = metrics["average_rating"]
        hr.total_reviews = metrics["total_reviews"]
        hr.resolved_issues_count = metrics["resolved_issues_count"]
        hr.open_issues_count = metrics["open_issues_count"]
        results.append(hr)

    # Sorting
    if sort == "rating":
        results.sort(key=lambda x: x.average_rating, reverse=True)
    elif sort == "reviews":
        results.sort(key=lambda x: x.total_reviews, reverse=True)
    elif sort == "name":
        results.sort(key=lambda x: x.name)

    return results


@router.get(
    "/hostels/{hostel_id}",
    response_model=HostelResponse,
    summary="Get single hostel details",
)
def get_hostel_discovery(
    hostel_id: int,
    db: Session = Depends(get_db),
):
    hostel = db.query(Hostel).filter(Hostel.id == hostel_id).first()
    if not hostel:
        raise NotFoundError("Hostel not found")

    metrics = _calculate_hostel_metrics(hostel)
    hr = HostelResponse.model_validate(hostel)
    hr.college_name = hostel.college.name if hostel.college else None
    hr.college_city = hostel.college.city if hostel.college else None
    hr.average_rating = metrics["average_rating"]
    hr.total_reviews = metrics["total_reviews"]
    hr.resolved_issues_count = metrics["resolved_issues_count"]
    hr.open_issues_count = metrics["open_issues_count"]
    return hr


@router.get(
    "/hostels/{hostel_id}/reviews",
    response_model=List[ReviewResponse],
    summary="Get verified student reviews for this hostel",
)
def get_hostel_reviews(
    hostel_id: int,
    category: Optional[str] = Query(None),
    rating: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Review).filter(
        Review.hostel_id == hostel_id,
        Review.moderation_status == "APPROVED",
        Review.verification_status != "REMOVED",
    )
    if category and category != "All":
        query = query.filter(Review.category == category)
    if rating:
        query = query.filter(Review.rating == rating)

    reviews = query.order_by(Review.created_at.desc()).all()
    return [_format_review_response(r) for r in reviews]


@router.get(
    "/hostels/{hostel_id}/issues",
    response_model=List[PublicComplaintResponse],
    summary="Get public issue resolution feed for this hostel",
)
def get_hostel_public_issues(
    hostel_id: int,
    db: Session = Depends(get_db),
):
    complaints = (
        db.query(Complaint)
        .filter(
            Complaint.hostel_id == hostel_id,
            Complaint.visibility == "PUBLIC",
        )
        .order_by(Complaint.created_at.desc())
        .all()
    )
    return [_format_public_issue(c) for c in complaints]
