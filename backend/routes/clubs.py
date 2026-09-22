"""
Hos-Clubs (Hostel Clubs & Committees) API Routes.
"""

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from datetime import datetime, timezone

from database import get_db
from models.club import HosClub, HosClubMembership, HosClubActivity
from models.student import Student
from models.college import College
from schemas.club import (
    ClubCreate,
    ClubResponse,
    ClubDetailResponse,
    ClubActivityCreate,
    ClubActivityResponse,
    EngagementStatusResponse,
)
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from routes.auth import get_current_student, get_current_college
from services.auth_service import verify_token
import crud.student as crud_student
from utils.exceptions import NotFoundError, ValidationError, DuplicateError

router = APIRouter(prefix="/hos-clubs", tags=["Hos-Clubs"])
optional_security = HTTPBearer(auto_error=False)


def _get_optional_student(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security),
    db: Session = Depends(get_db),
) -> Optional[Student]:
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



@router.get("", response_model=List[ClubResponse], summary="List all Hos-Clubs with search & category filters")
def list_clubs(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search club name or keywords"),
    current_student: Optional[Student] = Depends(_get_optional_student),
    db: Session = Depends(get_db),
):
    query = db.query(HosClub)
    if category and category != "All":
        query = query.filter(HosClub.category == category)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((HosClub.name.ilike(s)) | (HosClub.description.ilike(s)) | (HosClub.tagline.ilike(s)))

    clubs = query.order_by(HosClub.name.asc()).all()

    # Pre-fetch current student's memberships
    student_membership_map = {}
    if current_student:
        memberships = db.query(HosClubMembership).filter(
            HosClubMembership.student_id == current_student.id
        ).all()
        for m in memberships:
            student_membership_map[m.club_id] = m.role

    results = []
    for club in clubs:
        count = db.query(func.count(HosClubMembership.id)).filter(
            HosClubMembership.club_id == club.id
        ).scalar() or 0

        is_enrolled = club.id in student_membership_map
        student_role = student_membership_map.get(club.id)

        results.append(
            ClubResponse(
                id=club.id,
                college_id=club.college_id,
                name=club.name,
                category=club.category,
                tagline=club.tagline,
                description=club.description,
                image_url=club.image_url,
                faculty_advisor=club.faculty_advisor,
                student_lead=club.student_lead,
                meeting_schedule=club.meeting_schedule,
                venue=club.venue,
                is_mandatory_eligible=club.is_mandatory_eligible,
                created_at=club.created_at,
                member_count=count,
                is_enrolled=is_enrolled,
                student_role=student_role,
            )
        )
    return results


