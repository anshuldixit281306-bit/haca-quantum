from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.discussion import Discussion
from app.models.user import User
from app.routes.auth import get_current_user

router = APIRouter(prefix="/api/discussions", tags=["Discussions"])


def serialize(item):
	return {"id": item.id, "lecture_id": item.lecture_id, "user_id": item.user_id, "parent_id": item.parent_id, "content": item.content, "upvotes": item.upvotes, "created_at": item.created_at}


@router.get("")
def list_discussions(lecture_id: int | None = None, db: Session = Depends(get_db)):
	query = db.query(Discussion)
	if lecture_id:
		query = query.filter(Discussion.lecture_id == lecture_id)
	return [serialize(item) for item in query.order_by(Discussion.created_at.desc()).all()]


@router.post("")
def create_discussion(payload: dict[str, int | str | None], current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
	if not payload.get("lecture_id") or not str(payload.get("content", "")).strip():
		raise HTTPException(status_code=422, detail="lecture_id and content are required.")
	item = Discussion(lecture_id=int(payload["lecture_id"]), user_id=current_user.id, parent_id=payload.get("parent_id"), content=str(payload["content"]).strip())
	db.add(item)
	db.commit()
	db.refresh(item)
	return serialize(item)
