"""Verified Student Reviews Routes."""

from fastapi import APIRouter, Depends, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from datetime import datetime, timedelta, timezone

from database import get_db
from models.review import Review, ReviewImage
from models.hostel import Hostel
from models.student import Student
from schemas.review import (
    ReviewCreate,
    ReviewUpdate,
    ReviewResponse,
    ReviewFlagRequest,
    ReviewImageResponse,
)
from routes.auth import get_current_student, security
from services.auth_service import verify_token
import crud.student as crud_student
from services.upload_service import save_uploaded_file
from utils.exceptions import NotFoundError, AuthenticationError, ValidationError

router = APIRouter(prefix="/reviews", tags=["Reviews"])


def _get_optional_student(
    credentials=Depends(security),
    db: Session = Depends(get_db),
) -> Optional[Student]:
    """Helper to detect student if token is present, without blocking unauthenticated requests."""
    if not credentials or not credentials.credentials:
        return None
    try:
        payload = verify_token(credentials.credentials)
        if payload.get("role") == "student":
            student_id = payload.get("sub")
            if student_id:
                return crud_student.get_student_by_id(db, int(student_id))
    except Exception:
        pass
    return None


def _format_review_response(review: Review, current_student_id: Optional[int] = None) -> ReviewResponse:
    """Safely format review response without exposing private student info."""
    reviewer_badge = "Verified Student"
    if review.student:
        branch = review.student.branch or "General"
        year = review.student.year_of_study or 1
        reviewer_badge = f"Verified Student · {branch} (Year {year})"

    images_data = [
        ReviewImageResponse(
            id=img.id,
            file_url=img.file_url,
            file_name=img.file_name,
            file_size=img.file_size,
            created_at=img.created_at,
        )
        for img in (review.images or [])
    ]

    return ReviewResponse(
        id=review.id,
        college_id=review.college_id,
        college_name=review.college.name if review.college else None,
        hostel_id=review.hostel_id,
        hostel_name=review.hostel.name if review.hostel else None,
        category=review.category,
        rating=review.rating,
        title=review.title,
        review_text=review.review_text,
        verification_status=review.verification_status,
        moderation_status=review.moderation_status,
        helpful_count=review.helpful_count,
        is_verified_student=review.verification_status == "VERIFIED_STUDENT",
        reviewer_badge=reviewer_badge,
        is_owner=(current_student_id == review.student_id) if current_student_id else False,
        images=images_data,
        created_at=review.created_at,
        updated_at=review.updated_at,
    )


