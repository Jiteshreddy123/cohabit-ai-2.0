"""Student Complaints and Public Issues Routes."""

from fastapi import APIRouter, Depends, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timezone
import uuid

from database import get_db
from models.complaint import Complaint, ComplaintImage, ComplaintUpdate as ComplaintUpdateModel
from models.hostel import Hostel
from models.student import Student
from schemas.complaint import (
    ComplaintCreate,
    ComplaintUpdate as ComplaintUpdateSchema,
    ComplaintResponse,
    PublicComplaintResponse,
    ComplaintImageResponse,
    ComplaintUpdateResponse,
    ComplaintReopenRequest,
)
from routes.auth import get_current_student, get_current_college, security
from utils.exceptions import NotFoundError, AuthenticationError, ValidationError

router = APIRouter(prefix="", tags=["Complaints"])


def _generate_complaint_code(db: Session, college_id: int) -> str:
    """Generate a clean human-readable code like CMP-2026-101."""
    count = db.query(Complaint).filter(Complaint.college_id == college_id).count() + 1
    return f"CMP-{datetime.now().year}-{count:03d}"


def _format_complaint_response(complaint: Complaint) -> ComplaintResponse:
    images_data = [
        ComplaintImageResponse(
            id=img.id,
            file_url=img.file_url,
            file_name=img.file_name,
            file_size=img.file_size,
            created_at=img.created_at,
        )
        for img in (complaint.images or [])
    ]

    updates_data = [
        ComplaintUpdateResponse(
            id=upd.id,
            author_role=upd.author_role,
            author_name=upd.author_name,
            old_status=upd.old_status,
            new_status=upd.new_status,
            note=upd.note,
            created_at=upd.created_at,
        )
        for upd in (complaint.updates or [])
    ]

    student = complaint.student
    return ComplaintResponse(
        id=complaint.id,
        complaint_code=complaint.complaint_code,
        student_id=complaint.student_id,
        student_name=student.name if student else None,
        student_roll=student.roll_number if student else None,
        student_branch=student.branch if student else None,
        student_year=student.year_of_study if student else None,
        college_id=complaint.college_id,
        college_name=complaint.college.name if complaint.college else None,
        hostel_id=complaint.hostel_id,
        hostel_name=complaint.hostel.name if complaint.hostel else None,
        category=complaint.category,
        title=complaint.title,
        description=complaint.description,
        location=complaint.location,
        priority=complaint.priority,
        visibility=complaint.visibility,
        status=complaint.status,
        assigned_to=complaint.assigned_to,
        management_response=complaint.management_response,
        rejection_reason=complaint.rejection_reason,
        images=images_data,
        updates=updates_data,
        created_at=complaint.created_at,
        updated_at=complaint.updated_at,
        resolved_at=complaint.resolved_at,
    )


def _format_public_issue(complaint: Complaint) -> PublicComplaintResponse:
    """Anonymized issue representation — zero student PII."""
    return PublicComplaintResponse(
        id=complaint.id,
        complaint_code=complaint.complaint_code,
        category=complaint.category,
        title=complaint.title,
        description=complaint.description,
        location=complaint.location,
        priority=complaint.priority,
        status=complaint.status,
        college_id=complaint.college_id,
        college_name=complaint.college.name if complaint.college else None,
        hostel_id=complaint.hostel_id,
        hostel_name=complaint.hostel.name if complaint.hostel else None,
        created_at=complaint.created_at,
        resolved_at=complaint.resolved_at,
    )


# ── Student Complaint Endpoints ─────────────────────────────────

