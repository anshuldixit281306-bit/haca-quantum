"""
Lecture visual-timeline segment model for QuantumLearn.

A segment pairs a YouTube timestamp window with a quantum concept,
a visualization type, educational copy, an optional simulation preset,
optional code mapping, and an optional interactive prediction question.

This is the data backbone of the "Interactive Visual Lecture" system.
AI-generated segmentation (section 9 pipeline) can be stored through the
same timeline endpoints administrators use today, without any schema change.
"""

from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class LectureSegment(Base):
    __tablename__ = "lecture_segments"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    lecture_id: Mapped[int] = mapped_column(
        ForeignKey("lectures.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Inclusive start / exclusive end of the segment window, in seconds.
    start_seconds: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    end_seconds: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    # Canonical concept slug, e.g. "qubit", "superposition",
    # "hadamard", "measurement", "probability", "bell".
    concept: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    # Which frontend visualization component should render this segment.
    visualization: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    explanation: Mapped[str] = mapped_column(
        Text,
        default="",
        nullable=False,
    )

    # Optional circuit simulation preset:
    # {"num_qubits": int, "gates": [...], "shots": int, "algorithm": str}
    simulation: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    # Optional code snippet with highlight mapping:
    # {"language": "python", "lines": [...], "highlights": {"line_no": ["concept", ...]}}
    code: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    # Optional interactive prediction question:
    # {"prompt": str, "options": [...], "answer_index": int, "explanation": str}
    question: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    order_no: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    lecture = relationship(
        "Lecture",
        back_populates="segments",
    )