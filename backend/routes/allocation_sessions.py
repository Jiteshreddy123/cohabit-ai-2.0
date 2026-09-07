from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.allocation_session import (
    AllocationSessionCreate,
    AllocationSessionResponse,
    RoomInventoryUpdate,
    SessionStatusUpdate,
)
import services.allocation_session_service as session_service
from routes.auth import get_current_college
from utils.exceptions import NotFoundError, ValidationError

router = APIRouter(prefix="/allocation-sessions", tags=["Allocation Sessions"])


@router.get("/", response_model=list[AllocationSessionResponse])
def get_sessions(
    db: Session = Depends(get_db),
    current_college=Depends(get_current_college)
):
    """Retrieves all allocation sessions for the logged-in college."""
    return session_service.get_allocation_sessions(db, college_id=current_college.id)


@router.get("/{session_id}", response_model=AllocationSessionResponse)
def get_session_by_id(
    session_id: int,
    db: Session = Depends(get_db),
    current_college=Depends(get_current_college)
):
    """Retrieves a single allocation session by ID."""
    try:
        session = session_service.get_allocation_session_by_id(db, session_id)
        if session.college_id != current_college.id:
            raise HTTPException(status_code=403, detail="Access denied to this session")
        return session
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)


@router.post("/", response_model=AllocationSessionResponse, status_code=201)
def create_session(
    session_data: AllocationSessionCreate,
    db: Session = Depends(get_db),
    current_college=Depends(get_current_college)
):
    """Creates a new allocation session under the logged-in college."""
    session_data.college_id = current_college.id
    try:
        return session_service.create_allocation_session(db, session_data)
    except (NotFoundError, ValidationError) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.put("/{session_id}/room-inventory", response_model=AllocationSessionResponse)
def update_room_inventory(
    session_id: int,
    body: RoomInventoryUpdate,
    db: Session = Depends(get_db),
    current_college=Depends(get_current_college)
):
    """
    Update the room inventory for a session.
    room_inventory format: {"2": 20, "3": 10} = 20 double rooms, 10 triple rooms.
    """
    try:
        session = session_service.get_allocation_session_by_id(db, session_id)
        if session.college_id != current_college.id:
            raise HTTPException(status_code=403, detail="Access denied to this session")
        return session_service.update_room_inventory(db, session_id, body.room_inventory)
    except (NotFoundError, ValidationError) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.put("/{session_id}/status", response_model=AllocationSessionResponse)
def update_session_status(
    session_id: int,
    body: SessionStatusUpdate,
    db: Session = Depends(get_db),
    current_college=Depends(get_current_college)
):
    """Update the session lifecycle status: Draft → Active → Completed."""
    try:
        return session_service.update_session_status(
            db, session_id, body.session_status, current_college.id
        )
    except (NotFoundError, ValidationError) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.put("/{session_id}/publish", response_model=AllocationSessionResponse)
def publish_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_college=Depends(get_current_college)
):
    """Publish the session to make room allocations visible to students."""
    try:
        session = session_service.get_allocation_session_by_id(db, session_id)
        if session.college_id != current_college.id:
            raise HTTPException(status_code=403, detail="Access denied")
        session.is_published = not session.is_published
        db.commit()
        db.refresh(session)
        return session
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)
