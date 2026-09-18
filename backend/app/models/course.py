from datetime import datetime

from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[str] = mapped_column(
        String(30), default="beginner", nullable=False
    )
    category: Mapped[str] = mapped_column(
        String(50), default="fundamentals", nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    assessments = relationship(
        "Assessment",
        back_populates="course",
        cascade="all, delete-orphan",
    )

    progress = relationship(
        "Progress",
        back_populates="course",
        cascade="all, delete-orphan",
    )
    lectures = relationship(
    "Lecture",
    back_populates="course",
    cascade="all, delete-orphan",
)