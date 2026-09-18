import sys
from pathlib import Path

# Add QuantumLearn project root to Python path.
# This allows the external ai_assisstance package
# to be imported correctly.
PROJECT_ROOT = Path(__file__).resolve().parents[2]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


"""
QuantumLearn Backend - FastAPI Application

Creates the FastAPI application, configures CORS,
initializes the database, seeds initial content,
and registers all API routers.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.connection import SessionLocal, init_db
from app.database.seed import (
    seed_if_empty,
    seed_lectures_if_empty,
)

from app.routes import (
    ai,
    assessment,
    auth,
    courses,
    lectures,
    progress,
    quantum,
    recommendations,
    challenges,
    discussions,
    admin,
    reviews,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Initialize database tables and seed initial content
    when the application starts.
    """

    # Create database tables
    init_db()

    # Open database session
    db = SessionLocal()

    try:
        # Seed courses and assessments
        seed_if_empty(db)

        # Seed exactly five prototype lectures
        seed_lectures_if_empty(db)

    finally:
        # Always close database connection
        db.close()

    yield


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "AI-powered interactive quantum computing "
        "learning platform."
    ),
    version="0.1.0",
    lifespan=lifespan,
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?" if settings.DEBUG else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ============================================================
# API ROUTERS
# ============================================================

app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(quantum.router)
app.include_router(ai.router)
app.include_router(assessment.router)
app.include_router(progress.router)
app.include_router(lectures.router)
app.include_router(recommendations.router)
app.include_router(challenges.router)
app.include_router(discussions.router)
app.include_router(admin.router)
app.include_router(reviews.router)



# ============================================================
# HEALTH CHECK
# ============================================================

@app.get(
    "/health",
    tags=["Health"],
)
def health_check() -> dict:
    """
    Check whether the QuantumLearn backend is running.
    """

    return {
        "status": "healthy",
        "service": "QuantumLearn Backend",
    }