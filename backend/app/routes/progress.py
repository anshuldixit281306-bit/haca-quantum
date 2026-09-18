"""
Learning progress routes for QuantumLearn.
"""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.course import Course
from app.models.lecture_progress import LectureProgress
from app.models.lectures import Lecture
from app.models.progress import Progress
from app.models.user import User
from app.models.user_activity import UserActivity
from app.routes.auth import get_current_user


router = APIRouter(
    prefix="/api/progress",
    tags=["Learning Progress"],
)


# =========================================================
# COURSE LEVEL PROGRESS
# =========================================================


@router.get("/me")
def get_my_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get course-level progress of the currently logged-in student.
    """

    progress_records = (
        db.query(Progress)
        .filter(Progress.user_id == current_user.id)
        .all()
    )

    return [
        {
            "id": progress.id,
            "course_id": progress.course_id,
            "completion_percentage": progress.completion_percentage,
            "score": progress.score,
            "completed": progress.completed,
            "last_accessed": progress.last_accessed,
        }
        for progress in progress_records
    ]


@router.get("/course/{course_id}")
def get_course_progress(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get current user's progress for a specific course.
    """

    course = db.get(Course, course_id)

    if course is None:
        raise HTTPException(
            status_code=404,
            detail="Course not found.",
        )

    progress = (
        db.query(Progress)
        .filter(
            Progress.user_id == current_user.id,
            Progress.course_id == course_id,
        )
        .first()
    )

    if progress is None:
        return {
            "course_id": course_id,
            "completion_percentage": 0.0,
            "score": 0.0,
            "completed": False,
            "message": "No progress recorded yet.",
        }

    return {
        "course_id": progress.course_id,
        "completion_percentage": progress.completion_percentage,
        "score": progress.score,
        "completed": progress.completed,
        "last_accessed": progress.last_accessed,
    }


