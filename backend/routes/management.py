"""College Management Administrative Routes for Complaints and Reviews."""

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timezone

from database import get_db
from models.complaint import Complaint, ComplaintUpdate
from models.review import Review
from models.hostel import Hostel
from schemas.college import CollegeResponse
from schemas.complaint import (
    ComplaintResponse,
    ComplaintStatusUpdate,
)
from schemas.review import ReviewResponse
from schemas.hostel import HostelCreate, HostelResponse, HostelUpdate
from routes.auth import get_current_college
from routes.complaints import _format_complaint_response
from routes.reviews import _format_review_response
from utils.exceptions import NotFoundError, AuthenticationError, ValidationError

router = APIRouter(prefix="/management", tags=["College Management"])


# ── Management Complaints ────────────────────────────────────────

@router.get(
    "/complaints",
    response_model=List[ComplaintResponse],
    summary="List all complaints for the logged-in college",
)
def list_college_complaints(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    category_filter: Optional[str] = Query(None, alias="category"),
    hostel_id: Optional[int] = Query(None),
    visibility_filter: Optional[str] = Query(None, alias="visibility"),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_college: CollegeResponse = Depends(get_current_college),
):
    query = db.query(Complaint).filter(Complaint.college_id == current_college.id)

    if status_filter and status_filter != "All":
        query = query.filter(Complaint.status == status_filter)
    if priority_filter and priority_filter != "All":
        query = query.filter(Complaint.priority == priority_filter)
    if category_filter and category_filter != "All":
        query = query.filter(Complaint.category == category_filter)
    if hostel_id:
        query = query.filter(Complaint.hostel_id == hostel_id)
    if visibility_filter and visibility_filter != "All":
        query = query.filter(Complaint.visibility == visibility_filter)
    if search:
        term = f"%{search}%"
        query = query.filter(
            (Complaint.title.ilike(term))
            | (Complaint.description.ilike(term))
            | (Complaint.complaint_code.ilike(term))
            | (Complaint.location.ilike(term))
        )

    complaints = query.order_by(Complaint.created_at.desc()).all()
    return [_format_complaint_response(c) for c in complaints]


@router.get(
    "/complaints/{complaint_id}",
    response_model=ComplaintResponse,
    summary="Get detailed complaint by ID",
)
def get_management_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_college: CollegeResponse = Depends(get_current_college),
):
    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id,
        Complaint.college_id == current_college.id
    ).first()
    if not complaint:
        raise NotFoundError("Complaint not found for your college")
    return _format_complaint_response(complaint)


@router.put(
    "/complaints/{complaint_id}/status",
    response_model=ComplaintResponse,
    summary="Update complaint status, assign staff, and provide management response",
)
def update_complaint_status(
    complaint_id: int,
    status_update: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
    current_college: CollegeResponse = Depends(get_current_college),
):
    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id,
        Complaint.college_id == current_college.id
    ).first()
    if not complaint:
        raise NotFoundError("Complaint not found for your college")

    old_status = complaint.status
    complaint.status = status_update.status

    if status_update.assigned_to is not None:
        complaint.assigned_to = status_update.assigned_to
    if status_update.management_response is not None:
        complaint.management_response = status_update.management_response
    if status_update.rejection_reason is not None:
        complaint.rejection_reason = status_update.rejection_reason

    if status_update.status == "RESOLVED":
        complaint.resolved_at = datetime.now(timezone.utc)
    elif status_update.status in ("NEW", "IN_PROGRESS", "UNDER_REVIEW", "ASSIGNED"):
        complaint.resolved_at = None

    # Construct note for the timeline update
    action_note = f"Status updated to '{status_update.status}' by College Administration."
    if status_update.assigned_to:
        action_note += f" Assigned to: {status_update.assigned_to}."
    if status_update.management_response:
        action_note += f" Admin Note: {status_update.management_response}"
    if status_update.rejection_reason:
        action_note += f" Rejection Reason: {status_update.rejection_reason}"

    update_entry = ComplaintUpdate(
        complaint_id=complaint.id,
        author_role="admin",
        author_name=current_college.name,
        old_status=old_status,
        new_status=status_update.status,
        note=action_note,
    )
    db.add(update_entry)
    db.commit()
    db.refresh(complaint)

    return _format_complaint_response(complaint)


