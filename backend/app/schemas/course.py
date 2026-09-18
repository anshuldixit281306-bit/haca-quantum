"""
Pydantic schemas for quantum-learning courses.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CourseBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: str = Field(..., min_length=5)
    difficulty: str = Field(default="beginner", max_length=30)
    category: str = Field(default="fundamentals", max_length=50)


class CourseCreate(CourseBase):
    """Schema for creating a course."""
    pass


class CourseUpdate(BaseModel):
    """Schema for updating a course."""

    title: str | None = Field(default=None, min_length=2, max_length=200)
    description: str | None = Field(default=None, min_length=5)
    difficulty: str | None = Field(default=None, max_length=30)
    category: str | None = Field(default=None, max_length=50)


class CourseResponse(CourseBase):
    """Public course response."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime