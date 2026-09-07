from sqlalchemy.orm import Session
from schemas.allocation_session import AllocationSessionCreate
from models.allocation_session import AllocationSession
import crud.allocation_session as crud_session
import crud.college as crud_college
from utils.exceptions import NotFoundError, ValidationError
from typing import Optional


def create_allocation_session(db: Session, session: AllocationSessionCreate) -> AllocationSession:
    # Validate college exists
    college = crud_college.get_college_by_id(db, college_id=session.college_id)
    if not college:
        raise NotFoundError(f"College with ID {session.college_id} does not exist")

    if session.session_size <= 0:
        raise ValidationError("Session size must be a positive integer")

    # Validate room inventory capacity if provided
    if session.room_inventory:
        total_beds = sum(int(k) * v for k, v in session.room_inventory.items())
        if total_beds < session.session_size:
            raise ValidationError(
                f"Room inventory only has {total_beds} beds but session requires "
                f"{session.session_size} students. Add more rooms."
            )

    return crud_session.create_session(db, session)


def get_allocation_sessions(
    db: Session, college_id: Optional[int] = None
) -> list[AllocationSession]:
    return crud_session.get_sessions(db, college_id=college_id)


def get_allocation_session_by_id(db: Session, session_id: int) -> AllocationSession:
    session = crud_session.get_session_by_id(db, session_id=session_id)
    if not session:
        raise NotFoundError(f"Allocation session with ID {session_id} not found")
    return session


def update_room_inventory(
    db: Session, session_id: int, room_inventory: dict
) -> AllocationSession:
    session = get_allocation_session_by_id(db, session_id)
    return crud_session.update_room_inventory(db, session, room_inventory)


def update_session_status(
    db: Session, session_id: int, new_status: str, college_id: int
) -> AllocationSession:
    session = get_allocation_session_by_id(db, session_id)
    if session.college_id != college_id:
        raise ValidationError("Not authorized to update this session")
    return crud_session.update_session_status(db, session, new_status)