# ── Management Reviews & Moderation ──────────────────────────────

@router.get(
    "/reviews",
    response_model=List[ReviewResponse],
    summary="List all reviews for moderation in this college",
)
def list_management_reviews(
    moderation_filter: Optional[str] = Query(None, alias="moderation_status"),
    db: Session = Depends(get_db),
    current_college: CollegeResponse = Depends(get_current_college),
):
    query = db.query(Review).filter(Review.college_id == current_college.id)
    if moderation_filter and moderation_filter != "All":
        query = query.filter(Review.moderation_status == moderation_filter)
    reviews = query.order_by(Review.created_at.desc()).all()
    return [_format_review_response(r) for r in reviews]


@router.put(
    "/reviews/{review_id}/moderate",
    response_model=ReviewResponse,
    summary="Moderate a student review (approve, reject, remove)",
)
def moderate_review(
    review_id: int,
    action: str = Query(..., description="Action: approve | reject | remove"),
    db: Session = Depends(get_db),
    current_college: CollegeResponse = Depends(get_current_college),
):
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.college_id == current_college.id
    ).first()
    if not review:
        raise NotFoundError("Review not found")

    if action == "approve":
        review.moderation_status = "APPROVED"
        review.verification_status = "VERIFIED_STUDENT"
    elif action == "reject":
        review.moderation_status = "REJECTED"
    elif action == "remove":
        review.verification_status = "REMOVED"
        review.moderation_status = "REJECTED"
    else:
        raise ValidationError(f"Invalid moderation action '{action}'")

    db.commit()
    db.refresh(review)
    return _format_review_response(review)


# ── Management Hostels ───────────────────────────────────────────

@router.get(
    "/hostels",
    response_model=List[HostelResponse],
    summary="List all hostels for logged-in college",
)
def list_management_hostels(
    db: Session = Depends(get_db),
    current_college: CollegeResponse = Depends(get_current_college),
):
    hostels = db.query(Hostel).filter(Hostel.college_id == current_college.id).all()
    res = []
    for h in hostels:
        revs = [r for r in h.reviews if r.moderation_status == "APPROVED"]
        avg_r = round(sum(r.rating for r in revs) / len(revs), 1) if revs else 0.0
        resolved_count = sum(1 for c in h.complaints if c.status == "RESOLVED")
        open_count = sum(1 for c in h.complaints if c.status in ("NEW", "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS"))

        hr = HostelResponse.model_validate(h)
        hr.college_name = current_college.name
        hr.college_city = current_college.city
        hr.average_rating = avg_r
        hr.total_reviews = len(revs)
        hr.resolved_issues_count = resolved_count
        hr.open_issues_count = open_count
        res.append(hr)
    return res


@router.post(
    "/hostels",
    response_model=HostelResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new hostel block for the college",
)
def create_hostel(
    hostel_in: HostelCreate,
    db: Session = Depends(get_db),
    current_college: CollegeResponse = Depends(get_current_college),
):
    hostel = Hostel(
        college_id=current_college.id,
        name=hostel_in.name,
        gender=hostel_in.gender,
        hostel_type=hostel_in.hostel_type,
        room_types=hostel_in.room_types,
        facilities=hostel_in.facilities,
        fee_structure=hostel_in.fee_structure,
        total_capacity=hostel_in.total_capacity,
        description=hostel_in.description,
        image_url=hostel_in.image_url,
    )
    db.add(hostel)
    db.commit()
    db.refresh(hostel)

    hr = HostelResponse.model_validate(hostel)
    hr.college_name = current_college.name
    hr.college_city = current_college.city
    return hr
