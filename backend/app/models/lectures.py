"""
QuantumLearn lecture model.
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Lecture(Base):
    __tablename__ = "lectures"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    topic: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    youtube_url: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    thumbnail_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    duration: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    order_no: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    course = relationship(
        "Course",
        back_populates="lectures",
    )

    progress = relationship(
        "LectureProgress",
        back_populates="lecture",
        cascade="all, delete-orphan",
    )

    segments = relationship(
        "LectureSegment",
        back_populates="lecture",
        cascade="all, delete-orphan",
        order_by="LectureSegment.order_no",
    )