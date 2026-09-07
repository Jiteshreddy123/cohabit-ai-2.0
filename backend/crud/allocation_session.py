from sqlalchemy.orm import Session
from models.allocation_session import AllocationSession
from schemas.allocation_session import AllocationSessionCreate
from typing import Optional


def create_session(db: Session, session: AllocationSessionCreate) -> AllocationSession:
    db_session = AllocationSession(
        college_id=session.college_id,
        title=session.title,
        academic_year=session.academic_year,
        session_size=session.session_size,
        room_inventory=session.room_inventory or {},
        session_status="Draft"
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session


def get_sessions(db: Session, college_id: Optional[int] = None) -> list[AllocationSession]:
    query = db.query(AllocationSession)
    if college_id is not None:
        query = query.filter(AllocationSession.college_id == college_id)
    return query.all()


def get_session_by_id(db: Session, session_id: int) -> Optional[AllocationSession]:
    return db.query(AllocationSession).filter(AllocationSession.id == session_id).first()


def update_room_inventory(
    db: Session, session: AllocationSession, room_inventory: dict
) -> AllocationSession:
    session.room_inventory = room_inventory
    db.commit()
    db.refresh(session)
    return session


def update_session_status(
    db: Session, session: AllocationSession, new_status: str
) -> AllocationSession:
    session.session_status = new_status
    db.commit()
    db.refresh(session)
    return session

