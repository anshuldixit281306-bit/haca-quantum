"""
Assessment and quiz routes for QuantumLearn.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.assessment import Assessment
from app.models.assessment_attempt import AssessmentAnswer, AssessmentAttempt
from app.models.concept_mastery import ConceptMastery
from app.models.user_activity import UserActivity
from app.routes.auth import get_current_user
from app.models.user import User
from app.schemas.assessment import (
    AssessmentResponse,
    AssessmentResult,
    AssessmentSubmit,
)


router = APIRouter(
    prefix="/api/assessment",
    tags=["Assessment"],
)


@router.get(
    "/course/{course_id}",
    response_model=list[AssessmentResponse],
)
def get_course_assessments(
    course_id: int,
    db: Session = Depends(get_db),
):
    """
    Get all assessment questions for a course.
    """

    questions = (
        db.query(Assessment)
        .filter(Assessment.course_id == course_id)
        .order_by(Assessment.id)
        .all()
    )

    return questions


@router.get(
    "/question/{question_id}",
    response_model=AssessmentResponse,
)
def get_question(
    question_id: int,
    db: Session = Depends(get_db),
):
    """
    Get a single assessment question.
    """

    question = db.get(Assessment, question_id)

    if question is None:
        raise HTTPException(
            status_code=404,
            detail="Assessment question not found.",
        )

    return question


@router.post(
    "/submit",
    response_model=AssessmentResult,
)
def submit_assessment(
    submission: AssessmentSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Evaluate submitted answers.
    """

    if not submission.answers:
        raise HTTPException(
            status_code=400,
            detail="No answers were submitted.",
        )

    question_ids = [
        answer.question_id
        for answer in submission.answers
    ]

    questions = (
        db.query(Assessment)
        .filter(Assessment.id.in_(question_ids))
        .all()
    )

    question_map = {
        question.id: question
        for question in questions
    }

    score = 0
    evaluated_answers = []

    for submitted_answer in submission.answers:
        question = question_map.get(
            submitted_answer.question_id
        )

        if question is None:
            continue

        if (
            submitted_answer.answer.strip().lower()
            == question.correct_answer.strip().lower()
        ):
            score += 1

        evaluated_answers.append((submitted_answer, question, submitted_answer.answer.strip().lower() == question.correct_answer.strip().lower()))

    total = len(submission.answers)

    percentage = round(
        (score / total) * 100,
        2,
    ) if total > 0 else 0.0

    if percentage >= 80:
        feedback = "Excellent! You have a strong understanding of this topic."
    elif percentage >= 60:
        feedback = "Good job! Review the incorrect answers and try again."
    elif percentage >= 40:
        feedback = "Keep practicing. Review the course material once more."
    else:
        feedback = "Start with the fundamentals and practice the concepts again."

    attempt = AssessmentAttempt(
        user_id=current_user.id,
        lecture_id=submission.lecture_id,
        course_id=submission.course_id,
        score=score,
        total=total,
        percentage=percentage,
        passed=percentage >= 80,
        feedback=feedback,
    )
    db.add(attempt)
    db.flush()

    for answer, question, is_correct in evaluated_answers:
        db.add(AssessmentAnswer(
            attempt_id=attempt.id,
            question_id=question.id,
            selected_answer=answer.answer,
            is_correct=is_correct,
            concept=question.concept,
        ))
        mastery = db.query(ConceptMastery).filter(
            ConceptMastery.user_id == current_user.id,
            ConceptMastery.concept == question.concept,
        ).first()
        if mastery is None:
            mastery = ConceptMastery(user_id=current_user.id, concept=question.concept)
            db.add(mastery)
        mastery.total_questions += 1
        mastery.correct_questions += int(is_correct)
        mastery.mastery_score = round((mastery.correct_questions / mastery.total_questions) * 100, 2)

    db.add(UserActivity(user_id=current_user.id, activity_type="assessment_submitted", details={"course_id": submission.course_id, "score": percentage}))
    db.commit()

    return AssessmentResult(
        score=score,
        total=total,
        percentage=percentage,
        feedback=feedback,
    )


@router.get("/attempts")
def get_assessment_attempts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    attempts = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.user_id == current_user.id
    ).order_by(AssessmentAttempt.created_at.desc()).all()
    return [{"id": item.id, "course_id": item.course_id, "lecture_id": item.lecture_id, "score": item.score, "total": item.total, "percentage": item.percentage, "passed": item.passed, "feedback": item.feedback, "created_at": item.created_at} for item in attempts]