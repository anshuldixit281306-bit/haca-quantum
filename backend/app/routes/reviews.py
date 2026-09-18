"""
Review API routes for QuantumLearn.
Provides public endpoints to get and create reviews,
and admin endpoints to edit and delete reviews.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.review import Review
from app.models.user import User
from app.routes.auth import require_admin
from app.schemas.review import ReviewCreate, ReviewResponse, ReviewUpdate

router = APIRouter(
    prefix="/api/reviews",
    tags=["Reviews"],
)


def get_initials(name: str) -> str:
    """Generate 1-2 uppercase initials from a name."""
    parts = name.strip().split()
    if not parts:
        return "QL"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return f"{parts[0][0]}{parts[-1][0]}".upper()


@router.get("", response_model=list[ReviewResponse])
def list_reviews(db: Session = Depends(get_db)):
    """Fetch all reviews for public display in the marquee."""
    return db.query(Review).order_by(Review.created_at.desc()).all()


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(payload: ReviewCreate, db: Session = Depends(get_db)):
    """Submit a new review."""
    initials = get_initials(payload.user_name)
    review = Review(
        user_name=payload.user_name.strip(),
        user_role=payload.user_role.strip() or "Quantum Learner",
        initials=initials,
        rating=max(1, min(5, payload.rating)),
        comment=payload.comment.strip(),
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.put("/admin/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    payload: ReviewUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Admin endpoint to edit a review."""
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")

    if payload.user_name is not None:
        review.user_name = payload.user_name.strip()
        review.initials = get_initials(review.user_name)
    if payload.user_role is not None:
        review.user_role = payload.user_role.strip()
    if payload.rating is not None:
        review.rating = max(1, min(5, payload.rating))
    if payload.comment is not None:
        review.comment = payload.comment.strip()

    db.commit()
    db.refresh(review)
    return review


@router.delete("/admin/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Admin endpoint to delete a review."""
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")

    db.delete(review)
    db.commit()
    return None
