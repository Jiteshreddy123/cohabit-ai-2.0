import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from config import settings, validate_settings

from routes import (
    health_router, auth_router, session_router, student_router,
    interview_router, trait_router, recommendation_router,
    marketplace_router, microgig_router, chat_router,
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
    description="Backend API for CoHabit-AI student roommate allocation system.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── Create Database Tables ───────────────────────────────────
from database import engine, Base
import models # Ensure models are loaded
Base.metadata.create_all(bind=engine)


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
# Mounted without prefixes to match requested Day 2 endpoints exactly:
# GET /health, POST /login, GET /allocation-sessions, etc.
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

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

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