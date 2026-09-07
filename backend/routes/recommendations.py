from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from routes.auth import get_current_college
from models.recommendation import Recommendation
from models.recommendation_member import RecommendationMember
from schemas.recommendation import RecommendationResponse
from routes.auth import get_current_student
from typing import List

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get(
    "/my-room",
    summary="Get Student's Room",
    description="Retrieves the room allocation for the currently logged-in student, if published.",
)
def get_my_room(
    db: Session = Depends(get_db),
    current_student=Depends(get_current_student)
):
    session = current_student.allocation_session
    if not session.is_published:
        return {"published": False, "message": "Room allocation has not yet been published."}

    membership = (
        db.query(RecommendationMember)
        .filter(RecommendationMember.student_id == current_student.id)
        .first()
    )

    if not membership:
        return {"published": True, "allocated": False, "message": "You have not been allocated a room."}

    recommendation = membership.recommendation
    roommates = [
        {"id": m.student.id, "name": m.student.name, "roll_number": m.student.roll_number}
        for m in recommendation.members
    ]

    return {
        "published": True,
        "allocated": True,
        "room_number": recommendation.room_number,
        "compatibility_score": recommendation.compatibility_score,
        "reason": recommendation.reason,
        "roommates": roommates
    }

@router.get(
    "/{session_id}",
    summary="Get Recommendations",
    description="Retrieves room allocation recommendations for a specific session.",
    response_model=List[RecommendationResponse]
)
def get_recommendations(
    session_id: int,
    db: Session = Depends(get_db),
    current_college=Depends(get_current_college)
):
    recommendations = (
        db.query(Recommendation)
        .filter(Recommendation.allocation_session_id == session_id)
        .all()
    )
    return recommendations


@router.post(
    "/{session_id}/generate",
    summary="Generate Recommendations",
    description=(
        "Triggers the ML compatibility scoring and OR-Tools optimization engine "
        "to generate room allocations. Respects student preferred_room_size (hard constraint) "
        "and enforces gender segregation."
    )
)
def generate_recommendations(
    session_id: int,
    db: Session = Depends(get_db),
    current_college=Depends(get_current_college)
):
    from ml.scorer import generate_compatibility_matrix
    from ml.allocator import allocate_rooms

    # Step 1: Generate pairwise compatibility scores (gender-segregated)
    pairs_scored = generate_compatibility_matrix(db, session_id)

    # Step 2: Run OR-Tools allocation (preferred_room_size + gender hard constraints)
    result = allocate_rooms(db, session_id)

    unallocated_count = result.get("unallocated_count", 0)
    unallocated_ids = result.get("unallocated_student_ids", [])

    response = {
        "message": "Optimization completed.",
        "pairs_scored": pairs_scored,
        "rooms_allocated": result.get("rooms_allocated", 0),
        "allocation_status": result.get("status"),
    }

    if unallocated_count > 0:
        response["warning"] = (
            f"{unallocated_count} student(s) could not be allocated because their preferred "
            f"room type has no available rooms. Review room inventory or adjust student preferences."
        )
        response["unallocated_student_ids"] = unallocated_ids

    return response

