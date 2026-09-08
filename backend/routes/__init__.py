from routes.health import router as health_router
from routes.auth import router as auth_router, get_current_college, get_current_student
from routes.allocation_sessions import router as session_router
from routes.students import router as student_router
from routes.interviews import router as interview_router
from routes.traits import router as trait_router
from routes.recommendations import router as recommendation_router
from routes.marketplace import router as marketplace_router
from routes.microgigs import router as microgig_router
from routes.chat import router as chat_router
from routes.reviews import router as review_router
from routes.complaints import router as complaint_router
from routes.management import router as management_router
from routes.discover import router as discover_router

__all__ = [
    "health_router",
    "auth_router",
    "session_router",
    "student_router",
    "interview_router",
    "trait_router",
    "recommendation_router",
    "marketplace_router",
    "microgig_router",
    "chat_router",
    "review_router",
    "complaint_router",
    "management_router",
    "discover_router",
    "get_current_college",
    "get_current_student",
]
