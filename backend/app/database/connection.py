"""
Database connection for QuantumLearn.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


# PostgreSQL database engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
)


# Database session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from sqlalchemy import text
    from app.database.base import Base

    from app.models.assessment import Assessment
    from app.models.assessment_attempt import AssessmentAnswer, AssessmentAttempt
    from app.models.challenge import ChallengeAttempt, CodingChallenge
    from app.models.concept_mastery import ConceptMastery
    from app.models.course import Course
    from app.models.discussion import Discussion
    from app.models.lecture_progress import LectureProgress
    from app.models.lecture_segment import LectureSegment
    from app.models.lecture_interaction import LectureInteraction
    from app.models.lectures import Lecture
    from app.models.progress import Progress
    from app.models.user import User
    from app.models.user_activity import UserActivity
    from app.models.notification import Notification
    from app.models.review import Review

    _ = (
        Assessment,
        AssessmentAttempt,
        AssessmentAnswer,
        ConceptMastery,
        CodingChallenge,
        ChallengeAttempt,
        Course,
        Discussion,
        Lecture,
        LectureProgress,
        LectureSegment,
        LectureInteraction,
        Progress,
        User,
        UserActivity,
        Notification,
        Review,
    )

    Base.metadata.create_all(bind=engine)

    _migrate_lecture_learning_columns()

    # These migrations use PostgreSQL syntax and are unnecessary for a new
    # SQLite database because create_all above creates the current schema.
    if engine.dialect.name == "postgresql":
        with engine.begin() as conn:
            try:
                conn.execute(
                    text(
                        """
                        ALTER TABLE assessments
                        ADD COLUMN IF NOT EXISTS lecture_id INTEGER REFERENCES lectures(id) ON DELETE CASCADE,
                        ADD COLUMN IF NOT EXISTS concept VARCHAR(100) DEFAULT 'Quantum Fundamentals',
                        ADD COLUMN IF NOT EXISTS explanation TEXT DEFAULT '',
                        ADD COLUMN IF NOT EXISTS order_no INTEGER DEFAULT 1;
                        """
                    )
                )
                conn.execute(
                    text(
                        """
                        ALTER TABLE assessments ALTER COLUMN course_id DROP NOT NULL;
                        """
                    )
                )
            except Exception as exc:
                print("Notice: Table migration check info:", exc)


def _migrate_lecture_learning_columns() -> None:
    """Add learning columns to existing SQLite or PostgreSQL databases."""
    from sqlalchemy import inspect, text

    migrations = {
        "users": {
            "total_xp": "INTEGER NOT NULL DEFAULT 0",
            "badges": "JSON NOT NULL DEFAULT '[]'",
            "learning_streak": "INTEGER NOT NULL DEFAULT 0",
        },
        "lecture_progress": {
            "watched_concepts": "JSON NOT NULL DEFAULT '[]'",
            "explored_concepts": "JSON NOT NULL DEFAULT '[]'",
            "simulations_run": "INTEGER NOT NULL DEFAULT 0",
            "questions_correct": "INTEGER NOT NULL DEFAULT 0",
            "xp_earned": "INTEGER NOT NULL DEFAULT 0",
            "quiz_passed": "BOOLEAN NOT NULL DEFAULT FALSE",
        },
    }

    inspector = inspect(engine)
    with engine.begin() as conn:
        for table, columns in migrations.items():
            existing = {column["name"] for column in inspector.get_columns(table)}
            for name, definition in columns.items():
                if name in existing:
                    continue
                if engine.dialect.name == "postgresql" and definition.startswith("JSON"):
                    definition = definition.replace("JSON", "JSONB", 1)
                conn.execute(text(f'ALTER TABLE "{table}" ADD COLUMN "{name}" {definition}'))