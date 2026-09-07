"""
Models package.

Import all models here so that Base.metadata sees every table
when the application starts. This also provides convenient imports:

    from models import College, Student, AllocationSession, ...
"""

from models.college import College
from models.allocation_session import AllocationSession
from models.student import Student
from models.interview import Interview
from models.traits import Traits
from models.compatibility_score import CompatibilityScore
from models.recommendation import Recommendation
from models.recommendation_member import RecommendationMember
from models.marketplace import MarketplaceListing
from models.microgig import MicroGig
from models.chat import ChatConversation, ChatMessage

__all__ = [
    "College",
    "AllocationSession",
    "Student",
    "Interview",
    "Traits",
    "CompatibilityScore",
    "Recommendation",
    "RecommendationMember",
    "MarketplaceListing",
    "MicroGig",
    "ChatConversation",
    "ChatMessage",
]