@router.post(
    "",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a verified student review",
)
def create_review(
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    """
    Submits a genuine student review.
    - Identity and college association derived strictly from authenticated session.
    - Automatically tagged as VERIFIED_STUDENT.
    - Anti-spam frequency limit: max 1 review per category/hostel every 24 hours.
    """
    # 1. Verify hostel association if hostel_id provided
    if review_in.hostel_id:
        hostel = db.query(Hostel).filter(Hostel.id == review_in.hostel_id).first()
        if not hostel:
            raise NotFoundError("Hostel not found")
        if hostel.college_id != current_student.college_id:
            raise ValidationError("You can only review hostels belonging to your enrolled college")

    # 2. Anti-spam check: prevent duplicate submissions within short window
    recent_threshold = datetime.now(timezone.utc) - timedelta(hours=24)
    existing_recent = (
        db.query(Review)
        .filter(
            Review.student_id == current_student.id,
            Review.category == review_in.category,
            Review.hostel_id == review_in.hostel_id,
            Review.created_at >= recent_threshold,
        )
        .first()
    )
    if existing_recent:
        raise ValidationError(
            "You have already submitted a review for this category recently. You can edit your existing review."
        )

    review = Review(
        student_id=current_student.id,
        college_id=current_student.college_id,
        hostel_id=review_in.hostel_id,
        category=review_in.category,
        rating=review_in.rating,
        title=review_in.title,
        review_text=review_in.review_text,
        verification_status="VERIFIED_STUDENT",
        moderation_status="APPROVED",
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    return _format_review_response(review, current_student.id)


@router.post(
    "/{review_id}/images",
    response_model=ReviewImageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload evidence photo for a review",
)
async def upload_review_image(
    review_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    """Allows the review author to upload evidence photo."""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise NotFoundError("Review not found")
    if review.student_id != current_student.id:
        raise AuthenticationError("You can only upload images for your own reviews")

    # Check max images per review (limit to 5)
    existing_count = db.query(ReviewImage).filter(ReviewImage.review_id == review.id).count()
    if existing_count >= 5:
        raise ValidationError("Maximum of 5 evidence photos allowed per review")

    upload_info = await save_uploaded_file(file, subfolder="reviews")

    review_img = ReviewImage(
        review_id=review.id,
        file_url=upload_info["file_url"],
        file_name=upload_info["file_name"],
        file_size=upload_info["file_size"],
        mime_type=upload_info["mime_type"],
    )
    db.add(review_img)
    db.commit()
    db.refresh(review_img)

    return ReviewImageResponse.model_validate(review_img)


@router.get(
    "",
    response_model=List[ReviewResponse],
    summary="List reviews with filtering",
)
def list_reviews(
    college_id: Optional[int] = Query(None),
    hostel_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    rating: Optional[int] = Query(None),
    sort: Optional[str] = Query("recent"),  # recent | top | lowest
    db: Session = Depends(get_db),
    current_student: Optional[Student] = Depends(_get_optional_student),
):
    query = db.query(Review).filter(
        Review.verification_status != "REMOVED",
        Review.moderation_status != "REJECTED",
    )

    if college_id:
        query = query.filter(Review.college_id == college_id)
    if hostel_id:
        query = query.filter(Review.hostel_id == hostel_id)
    if category and category != "All":
        query = query.filter(Review.category == category)
    if rating:
        query = query.filter(Review.rating == rating)

    if sort == "top":
        query = query.order_by(Review.rating.desc(), Review.helpful_count.desc())
    elif sort == "lowest":
        query = query.order_by(Review.rating.asc())
    else:
        query = query.order_by(Review.created_at.desc())

    reviews = query.all()
    current_student_id = current_student.id if current_student else None
    return [_format_review_response(r, current_student_id) for r in reviews]


@router.get(
    "/{review_id}",
    response_model=ReviewResponse,
    summary="Get single review",
)
def get_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_student: Optional[Student] = Depends(_get_optional_student),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise NotFoundError("Review not found")
    current_student_id = current_student.id if current_student else None
    return _format_review_response(review, current_student_id)


@router.put(
    "/{review_id}",
    response_model=ReviewResponse,
    summary="Edit own review",
)
def update_review(
    review_id: int,
    updates: ReviewUpdate,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise NotFoundError("Review not found")
    if review.student_id != current_student.id:
        raise AuthenticationError("You can only edit your own reviews")

    for field, value in updates.model_dump(exclude_none=True).items():
        setattr(review, field, value)

    db.commit()
    db.refresh(review)
    return _format_review_response(review, current_student.id)


@router.delete(
    "/{review_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete own review",
)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise NotFoundError("Review not found")
    if review.student_id != current_student.id:
        raise AuthenticationError("You can only delete your own reviews")

    db.delete(review)
    db.commit()


@router.post(
    "/{review_id}/helpful",
    summary="Mark review as helpful",
)
def mark_helpful(
    review_id: int,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise NotFoundError("Review not found")
    review.helpful_count += 1
    db.commit()
    return {"message": "Marked as helpful", "helpful_count": review.helpful_count}


@router.post(
    "/{review_id}/flag",
    summary="Flag review for moderation",
)
def flag_review(
    review_id: int,
    flag_in: ReviewFlagRequest,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise NotFoundError("Review not found")
    review.moderation_status = "FLAGGED"
    review.flag_reason = flag_in.reason
    db.commit()
    return {"message": "Review has been flagged for moderation. Thank you."}
