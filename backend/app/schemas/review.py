"""
Pydantic schemas for reviews.
"""

from datetime import datetime
from pydantic import BaseModel, Field


class ReviewBase(BaseModel):
    user_name: str = Field(..., min_length=1, max_length=100)
    user_role: str = Field("Quantum Learner", max_length=100)
    rating: int = Field(5, ge=1, le=5)
    comment: str = Field(..., min_length=3, max_length=1000)


class ReviewCreate(ReviewBase):
    pass


class ReviewUpdate(BaseModel):
    user_name: str | None = None
    user_role: str | None = None
    rating: int | None = Field(None, ge=1, le=5)
    comment: str | None = None


class ReviewResponse(ReviewBase):
    id: int
    initials: str
    created_at: datetime

    class Config:
        from_attributes = True
