from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from routes.auth import get_current_college
from schemas.college import CollegeResponse

router = APIRouter(prefix="/traits", tags=["Traits"])

@router.get(
    "",
    summary="Get Traits (Placeholder)",
    description="Retrieves extracted personality traits."
)
def get_traits(current_college: CollegeResponse = Depends(get_current_college)):
    return {"message": "Traits endpoint is a placeholder.", "data": []}

@router.get(
    "/{student_id}",
    summary="Get Traits for Student",
    description="Retrieves personality traits for a specific student."
)
def get_student_traits(student_id: int, db: Session = Depends(get_db), current_college: CollegeResponse = Depends(get_current_college)):
    from sqlalchemy import text
    result = db.execute(text("SELECT * FROM traits WHERE student_id = :sid"), {"sid": student_id}).fetchone()
    if not result:
        return {"data": None}
        
    keys = result._mapping.keys()
    trait_dict = {key: result._mapping[key] for key in keys}
    return {"data": trait_dict}