@router.post("/course/{course_id}")
def update_course_progress(
    course_id: int,
    completion_percentage: float,
    score: float = 0.0,
    completed: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create or update learning progress for a course.
    """

    # -----------------------------------------------------
    # Validate completion percentage
    # -----------------------------------------------------

    if completion_percentage < 0 or completion_percentage > 100:
        raise HTTPException(
            status_code=400,
            detail="Completion percentage must be between 0 and 100.",
        )

    # -----------------------------------------------------
    # Validate score
    # -----------------------------------------------------

    if score < 0 or score > 100:
        raise HTTPException(
            status_code=400,
            detail="Score must be between 0 and 100.",
        )

    # -----------------------------------------------------
    # Check course exists
    # -----------------------------------------------------

    course = db.get(Course, course_id)

    if course is None:
        raise HTTPException(
            status_code=404,
            detail="Course not found.",
        )

    # -----------------------------------------------------
    # Get existing progress
    # -----------------------------------------------------

    progress = (
        db.query(Progress)
        .filter(
            Progress.user_id == current_user.id,
            Progress.course_id == course_id,
        )
        .first()
    )

    # -----------------------------------------------------
    # Create progress if it does not exist
    # -----------------------------------------------------

    if progress is None:

        progress = Progress(
            user_id=current_user.id,
            course_id=course_id,
            completion_percentage=completion_percentage,
            score=score,
            completed=completed,
        )

        db.add(progress)

    # -----------------------------------------------------
    # Update existing progress
    # -----------------------------------------------------

    else:

        progress.completion_percentage = completion_percentage
        progress.score = score
        progress.completed = completed

    # -----------------------------------------------------
    # Save progress
    # -----------------------------------------------------

    db.commit()
    db.refresh(progress)

    # -----------------------------------------------------
    # Course activity
    #
    # IMPORTANT:
    # This is a course endpoint, so course_id is used.
    # lecture_id must NOT be used here.
    # -----------------------------------------------------

    activity = UserActivity(
        user_id=current_user.id,
        activity_type=(
            "course_completed"
            if completed
            else "course_started"
        ),
        details={
            "course_id": course_id,
            "completion_percentage": completion_percentage,
        },
    )

    db.add(activity)
    db.commit()

    # -----------------------------------------------------
    # Response
    # -----------------------------------------------------

    return {
        "success": True,
        "message": "Progress updated successfully.",
        "progress": {
            "id": progress.id,
            "course_id": progress.course_id,
            "completion_percentage": progress.completion_percentage,
            "score": progress.score,
            "completed": progress.completed,
            "last_accessed": progress.last_accessed,
        },
    }


# =========================================================
# LECTURE LEVEL PROGRESS
# =========================================================


@router.get("/lectures")
def get_lecture_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get lecture-level progress for the currently logged-in user.

    Returns all lectures. If a lecture has no progress
    record yet, it is returned with 0% progress.
    """

    lectures = (
        db.query(Lecture)
        .order_by(Lecture.order_no)
        .all()
    )

    result = []

    for lecture in lectures:

        progress = (
            db.query(LectureProgress)
            .filter(
                LectureProgress.user_id == current_user.id,
                LectureProgress.lecture_id == lecture.id,
            )
            .first()
        )

        # -------------------------------------------------
        # No progress record
        # -------------------------------------------------

        if progress is None:

            result.append(
                {
                    "lecture_id": lecture.id,
                    "course_id": lecture.course_id,
                    "title": lecture.title,
                    "topic": lecture.topic,
                    "description": lecture.description,
                    "order_no": lecture.order_no,
                    "completion_percentage": 0.0,
                    "completed": False,
                    "last_accessed": None,
                }
            )

        # -------------------------------------------------
        # Existing progress
        # -------------------------------------------------

        else:

            result.append(
                {
                    "lecture_id": lecture.id,
                    "course_id": lecture.course_id,
                    "title": lecture.title,
                    "topic": lecture.topic,
                    "description": lecture.description,
                    "order_no": lecture.order_no,
                    "completion_percentage": (
                        progress.completion_percentage
                    ),
                    "completed": progress.completed,
                    "last_accessed": progress.last_accessed,
                }
            )

    return result


@router.get("/lecture/{lecture_id}")
def get_single_lecture_progress(
    lecture_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get progress for one lecture.
    """

    # -----------------------------------------------------
    # Check lecture exists
    # -----------------------------------------------------

    lecture = db.get(Lecture, lecture_id)

    if lecture is None:
        raise HTTPException(
            status_code=404,
            detail="Lecture not found.",
        )

    # -----------------------------------------------------
    # Get progress
    # -----------------------------------------------------

    progress = (
        db.query(LectureProgress)
        .filter(
            LectureProgress.user_id == current_user.id,
            LectureProgress.lecture_id == lecture_id,
        )
        .first()
    )

    # -----------------------------------------------------
    # No progress
    # -----------------------------------------------------

    if progress is None:

        return {
            "lecture_id": lecture.id,
            "course_id": lecture.course_id,
            "title": lecture.title,
            "topic": lecture.topic,
            "description": lecture.description,
            "completion_percentage": 0.0,
            "completed": False,
            "last_accessed": None,
        }

    # -----------------------------------------------------
    # Existing progress
    # -----------------------------------------------------

    return {
        "lecture_id": lecture.id,
        "course_id": lecture.course_id,
        "title": lecture.title,
        "topic": lecture.topic,
        "description": lecture.description,
        "completion_percentage": progress.completion_percentage,
        "completed": progress.completed,
        "last_accessed": progress.last_accessed,
    }


@router.post("/lecture/{lecture_id}")
def update_lecture_progress(
    lecture_id: int,
    completion_percentage: float,
    completed: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create or update progress for a lecture.
    """

    # -----------------------------------------------------
    # Validate completion percentage
    # -----------------------------------------------------

    if completion_percentage < 0 or completion_percentage > 100:
        raise HTTPException(
            status_code=400,
            detail="Completion percentage must be between 0 and 100.",
        )

    # -----------------------------------------------------
    # Check lecture exists
    # -----------------------------------------------------

    lecture = db.get(Lecture, lecture_id)

    if lecture is None:
        raise HTTPException(
            status_code=404,
            detail="Lecture not found.",
        )

    # -----------------------------------------------------
    # Automatically mark completed at 100%
    # -----------------------------------------------------

    if completion_percentage >= 100:
        completion_percentage = 100
        completed = True

    # -----------------------------------------------------
    # Get existing lecture progress
    # -----------------------------------------------------

    progress = (
        db.query(LectureProgress)
        .filter(
            LectureProgress.user_id == current_user.id,
            LectureProgress.lecture_id == lecture_id,
        )
        .first()
    )

    # -----------------------------------------------------
    # Create new lecture progress
    # -----------------------------------------------------

    if progress is None:

        progress = LectureProgress(
            user_id=current_user.id,
            lecture_id=lecture_id,
            completion_percentage=completion_percentage,
            completed=completed,
            last_accessed=datetime.utcnow(),
        )

        db.add(progress)

    # -----------------------------------------------------
    # Update existing lecture progress
    # -----------------------------------------------------

    else:

        progress.completion_percentage = completion_percentage
        progress.completed = completed
        progress.last_accessed = datetime.utcnow()

    # -----------------------------------------------------
    # Save lecture progress
    # -----------------------------------------------------

    db.commit()
    db.refresh(progress)

    # -----------------------------------------------------
    # Lecture activity
    # -----------------------------------------------------

    activity = UserActivity(
        user_id=current_user.id,
        activity_type=(
            "lecture_completed"
            if completed
            else "lecture_started"
        ),
        details={
            "lecture_id": lecture_id,
            "course_id": lecture.course_id,
            "completion_percentage": completion_percentage,
        },
    )

    db.add(activity)
    db.commit()

    # -----------------------------------------------------
    # Response
    # -----------------------------------------------------

    return {
        "success": True,
        "message": "Lecture progress updated successfully.",
        "progress": {
            "id": progress.id,
            "lecture_id": progress.lecture_id,
            "completion_percentage": progress.completion_percentage,
            "completed": progress.completed,
            "last_accessed": progress.last_accessed,
        },
    }


# =========================================================
# AI PROGRESS REPORT (Profile)
# =========================================================

@router.get("/profile/report")
def get_profile_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Comprehensive learning report for the student's profile:
    Lectures taken/completed, quizzes taken/passed, questions attempted,
    correct/wrong, accuracy %, challenges completed, XP, and AI insights.
    """
    from app.models.assessment_attempt import AssessmentAttempt, AssessmentAnswer
    from app.models.challenges import ChallengeAttempt
    from app.models.concept_mastery import ConceptMastery
    from app.services.ai_provider import get_ai_provider

    # Lectures
    lecture_rows = (
        db.query(LectureProgress)
        .filter(LectureProgress.user_id == current_user.id)
        .all()
    )
    lectures_completed = sum(1 for r in lecture_rows if r.completed or getattr(r, "quiz_passed", False))
    total_lectures_taken = len(lecture_rows)
    lecture_xp = sum(r.xp_earned or 0 for r in lecture_rows)

    # Assessments & Quizzes
    attempts = (
        db.query(AssessmentAttempt)
        .filter(AssessmentAttempt.user_id == current_user.id)
        .all()
    )
    assessment_questions = sum(a.total for a in attempts)
    assessment_correct = sum(a.score for a in attempts)

    activities = (
        db.query(UserActivity)
        .filter(UserActivity.user_id == current_user.id)
        .all()
    )
    quiz_activities = [a for a in activities if a.activity_type == "lecture_quiz_submitted"]
    quizzes_taken = len(quiz_activities)
    quizzes_passed = sum(1 for a in quiz_activities if (a.details or {}).get("passed"))
    quiz_questions = sum((a.details or {}).get("total", 5) for a in quiz_activities)
    quiz_correct = sum((a.details or {}).get("correct", 0) for a in quiz_activities)

    total_questions = assessment_questions + quiz_questions
    total_correct = assessment_correct + quiz_correct
    wrong_answers = max(0, total_questions - total_correct)
    accuracy = round((total_correct / total_questions * 100), 1) if total_questions > 0 else 0.0

    # Challenges
    try:
        challenges = db.query(ChallengeAttempt).filter(ChallengeAttempt.user_id == current_user.id).all()
        challenges_done = len(challenges)
    except Exception:
        challenges_done = 0

    # Total XP
    total_xp = (current_user.xp or 0) + lecture_xp + (quizzes_passed * 30)

    # Estimated time taken
    # Each completed lecture ~15 mins, each quiz ~5 mins, each activity ~2 mins
    time_taken_minutes = (lectures_completed * 15) + (quizzes_taken * 5) + (len(activities) * 2)

    # Concepts
    masteries = db.query(ConceptMastery).filter(ConceptMastery.user_id == current_user.id).all()
    weak_concepts = [
        {"concept": m.concept, "score": round(m.mastery_score * 100, 1)}
        for m in sorted(masteries, key=lambda m: m.mastery_score)[:3]
    ]
    strong_concepts = [
        {"concept": m.concept, "score": round(m.mastery_score * 100, 1)}
        for m in sorted(masteries, key=lambda m: m.mastery_score, reverse=True)[:3]
    ]

    report_data = {
        "user_name": current_user.name,
        "user_email": current_user.email,
        "role": current_user.role,
        "lectures_taken": total_lectures_taken,
        "lectures_completed": lectures_completed,
        "quizzes_taken": quizzes_taken,
        "quizzes_passed": quizzes_passed,
        "total_questions_attempted": total_questions,
        "correct_answers": total_correct,
        "wrong_answers": wrong_answers,
        "accuracy": accuracy,
        "time_taken_minutes": time_taken_minutes,
        "challenges_done": challenges_done,
        "total_xp": total_xp,
        "badges": current_user.badges or [],
        "weak_concepts": weak_concepts,
        "strong_concepts": strong_concepts,
    }

    # Generate AI learning feedback using AI keys
    try:
        provider = get_ai_provider()
        prompt = (
            f"Generate a personalized learning progress report and roadmap for student {current_user.name}.\n"
            f"Stats: Lectures completed: {lectures_completed}, Quizzes taken: {quizzes_taken} (Passed: {quizzes_passed}), "
            f"Questions attempted: {total_questions} with {accuracy}% accuracy ({total_correct} correct, {wrong_answers} wrong), "
            f"Estimated study time: {time_taken_minutes} mins, Challenges: {challenges_done}, Total XP: {total_xp}.\n"
            "Provide a motivating, concise report with: 1) Performance Overview, 2) Quantum Strengths & Growth Areas, 3) Actionable Next Step."
        )
        ai_res = provider.ask(question=prompt, context="You are the QuantumLearn Lead AI Mentor.")
        ai_feedback = ai_res.get("answer") or ai_res.get("explanation") or ai_res.get("message") or ""
        report_data["ai_analysis"] = ai_feedback
    except Exception:
        report_data["ai_analysis"] = (
            f"Keep up the momentum, {current_user.name}! You've completed {lectures_completed} lectures with an accuracy of {accuracy}%. "
            "Continue through the learning path and practice Bell state circuits to sharpen your quantum intuition."
        )

    return report_data