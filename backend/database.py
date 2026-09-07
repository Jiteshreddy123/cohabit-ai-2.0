"""
Database connection module.

Creates the SQLAlchemy engine, session factory, and exposes the
`get_db` dependency for FastAPI route injection.

No route should create database connections manually — always use get_db.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from config import settings

# ── Engine ────────────────────────────────────────────────────
engine = create_engine(
    settings.get_db_url,
    pool_pre_ping=True,       # Verify connections before checkout
    pool_size=10,             # Max persistent connections
    max_overflow=20,          # Extra connections under load
    echo=False,               # Set True to log SQL queries for debugging
)

# ── Session Factory ───────────────────────────────────────────
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# ── Declarative Base ──────────────────────────────────────────
Base = declarative_base()


# ── FastAPI Dependency ────────────────────────────────────────
def get_db():
    """
    Yield a database session for the duration of a single request.
    Automatically closes the session when the request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
