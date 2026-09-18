"""
Pydantic schemas for QuantumLearn lectures.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class LectureBase(BaseModel):
    title: str = Field(
        ...,
        min_length=2,
        max_length=200,
    )

    description: str = Field(
        ...,
        min_length=5,
    )

    topic: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    youtube_url: str = Field(
        ...,
        min_length=5,
        max_length=500,
    )

    thumbnail_url: str | None = Field(
        default=None,
        max_length=500,
    )

    duration: str | None = Field(
        default=None,
        max_length=20,
    )

    order_no: int = Field(
        ...,
        ge=1,
    )


class LectureCreate(LectureBase):
    """Schema for creating a lecture."""

    course_id: int = Field(
        ...,
        ge=1,
    )


class LectureUpdate(BaseModel):
    """Schema for updating a lecture."""

    title: str | None = Field(
        default=None,
        min_length=2,
        max_length=200,
    )

    description: str | None = Field(
        default=None,
        min_length=5,
    )

    topic: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    youtube_url: str | None = Field(
        default=None,
        min_length=5,
        max_length=500,
    )

    thumbnail_url: str | None = Field(
        default=None,
        max_length=500,
    )

    duration: str | None = Field(
        default=None,
        max_length=20,
    )

    order_no: int | None = Field(
        default=None,
        ge=1,
    )


class LectureResponse(LectureBase):
    """Public lecture response."""

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    course_id: int
    created_at: datetime