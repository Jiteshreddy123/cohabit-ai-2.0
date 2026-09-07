"""
Application configuration.

Uses Pydantic BaseSettings to read environment variables from .env.
All secrets and connection details live here — never hardcoded in routes.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ── Environment ───────────────────────────────────────────
    ENV: str = "development"  # "development" | "production"

    # ── Database ──────────────────────────────────────────────
    DATABASE_URL: str = ""
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "cohabit-ai_DB"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = ""

    # ── JWT ───────────────────────────────────────────────────
    JWT_SECRET: str = "cohabit-ai-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ── External APIs ──────────────────────────────────────────
    GEMINI_API_KEY: str = ""

    # ── SMTP Settings ──────────────────────────────────────────
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""

    # ── CORS ─────────────────────────────────────────────────
    # Comma-separated list of allowed origins, e.g. "http://localhost:3000,https://app.cohabit.ai"
    FRONTEND_URL: str = "http://localhost:3000"

    @property
    def get_db_url(self) -> str:
        """Build or return the PostgreSQL connection string."""
        if self.DATABASE_URL:
            # SQLAlchemy 2.0 requires postgresql:// instead of postgres://
            return self.DATABASE_URL.replace("postgres://", "postgresql://", 1)
            
        from urllib.parse import quote_plus
        encoded_password = quote_plus(self.DB_PASSWORD)
        return (
            f"postgresql://{self.DB_USER}:{encoded_password}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"



# Singleton instance — import this everywhere
settings = Settings()


def validate_settings() -> None:
    """Validates critical settings on startup. Raises if running in production with insecure defaults."""
    import logging
    log = logging.getLogger(__name__)

    if not settings.GEMINI_API_KEY:
        raise RuntimeError(
            "GEMINI_API_KEY is not set. Set it in your .env file before starting the server."
        )

    if settings.ENV == "production":
        default_secret = "cohabit-ai-secret-key-change-in-production"
        if settings.JWT_SECRET == default_secret:
            raise RuntimeError(
                "JWT_SECRET is using the default insecure value. "
                "Set a strong, unique secret in your .env file before deploying to production."
            )

    log.info(f"CoHabit-AI starting in '{settings.ENV}' environment")
