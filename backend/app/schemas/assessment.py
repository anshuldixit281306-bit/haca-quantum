"""
Pydantic schemas for assessments and quiz submissions.
"""

from pydantic import BaseModel, Field


class AssessmentResponse(BaseModel):
    """Assessment question returned to the frontend."""

    id: int
    course_id: int
    title: str
    question: str
    options: list[str]
    difficulty: str


class AnswerSubmission(BaseModel):
    """A user's answer to one question."""

    question_id: int
    answer: str = Field(..., min_length=1)


class AssessmentSubmit(BaseModel):
    """Complete assessment submission."""

    course_id: int
    lecture_id: int | None = None
    answers: list[AnswerSubmission]


class AssessmentResult(BaseModel):
    """Result returned after assessment submission."""

    score: int
    total: int
    percentage: float
    feedback: str