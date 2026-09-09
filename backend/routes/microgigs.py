"""Micro-Gigs routes — 48-hour expiring task bulletin board.

Auto-expiry is implemented purely via DB column filtering:
  WHERE expires_at > NOW() AND status = 'open'
No background jobs, no cron — expired gigs simply disappear from all queries.
"""

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import Optional, List
from datetime import datetime, timezone

from database import get_db
from models.microgig import MicroGig
from schemas.microgig import MicroGigCreate, MicroGigResponse
from routes.auth import get_current_student
from utils.exceptions import NotFoundError, AuthenticationError, ValidationError

router = APIRouter(prefix="/micro-gigs", tags=["Micro-Gigs"])


def _to_response(gig: MicroGig) -> MicroGigResponse:
    data = MicroGigResponse.model_validate(gig)
    data.poster_name = gig.poster.name if gig.poster else None
    data.acceptor_name = gig.acceptor.name if gig.acceptor else None
    return data


@router.get(
    "",
    response_model=List[MicroGigResponse],
    summary="List all open micro-gigs on campus",
    description=(
        "Returns all non-expired, open gigs on the same campus. "
        "Expired gigs (older than 48h) are automatically excluded."
    ),
)
def list_gigs(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_student=Depends(get_current_student),
):
    now = datetime.now(timezone.utc)
    query = (
        db.query(MicroGig)
        .filter(
            MicroGig.college_id == current_student.college_id,
            MicroGig.status == "open",
            MicroGig.expires_at > now,
        )
    )
    if category:
        query = query.filter(MicroGig.category == category)
    gigs = query.order_by(MicroGig.created_at.desc()).all()
    return [_to_response(g) for g in gigs]


@router.get(
    "/my",
    response_model=List[MicroGigResponse],
    summary="List all gigs posted by the current student",
)
def list_my_gigs(
    db: Session = Depends(get_db),
    current_student=Depends(get_current_student),
):
    gigs = (
        db.query(MicroGig)
        .filter(MicroGig.poster_id == current_student.id)
        .order_by(MicroGig.created_at.desc())
        .all()
    )
    return [_to_response(g) for g in gigs]


@router.post(
    "",
    response_model=MicroGigResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Post a new micro-gig",
    description="Creates a gig that expires automatically after 48 hours.",
)
def create_gig(
    gig_in: MicroGigCreate,
    db: Session = Depends(get_db),
    current_student=Depends(get_current_student),
):
    gig = MicroGig(
        **gig_in.model_dump(),
        poster_id=current_student.id,
        college_id=current_student.college_id,
    )
    db.add(gig)
    db.commit()
    db.refresh(gig)
    return _to_response(gig)


@router.post(
    "/{gig_id}/accept",
    response_model=MicroGigResponse,
    summary="Accept a micro-gig",
)
def accept_gig(
    gig_id: int,
    db: Session = Depends(get_db),
    current_student=Depends(get_current_student),
):
    now = datetime.now(timezone.utc)
    gig = db.query(MicroGig).filter(MicroGig.id == gig_id).first()
    if not gig:
        raise NotFoundError("Gig not found")
    if gig.poster_id == current_student.id:
        raise ValidationError("You cannot accept your own gig")
    if gig.status != "open":
        raise ValidationError("This gig is no longer available")
    expires = gig.expires_at.replace(tzinfo=timezone.utc) if (gig.expires_at and gig.expires_at.tzinfo is None) else gig.expires_at
    if expires and expires < now:
        raise ValidationError("This gig has expired")
    gig.status = "accepted"
    gig.accepted_by = current_student.id
    db.commit()
    db.refresh(gig)
    return _to_response(gig)


@router.delete(
    "/{gig_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete (cancel) your micro-gig",
)
def delete_gig(
    gig_id: int,
    db: Session = Depends(get_db),
    current_student=Depends(get_current_student),
):
    gig = db.query(MicroGig).filter(MicroGig.id == gig_id).first()
    if not gig:
        raise NotFoundError("Gig not found")
    if gig.poster_id != current_student.id:
        raise AuthenticationError("You can only delete your own gigs")
    db.delete(gig)
    db.commit()
