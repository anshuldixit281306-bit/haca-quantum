from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.concept_mastery import ConceptMastery
from app.models.lectures import Lecture
from app.models.user import User
from app.models.user_activity import UserActivity
from app.routes.auth import get_current_user

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.get("")
def get_recommendations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    mastery = db.query(ConceptMastery).filter(ConceptMastery.user_id == current_user.id).order_by(ConceptMastery.mastery_score.asc()).all()
    weak = {item.concept.lower() for item in mastery if item.mastery_score < 70}
    lectures = db.query(Lecture).order_by(Lecture.order_no).all()
    recommendations = []
    for lecture in lectures:
        text = f"{lecture.title} {lecture.topic} {lecture.description}".lower()
        if not weak or any(concept in text for concept in weak):
            recommendations.append({"type": "lecture", "title": lecture.title, "description": lecture.description, "lecture_id": lecture.id, "reason": "Build confidence in a concept that needs practice." if weak else "Continue your learning path."})
        if len(recommendations) >= 3:
            break
    return {"recommendations": recommendations, "weak_concepts": [item.concept for item in mastery if item.mastery_score < 70], "mastery": [{"concept": item.concept, "score": item.mastery_score} for item in mastery]}


@router.get("/activity")
def get_activity(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(UserActivity).filter(UserActivity.user_id == current_user.id).order_by(UserActivity.created_at.desc()).limit(50).all()
    return [{"id": item.id, "type": item.activity_type, "details": item.details, "created_at": item.created_at} for item in items]