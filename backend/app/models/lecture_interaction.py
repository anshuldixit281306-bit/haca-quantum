"""Durable interaction history for interactive visual lectures."""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class LectureInteraction(Base):
    __tablename__ = "lecture_interactions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    lecture_id: Mapped[int] = mapped_column(ForeignKey("lectures.id", ondelete="CASCADE"), index=True)
    segment_id: Mapped[int | None] = mapped_column(ForeignKey("lecture_segments.id", ondelete="SET NULL"), nullable=True)
    event_type: Mapped[str] = mapped_column(String(50), index=True)
    concept: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    video_time: Mapped[float | None] = mapped_column(nullable=True)
    correct: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    xp_awarded: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    details: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", backref="lecture_interactions")
    lecture = relationship("Lecture", backref="interactions")
    segment = relationship("LectureSegment")
