"""
Assessment model for QuantumLearn.
"""

from sqlalchemy import ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    course_id: Mapped[int | None] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    lecture_id: Mapped[int | None] = mapped_column(
        ForeignKey("lectures.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    question: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    options: Mapped[list] = mapped_column(
        JSON,
        nullable=False,
    )

    correct_answer: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    difficulty: Mapped[str] = mapped_column(
        String(30),
        default="beginner",
        nullable=False,
    )

    concept: Mapped[str] = mapped_column(
        String(100),
        default="Quantum Fundamentals",
        nullable=False,
    )

    explanation: Mapped[str] = mapped_column(
        Text,
        default="",
        nullable=False,
    )

    order_no: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )

    course = relationship(
        "Course",
        back_populates="assessments",
    )

    lecture = relationship(
        "Lecture",
        backref="assessments",
    )