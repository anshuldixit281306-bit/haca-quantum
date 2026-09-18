"""
Discussion and collaborative learning model for QuantumLearn lectures.
"""

from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Discussion(Base):
    __tablename__ = "discussions"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    lecture_id: Mapped[int] = mapped_column(
        ForeignKey("lectures.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    parent_id: Mapped[int | None] = mapped_column(
        ForeignKey("discussions.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    upvotes: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    is_reported: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    user = relationship("User", backref="discussions")
    lecture = relationship("Lecture", backref="discussions")
    parent = relationship("Discussion", remote_side=[id], back_populates="replies")
    replies = relationship("Discussion", back_populates="parent", cascade="all, delete-orphan")