@router.get("/engagement/status", response_model=EngagementStatusResponse, summary="Get student mandatory engagement compliance")
def get_engagement_status(
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    memberships = db.query(HosClubMembership).filter(
        HosClubMembership.student_id == current_student.id
    ).all()

    club_ids = [m.club_id for m in memberships]
    enrolled_clubs_orm = db.query(HosClub).filter(HosClub.id.in_(club_ids)).all() if club_ids else []

    enrolled_clubs = []
    for c in enrolled_clubs_orm:
        count = db.query(func.count(HosClubMembership.id)).filter(
            HosClubMembership.club_id == c.id
        ).scalar() or 0
        role = next((m.role for m in memberships if m.club_id == c.id), "Member")
        enrolled_clubs.append(
            ClubResponse(
                id=c.id,
                college_id=c.college_id,
                name=c.name,
                category=c.category,
                tagline=c.tagline,
                description=c.description,
                image_url=c.image_url,
                faculty_advisor=c.faculty_advisor,
                student_lead=c.student_lead,
                meeting_schedule=c.meeting_schedule,
                venue=c.venue,
                is_mandatory_eligible=c.is_mandatory_eligible,
                created_at=c.created_at,
                member_count=count,
                is_enrolled=True,
                student_role=role,
            )
        )

    enrolled_count = len(enrolled_clubs)
    is_compliant = enrolled_count >= 1

    if enrolled_count >= 3:
        status_label = "Campus Star"
        status_color = "purple"
        message = f"Outstanding! You are actively participating in {enrolled_count} hostel clubs and enriching our campus culture."
    elif is_compliant:
        status_label = "Compliant"
        status_color = "emerald"
        message = f"Great job! You have satisfied the mandatory campus engagement requirement ({enrolled_count} active club)."
    else:
        status_label = "Action Required"
        status_color = "amber"
        message = "Mandatory Requirement: Please join at least 1 hostel club or committee to prevent isolation and meet campus life criteria."

    return EngagementStatusResponse(
        is_compliant=is_compliant,
        enrolled_count=enrolled_count,
        minimum_required=1,
        status_label=status_label,
        status_color=status_color,
        message=message,
        enrolled_clubs=enrolled_clubs,
    )


@router.get("/{club_id}", response_model=ClubDetailResponse, summary="Get details and activities for a club")
def get_club_detail(
    club_id: int,
    current_student: Optional[Student] = Depends(_get_optional_student),
    db: Session = Depends(get_db),
):
    club = db.query(HosClub).filter(HosClub.id == club_id).first()
    if not club:
        raise NotFoundError("Hostel club not found")

    count = db.query(func.count(HosClubMembership.id)).filter(
        HosClubMembership.club_id == club.id
    ).scalar() or 0

    is_enrolled = False
    student_role = None
    if current_student:
        mem = db.query(HosClubMembership).filter(
            HosClubMembership.club_id == club.id,
            HosClubMembership.student_id == current_student.id,
        ).first()
        if mem:
            is_enrolled = True
            student_role = mem.role

    activities = db.query(HosClubActivity).filter(
        HosClubActivity.club_id == club.id
    ).order_by(HosClubActivity.id.desc()).all()

    return ClubDetailResponse(
        id=club.id,
        college_id=club.college_id,
        name=club.name,
        category=club.category,
        tagline=club.tagline,
        description=club.description,
        image_url=club.image_url,
        faculty_advisor=club.faculty_advisor,
        student_lead=club.student_lead,
        meeting_schedule=club.meeting_schedule,
        venue=club.venue,
        is_mandatory_eligible=club.is_mandatory_eligible,
        created_at=club.created_at,
        member_count=count,
        is_enrolled=is_enrolled,
        student_role=student_role,
        activities=[
            ClubActivityResponse(
                id=a.id,
                club_id=a.club_id,
                title=a.title,
                description=a.description,
                event_date=a.event_date,
                venue=a.venue,
                event_type=a.event_type,
                rsvp_count=a.rsvp_count,
                created_at=a.created_at,
            )
            for a in activities
        ],
    )


@router.post("/{club_id}/join", summary="Join a hostel club")
def join_club(
    club_id: int,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    club = db.query(HosClub).filter(HosClub.id == club_id).first()
    if not club:
        raise NotFoundError("Hostel club not found")

    existing = db.query(HosClubMembership).filter(
        HosClubMembership.club_id == club_id,
        HosClubMembership.student_id == current_student.id,
    ).first()

    if existing:
        return {"message": "You are already a member of this club", "enrolled": True}

    new_membership = HosClubMembership(
        club_id=club_id,
        student_id=current_student.id,
        role="Member",
    )
    db.add(new_membership)
    db.commit()

    return {"message": f"Successfully joined {club.name}!", "enrolled": True}


@router.post("/{club_id}/leave", summary="Leave a hostel club")
def leave_club(
    club_id: int,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    membership = db.query(HosClubMembership).filter(
        HosClubMembership.club_id == club_id,
        HosClubMembership.student_id == current_student.id,
    ).first()

    if not membership:
        raise NotFoundError("You are not currently enrolled in this club")

    db.delete(membership)
    db.commit()

    return {"message": "Successfully left the club", "enrolled": False}


@router.post("", response_model=ClubResponse, status_code=status.HTTP_201_CREATED, summary="Create a new hostel club (Admin)")
def create_club(
    club_in: ClubCreate,
    college: College = Depends(get_current_college),
    db: Session = Depends(get_db),
):
    new_club = HosClub(
        college_id=college.id,
        name=club_in.name,
        category=club_in.category,
        tagline=club_in.tagline,
        description=club_in.description,
        image_url=club_in.image_url,
        faculty_advisor=club_in.faculty_advisor,
        student_lead=club_in.student_lead,
        meeting_schedule=club_in.meeting_schedule,
        venue=club_in.venue,
        is_mandatory_eligible=club_in.is_mandatory_eligible,
    )
    db.add(new_club)
    db.commit()
    db.refresh(new_club)

    return ClubResponse(
        id=new_club.id,
        college_id=new_club.college_id,
        name=new_club.name,
        category=new_club.category,
        tagline=new_club.tagline,
        description=new_club.description,
        image_url=new_club.image_url,
        faculty_advisor=new_club.faculty_advisor,
        student_lead=new_club.student_lead,
        meeting_schedule=new_club.meeting_schedule,
        venue=new_club.venue,
        is_mandatory_eligible=new_club.is_mandatory_eligible,
        created_at=new_club.created_at,
        member_count=0,
        is_enrolled=False,
    )


@router.post("/{club_id}/activities", response_model=ClubActivityResponse, status_code=status.HTTP_201_CREATED, summary="Add a club event / activity")
def create_club_activity(
    club_id: int,
    activity_in: ClubActivityCreate,
    db: Session = Depends(get_db),
):
    club = db.query(HosClub).filter(HosClub.id == club_id).first()
    if not club:
        raise NotFoundError("Club not found")

    activity = HosClubActivity(
        club_id=club_id,
        title=activity_in.title,
        description=activity_in.description,
        event_date=activity_in.event_date,
        venue=activity_in.venue,
        event_type=activity_in.event_type,
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)

    return activity


@router.post("/activities/{activity_id}/rsvp", summary="RSVP for a club activity")
def rsvp_activity(
    activity_id: int,
    db: Session = Depends(get_db),
):
    act = db.query(HosClubActivity).filter(HosClubActivity.id == activity_id).first()
    if not act:
        raise NotFoundError("Activity not found")

    act.rsvp_count = (act.rsvp_count or 0) + 1
    db.commit()
    return {"message": "RSVP recorded!", "rsvp_count": act.rsvp_count}
