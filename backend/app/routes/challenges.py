from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.challenge import ChallengeAttempt, CodingChallenge
from app.models.user import User
from app.models.user_activity import UserActivity
from app.routes.auth import get_current_user
from app.services.code_executor import execute_quantum_code

router = APIRouter(prefix="/api/challenges", tags=["Challenges"])


@router.get("")
def list_challenges(db: Session = Depends(get_db)):
	return db.query(CodingChallenge).order_by(CodingChallenge.order_no).all()


@router.get("/{challenge_id}/attempts")
def challenge_attempts(challenge_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
	return db.query(ChallengeAttempt).filter(ChallengeAttempt.challenge_id == challenge_id, ChallengeAttempt.user_id == current_user.id).order_by(ChallengeAttempt.created_at.desc()).all()


@router.post("/{challenge_id}/submit")
def submit_challenge(challenge_id: int, payload: dict[str, str], current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
	challenge = db.get(CodingChallenge, challenge_id)
	if challenge is None:
		raise HTTPException(status_code=404, detail="Challenge not found.")
	code = payload.get("code", "")
	result = execute_quantum_code(code)
	passed = bool(result.get("success")) and bool(result.get("counts"))
	attempt = ChallengeAttempt(user_id=current_user.id, challenge_id=challenge_id, code=code, passed=passed, error_message=result.get("error", ""))
	db.add(attempt)
	db.add(UserActivity(user_id=current_user.id, activity_type="challenge_attempted", details={"challenge_id": challenge_id, "passed": passed}))
	db.commit()
	return {"passed": passed, "result": result, "attempt_id": attempt.id}
