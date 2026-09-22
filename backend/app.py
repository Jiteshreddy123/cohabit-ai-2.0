import os
import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError

from config import settings, validate_settings

from routes import (
    health_router, auth_router, session_router, student_router,
    interview_router, trait_router, recommendation_router,
    marketplace_router, microgig_router, chat_router,
    review_router, complaint_router, management_router, discover_router,
    clubs_router, mentorship_router,
)

from utils.exceptions import AppError

# ── Logging Configuration ────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── Validate Settings on Startup ─────────────────────────────
try:
    validate_settings()
except RuntimeError as e:
    logger.critical(f"Startup validation failed: {e}")
    raise

# ── App Initialization ────────────────────────────────────────
app = FastAPI(
    title="CoHabit-AI API",
    description="Backend API for CoHabit-AI student roommate allocation, verified reviews, complaints & discovery system.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── Create Database Tables & Auto-Seed Mock Details ───────────
from database import engine, Base, SessionLocal
import models # Ensure models are loaded
from sqlalchemy import text

Base.metadata.create_all(bind=engine)

# Apply non-destructive migrations safely
try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE college ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT 'Main Campus';"))
        conn.execute(text("ALTER TABLE college ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT 'Bengaluru';"))
        conn.execute(text("ALTER TABLE college ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'Karnataka';"))
        conn.execute(text("ALTER TABLE college ADD COLUMN IF NOT EXISTS description VARCHAR(1000) DEFAULT 'Premier institution offering modern campus and residential living facilities.';"))
        conn.execute(text("ALTER TABLE college ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);"))
        conn.execute(text("ALTER TABLE student ADD COLUMN IF NOT EXISTS mentor_id INTEGER REFERENCES academic_mentors(id);"))
except Exception as mig_err:
    logger.warning(f"Database migration notice: {mig_err}")

# Auto-seed mock data on startup if database is fresh
try:
    db_check = SessionLocal()
    from models.college import College
    from models.student import Student
    from models.club import HosClub

    if db_check.query(College).count() == 0:
        logger.info("Fresh database detected. Seeding mock discovery and complaints...")
        from seed_discovery_data import seed_discovery_and_complaint_data
        seed_discovery_and_complaint_data()

    if db_check.query(Student).count() == 0:
        logger.info("Seeding mock demo students and interviews...")
        from seed_demo_students import seed_demo_students_and_interviews
        seed_demo_students_and_interviews()

    if db_check.query(HosClub).count() == 0:
        logger.info("Seeding mock Hos-Clubs and Academic Mentors...")
        from seed_clubs_and_mentors import seed_clubs_and_mentors
        seed_clubs_and_mentors()

    db_check.close()
except Exception as seed_err:
    logger.warning(f"Auto-seed notice: {seed_err}")




# ── CORS Middleware ───────────────────────────────────────────
# Parse allowed origins from settings — supports multiple comma-separated values
_allowed_origins = [o.strip() for o in settings.FRONTEND_URL.split(",") if o.strip()]
if settings.ENV != "production":
    # In development, allow localhost on any port for convenience
    _allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Centralized Exception Handlers ────────────────────────────
@app.exception_handler(AppError)
def app_error_handler(request: Request, exc: AppError):
    """Handler for custom application-specific exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message}
    )

@app.exception_handler(RequestValidationError)
def validation_error_handler(request: Request, exc: RequestValidationError):
    """Handler for standard FastAPI request schema validation errors."""
    errors = []
    for err in exc.errors():
        loc = " -> ".join(str(x) for x in err.get("loc", []))
        msg = err.get("msg", "Validation error")
        errors.append(f"{loc}: {msg}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "; ".join(errors)}
    )

@app.exception_handler(Exception)
def general_exception_handler(request: Request, exc: Exception):
    """Catch-all handler for unhandled internal exceptions to prevent leaking stack traces."""
    logger.exception(f"Unhandled Exception on {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please contact support."}
    )

# ── Include Routers ───────────────────────────────────────────
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(session_router)
app.include_router(student_router)
app.include_router(interview_router)
app.include_router(trait_router)
app.include_router(recommendation_router)
app.include_router(marketplace_router)
app.include_router(microgig_router)
app.include_router(chat_router)
app.include_router(review_router)
app.include_router(complaint_router)
app.include_router(management_router)
app.include_router(discover_router)
app.include_router(clubs_router)
app.include_router(mentorship_router)


@app.api_route("/api/seed-mock-data", methods=["GET", "POST"])
def trigger_seed_mock_data():
    """Endpoint to seed or refresh mock colleges, demo students, hostels, reviews, clubs, and mentors."""
    from seed_discovery_data import seed_discovery_and_complaint_data
    from seed_demo_students import seed_demo_students_and_interviews
    from seed_clubs_and_mentors import seed_clubs_and_mentors
    try:
        seed_discovery_and_complaint_data()
        seed_demo_students_and_interviews()
        seed_clubs_and_mentors()
        return {"status": "success", "message": "All mock data (Colleges, Hostels, Reviews, Students, Hos-Clubs, Mentors) seeded successfully!"}
    except Exception as e:
        logger.exception(f"Error executing manual seed: {e}")
        return JSONResponse(status_code=500, content={"status": "error", "detail": str(e)})


# ── Uploads Static Directory ──────────────────────────────────

uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# ── Serve React Frontend ────────────────────────────────────────

# Serve static assets (js, css) from the dist/assets folder
if os.path.isdir("static/assets"):
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")

@app.api_route("/{full_path:path}", methods=["GET"])
def serve_frontend(full_path: str):
    # Try to serve requested static file if it exists
    file_path = os.path.join("static", full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # Fallback to index.html for React Router
    index_path = os.path.join("static", "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    
    # Development fallback
    return {
        "message": "Welcome to Cohabit-AI API. (Frontend not built yet)",
        "docs": "/docs"
    }