from datetime import datetime

from sqlalchemy import DateTime, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    role: Mapped[str] = mapped_column(
        String(20),
        default="student",
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    total_xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    badges: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    learning_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    progress = relationship(
        "Progress",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    lecture_progress = relationship(
        "LectureProgress",
        back_populates="user",
        cascade="all, delete-orphan",
    )