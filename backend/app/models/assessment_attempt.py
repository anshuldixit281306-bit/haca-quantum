"""
Assessment attempts and user answers for QuantumLearn.
"""

from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    lecture_id: Mapped[int | None] = mapped_column(
        ForeignKey("lectures.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    course_id: Mapped[int | None] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    score: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    total: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    percentage: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )

    passed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    feedback: Mapped[str] = mapped_column(
        Text,
        default="",
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    user = relationship("User", backref="assessment_attempts")
    lecture = relationship("Lecture", backref="assessment_attempts")
    course = relationship("Course", backref="assessment_attempts")
    answers = relationship("AssessmentAnswer", back_populates="attempt", cascade="all, delete-orphan")


class AssessmentAnswer(Base):
    __tablename__ = "assessment_answers"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    attempt_id: Mapped[int] = mapped_column(
        ForeignKey("assessment_attempts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    question_id: Mapped[int] = mapped_column(
        ForeignKey("assessments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    selected_answer: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    is_correct: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    concept: Mapped[str] = mapped_column(
        String(100),
        default="Quantum Fundamentals",
        nullable=False,
    )

    attempt = relationship("AssessmentAttempt", back_populates="answers")
    question = relationship("Assessment")
