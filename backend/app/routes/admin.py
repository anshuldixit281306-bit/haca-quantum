from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.assessment_attempt import AssessmentAttempt
from app.models.challenge import ChallengeAttempt
from app.models.concept_mastery import ConceptMastery
from app.models.lecture_progress import LectureProgress
from app.models.user import User
from app.models.user_activity import UserActivity
from app.routes.auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/analytics")
def analytics(_: User = Depends(require_admin), db: Session = Depends(get_db)):
	average = db.query(func.avg(AssessmentAttempt.percentage)).scalar()
	return {
		"total_users": db.query(User).count(),
		"lecture_progress_records": db.query(LectureProgress).count(),
		"assessment_attempts": db.query(AssessmentAttempt).count(),
		"average_assessment_score": round(float(average or 0), 2),
		"challenge_attempts": db.query(ChallengeAttempt).count(),
		"weak_concepts": [{"concept": item.concept, "score": item.mastery_score} for item in db.query(ConceptMastery).filter(ConceptMastery.mastery_score < 70).order_by(ConceptMastery.mastery_score).limit(20).all()],
		"recent_activity": [{"type": item.activity_type, "created_at": item.created_at, "user_id": item.user_id} for item in db.query(UserActivity).order_by(UserActivity.created_at.desc()).limit(20).all()],
	}
