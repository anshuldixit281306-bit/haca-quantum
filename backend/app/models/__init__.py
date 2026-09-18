"""
SQLAlchemy models for QuantumLearn.
"""

from app.models.assessment import Assessment
from app.models.assessment_attempt import AssessmentAnswer, AssessmentAttempt
from app.models.challenge import ChallengeAttempt, CodingChallenge
from app.models.concept_mastery import ConceptMastery
from app.models.course import Course
from app.models.discussion import Discussion
from app.models.lecture_progress import LectureProgress
from app.models.lecture_segment import LectureSegment
from app.models.lecture_interaction import LectureInteraction
from app.models.lectures import Lecture
from app.models.progress import Progress
from app.models.user import User
from app.models.user_activity import UserActivity
from app.models.notification import Notification

__all__ = [
    "User",
    "Course",
    "Lecture",
    "LectureProgress",
    "LectureSegment",
    "LectureInteraction",
    "Progress",
    "Assessment",
    "AssessmentAttempt",
    "AssessmentAnswer",
    "ConceptMastery",
    "Discussion",
    "CodingChallenge",
    "ChallengeAttempt",
    "UserActivity",
    "Notification",
]