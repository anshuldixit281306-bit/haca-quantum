"""
Review model for user testimonials and ratings.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Integer, String, Text

from app.database.base import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String(100), nullable=False)
    user_role = Column(String(100), default="Quantum Learner")
    initials = Column(String(10), default="QL")
    rating = Column(Integer, default=5)
    comment = Column(Text, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