@router.post(
    "/complaints",
    response_model=ComplaintResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new complaint (Private or Public)",
)
def create_complaint(
    complaint_in: ComplaintCreate,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    """
    Submits a facility or college problem report.
    - Identity and college derived strictly from student JWT.
    - Student chooses PRIVATE or PUBLIC visibility.
    """
    # Verify hostel if supplied
    if complaint_in.hostel_id:
        hostel = db.query(Hostel).filter(Hostel.id == complaint_in.hostel_id).first()
        if not hostel or hostel.college_id != current_student.college_id:
            raise ValidationError("Invalid hostel selected for your institution.")

    code = _generate_complaint_code(db, current_student.college_id)

    complaint = Complaint(
        complaint_code=code,
        student_id=current_student.id,
        college_id=current_student.college_id,
        hostel_id=complaint_in.hostel_id,
        category=complaint_in.category,
        title=complaint_in.title,
        description=complaint_in.description,
        location=complaint_in.location,
        priority=complaint_in.priority,
        visibility=complaint_in.visibility,
        status="NEW",
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    # Add initial activity log
    initial_update = ComplaintUpdateModel(
        complaint_id=complaint.id,
        author_role="student",
        author_name=current_student.name,
        old_status=None,
        new_status="NEW",
        note="Complaint submitted and dispatched to college facilities management.",
    )
    db.add(initial_update)
    db.commit()
    db.refresh(complaint)

    return _format_complaint_response(complaint)


@router.post(
    "/complaints/{complaint_id}/images",
    response_model=ComplaintImageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload evidence photo for a complaint",
)
async def upload_complaint_image(
    complaint_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise NotFoundError("Complaint not found")
    if complaint.student_id != current_student.id:
        raise AuthenticationError("You can only attach evidence to your own complaints")

    existing_count = db.query(ComplaintImage).filter(ComplaintImage.complaint_id == complaint.id).count()
    if existing_count >= 5:
        raise ValidationError("Maximum of 5 evidence photos allowed per complaint")

    from services.upload_service import save_uploaded_file
    upload_info = await save_uploaded_file(file, subfolder="complaints")

    complaint_img = ComplaintImage(
        complaint_id=complaint.id,
        file_url=upload_info["file_url"],
        file_name=upload_info["file_name"],
        file_size=upload_info["file_size"],
        mime_type=upload_info["mime_type"],
    )
    db.add(complaint_img)
    db.commit()
    db.refresh(complaint_img)

    return ComplaintImageResponse.model_validate(complaint_img)


@router.get(
    "/complaints/my",
    response_model=List[ComplaintResponse],
    summary="Get all complaints raised by logged-in student",
)
def get_my_complaints(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    query = db.query(Complaint).filter(Complaint.student_id == current_student.id)
    if status_filter and status_filter != "All":
        query = query.filter(Complaint.status == status_filter)
    complaints = query.order_by(Complaint.created_at.desc()).all()
    return [_format_complaint_response(c) for c in complaints]


@router.get(
    "/complaints/{complaint_id}",
    response_model=ComplaintResponse,
    summary="Get complaint details",
)
def get_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise NotFoundError("Complaint not found")
    if complaint.student_id != current_student.id:
        raise AuthenticationError("You do not have permission to view this private complaint")
    return _format_complaint_response(complaint)


@router.post(
    "/complaints/{complaint_id}/reopen",
    response_model=ComplaintResponse,
    summary="Reopen an unresolved complaint",
)
def reopen_complaint(
    complaint_id: int,
    reopen_in: ComplaintReopenRequest,
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise NotFoundError("Complaint not found")
    if complaint.student_id != current_student.id:
        raise AuthenticationError("You can only reopen your own complaints")

    if complaint.status not in ("RESOLVED", "REJECTED"):
        raise ValidationError(f"Cannot reopen complaint with status '{complaint.status}'")

    old_status = complaint.status
    complaint.status = "REOPENED"
    complaint.resolved_at = None

    update_entry = ComplaintUpdateModel(
        complaint_id=complaint.id,
        author_role="student",
        author_name=current_student.name,
        old_status=old_status,
        new_status="REOPENED",
        note=f"Reopened by student: {reopen_in.reason}",
    )
    db.add(update_entry)
    db.commit()
    db.refresh(complaint)

    return _format_complaint_response(complaint)


# ── Public Issue Feed Endpoints ─────────────────────────────────

@router.get(
    "/public/issues",
    response_model=List[PublicComplaintResponse],
    summary="Public Campus Issue Transparency Feed",
)
def get_public_issues(
    college_id: Optional[int] = Query(None),
    hostel_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
):
    """
    Public feed of campus problems raised with PUBLIC visibility.
    Identity of student is strictly hidden.
    """
    query = db.query(Complaint).filter(Complaint.visibility == "PUBLIC")

    if college_id:
        query = query.filter(Complaint.college_id == college_id)
    if hostel_id:
        query = query.filter(Complaint.hostel_id == hostel_id)
    if category and category != "All":
        query = query.filter(Complaint.category == category)
    if status_filter and status_filter != "All":
        query = query.filter(Complaint.status == status_filter)

    complaints = query.order_by(Complaint.created_at.desc()).all()
    return [_format_public_issue(c) for c in complaints]


@router.get(
    "/public/issues/{complaint_id}",
    response_model=PublicComplaintResponse,
    summary="Get single public issue details",
)
def get_public_issue_detail(
    complaint_id: int,
    db: Session = Depends(get_db),
):
    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id,
        Complaint.visibility == "PUBLIC"
    ).first()
    if not complaint:
        raise NotFoundError("Public issue not found")
    return _format_public_issue(complaint)
