"""
Models package.

Import all models here so that Base.metadata sees every table
when the application starts. This also provides convenient imports:

    from models import College, Student, AllocationSession, Hostel, Review, Complaint, ...
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
from models.hostel import Hostel
from models.review import Review, ReviewImage
from models.complaint import Complaint, ComplaintImage, ComplaintUpdate
from models.club import HosClub, HosClubMembership, HosClubActivity
from models.mentorship import AcademicMentor, MonthlyCheckinCall

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
    "Hostel",
    "Review",
    "ReviewImage",
    "Complaint",
    "ComplaintImage",
    "ComplaintUpdate",
    "HosClub",
    "HosClubMembership",
    "HosClubActivity",
    "AcademicMentor",
    "MonthlyCheckinCall",
]

