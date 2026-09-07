from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from schemas.health import HealthResponse

router = APIRouter(tags=["System health"])

@router.get("/health", response_model=HealthResponse, summary="Check health of API and Database connection")
def health_check(db: Session = Depends(get_db)):
    """
    Checks the status of the FastAPI server and database.
    """
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "unhealthy"

    return {
        "status": "healthy",
        "database": db_status
    }
