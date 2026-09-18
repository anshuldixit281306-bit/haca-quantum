"""
Lecture routes for QuantumLearn.
"""

from datetime import datetime
import json
import random

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.visual_timelines import (
    _parse_duration,
    build_default_timeline,
)
from app.models.concept_mastery import ConceptMastery
from app.models.course import Course
from app.models.lecture_progress import LectureProgress
from app.models.lecture_segment import LectureSegment
from app.models.lecture_interaction import LectureInteraction
from app.models.lectures import Lecture
from app.models.user import User
from app.models.user_activity import UserActivity
from app.routes.auth import get_current_user
from app.schemas.lectures import (
    LectureCreate,
    LectureResponse,
    LectureUpdate,
)


router = APIRouter(
    prefix="/api/lectures",
    tags=["Lectures"],
)


@router.get(
    "",
    response_model=list[LectureResponse],
)
def get_lectures(
    course_id: int | None = None,
    db: Session = Depends(get_db),
):
    """
    Get all lectures.

    If course_id is provided, return lectures
    belonging to that course only.
    """

    query = db.query(Lecture)

    if course_id is not None:
        query = query.filter(
            Lecture.course_id == course_id
        )

    return query.order_by(
        Lecture.order_no
    ).all()


@router.get(
    "/{lecture_id}",
    response_model=LectureResponse,
)
def get_lecture(
    lecture_id: int,
    db: Session = Depends(get_db),
):
    """
    Get a single lecture by ID.
    """

    lecture = db.get(
        Lecture,
        lecture_id,
    )

    if lecture is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lecture not found.",
        )

    return lecture


@router.post(
    "",
    response_model=LectureResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_lecture(
    lecture_data: LectureCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new lecture.
    """

    course = db.get(
        Course,
        lecture_data.course_id,
    )

    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found.",
        )

    lecture = Lecture(
        **lecture_data.model_dump()
    )

    db.add(lecture)
    db.commit()
    db.refresh(lecture)

    return lecture


@router.put(
    "/{lecture_id}",
    response_model=LectureResponse,
)
def update_lecture(
    lecture_id: int,
    lecture_data: LectureUpdate,
    db: Session = Depends(get_db),
):
    """
    Update an existing lecture.
    """

    lecture = db.get(
        Lecture,
        lecture_id,
    )

    if lecture is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lecture not found.",
        )

    update_data = lecture_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            lecture,
            field,
            value,
        )

    db.commit()
    db.refresh(lecture)

    return lecture


@router.delete(
    "/{lecture_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_lecture(
    lecture_id: int,
    db: Session = Depends(get_db),
):
    """
    Delete a lecture.
    """

    lecture = db.get(
        Lecture,
        lecture_id,
    )

    if lecture is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lecture not found.",
        )

    db.delete(lecture)
    db.commit()


# ============================================================
# INTERACTIVE VISUAL LECTURE — TIMELINE & INTERACTIONS
# ============================================================
#
# The endpoints below power the "Interactive Visual Lecture" player:
#
#     WATCH → SEE → UNDERSTAND → INTERACT → SIMULATE → PRACTICE
#
# A lecture timeline is a list of timestamped segments, each mapping a
# YouTube time window to a concept, a visualization, an explanation, an
# optional simulation preset, optional code, and an optional question.
#
# Segment data is fully data-driven: the frontend renders each segment
# from structured JSON. The AI-assisted segmentation pipeline (section 9)
# can POST the same structure here in the future.


class SegmentPayload(BaseModel):
    """A single timestamped lecture segment."""

    start: int = Field(..., ge=0)
    end: int = Field(..., gt=0)
    concept: str = Field(..., min_length=1, max_length=100)
    visualization: str = Field(default="explanation", max_length=100)
    title: str = Field(..., min_length=1, max_length=200)
    explanation: str = Field(default="", max_length=4000)
    simulation: dict | None = None
    code: dict | None = None
    question: dict | None = None


class TimelinePayload(BaseModel):
    """Request body for replacing a lecture's visual timeline."""

    segments: list[SegmentPayload] = Field(default_factory=list)


def _serialize_segment(segment: LectureSegment) -> dict:
    """Convert a LectureSegment row into an API-friendly dict."""
    return {
        "id": segment.id,
        "start": segment.start_seconds,
        "end": segment.end_seconds,
        "concept": segment.concept,
        "visualization": segment.visualization,
        "title": segment.title,
        "explanation": segment.explanation,
        "simulation": segment.simulation,
        "code": segment.code,
        "question": segment.question,
        "order_no": segment.order_no,
    }


@router.get("/{lecture_id}/timeline")
def get_lecture_timeline(
    lecture_id: int,
    db: Session = Depends(get_db),
):
    """
    Get the visual timeline for a lecture.

    Returns stored segments when available, otherwise a curated default
    timeline generated from the lecture topic, so the player always works
    even before AI-generated segmentation exists.
    """

    lecture = db.get(
        Lecture,
        lecture_id,
    )

    if lecture is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lecture not found.",
        )

    stored_segments = (
        db.query(LectureSegment)
        .filter(LectureSegment.lecture_id == lecture_id)
        .order_by(
            LectureSegment.order_no,
            LectureSegment.start_seconds,
        )
        .all()
    )

    if stored_segments:
        segments = [
            _serialize_segment(segment)
            for segment in stored_segments
        ]
        source = "curated"
    else:
        segments = build_default_timeline(
            lecture.order_no,
            _parse_duration(lecture.duration),
        )
        source = "default"

    return {
        "lecture_id": lecture.id,
        "title": lecture.title,
        "topic": lecture.topic,
        "youtube_url": lecture.youtube_url,
        "duration": lecture.duration,
        "source": source,
        "segments": segments,
    }


@router.post("/{lecture_id}/timeline")
def save_lecture_timeline(
    lecture_id: int,
    payload: TimelinePayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Replace the visual timeline for a lecture with the provided segments.

    This is the write endpoint used by both the admin workflow and the
    future AI-assisted segmentation pipeline (transcript → AI concept
    extraction → timestamp detection → visualization mapping).
    """

    lecture = db.get(
        Lecture,
        lecture_id,
    )

    if lecture is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lecture not found.",
        )

    db.query(LectureSegment).filter(
        LectureSegment.lecture_id == lecture_id
    ).delete()

    for index, segment in enumerate(payload.segments):
        db.add(
            LectureSegment(
                lecture_id=lecture_id,
                start_seconds=int(segment.start),
                end_seconds=int(segment.end),
                concept=segment.concept,
                visualization=segment.visualization,
                title=segment.title,
                explanation=segment.explanation,
                simulation=segment.simulation,
                code=segment.code,
                question=segment.question,
                order_no=index,
            )
        )

    db.commit()

    return {
        "success": True,
        "count": len(payload.segments),
        "message": "Lecture timeline updated.",
    }


@router.post("/{lecture_id}/timeline/generate")
def generate_lecture_timeline(
    lecture_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Reserved endpoint for the AI-assisted segmentation pipeline.

    The first implementation uses manually curated timestamps. Later, this
    endpoint can run: transcript → AI concept extraction → timestamp
    detection → visualization mapping, and persist the result through
    POST /api/lectures/{id}/timeline.
    """

    lecture = db.get(
        Lecture,
        lecture_id,
    )

    if lecture is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lecture not found.",
        )

    segments = build_default_timeline(
        lecture.order_no,
        _parse_duration(lecture.duration),
    )

    return {
        "success": True,
        "source": "manual",
        "message": (
            "AI segmentation pipeline is reserved. Curated segments "
            "were returned; POST them to /timeline to persist."
        ),
        "segments": segments,
    }


class InteractionPayload(BaseModel):
    """
    A single meaningful learning interaction on a lecture.

    event_type examples:
        lecture_concept_watched  — the learner's video reached this concept
        visualization_explored  — the learner opened the visualisation
        simulation_run          — the learner ran the concept simulation
        question_correct        — prediction question answered correctly
        question_incorrect      — prediction question answered incorrectly
        concept_completed       — the learner finished the segment window
    """

    event_type: str = Field(..., min_length=2, max_length=50)
    concept: str = Field(default="", max_length=100)
    segment_id: int | None = None
    video_time: float | None = Field(default=None, ge=0)
    correct: bool | None = None
    details: dict = Field(default_factory=dict)


# XP awarded per meaningful interaction (gamification).
XP_RULES: dict[str, int] = {
    "lecture_concept_watched": 5,
    "visualization_explored": 5,
    "simulation_run": 10,
    "question_correct": 15,
    "question_incorrect": 2,
    "concept_completed": 10,
}


@router.post("/{lecture_id}/interactions")
def record_interaction(
    lecture_id: int,
    payload: InteractionPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Record a meaningful lecture interaction for gamification.

    Writes a UserActivity entry, updates ConceptMastery when a question is
    answered, refreshes LectureProgress, and returns the XP awarded.
    """

    lecture = db.get(
        Lecture,
        lecture_id,
    )

    if lecture is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lecture not found.",
        )

    if payload.event_type not in XP_RULES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unknown event_type '{payload.event_type}'. "
                f"Supported: {', '.join(sorted(XP_RULES))}"
            ),
        )

    xp_awarded = XP_RULES[payload.event_type]

    # -------------------------------------------------------------
    # Deduplicate watch/explore events so XP is earned once per concept
    # -------------------------------------------------------------
    if payload.event_type in {
        "lecture_concept_watched",
        "visualization_explored",
    }:
        previous = (
            db.query(UserActivity)
            .filter(
                UserActivity.user_id == current_user.id,
                UserActivity.activity_type == payload.event_type,
            )
            .all()
        )

        already_recorded = any(
            activity.details.get("lecture_id") == lecture_id
            and activity.details.get("concept") == (payload.concept or None)
            for activity in previous
        )

        if already_recorded:
            xp_awarded = 0

    # -------------------------------------------------------------
    # Persist the activity
    # -------------------------------------------------------------
    activity = UserActivity(
        user_id=current_user.id,
        activity_type=payload.event_type,
        details={
            "lecture_id": lecture_id,
            "course_id": lecture.course_id,
            "concept": payload.concept or None,
            "segment_id": payload.segment_id,
            "video_time": payload.video_time,
            "correct": payload.correct,
            **payload.details,
        },
    )
    db.add(activity)

    db.add(
        LectureInteraction(
            user_id=current_user.id,
            lecture_id=lecture_id,
            segment_id=payload.segment_id,
            event_type=payload.event_type,
            concept=payload.concept or None,
            video_time=payload.video_time,
            correct=payload.correct,
            xp_awarded=xp_awarded,
            details=payload.details,
        )
    )
    current_user.total_xp = (current_user.total_xp or 0) + xp_awarded

    # -------------------------------------------------------------
    # Concept mastery
    # -------------------------------------------------------------
    mastery_score = None

    if (
        payload.concept
        and payload.event_type in {"question_correct", "question_incorrect"}
    ):
        mastery = (
            db.query(ConceptMastery)
            .filter(
                ConceptMastery.user_id == current_user.id,
                ConceptMastery.concept == payload.concept,
            )
            .first()
        )

        if mastery is None:
            mastery = ConceptMastery(
                user_id=current_user.id,
                concept=payload.concept,
                total_questions=0,
                correct_questions=0,
            )
            db.add(mastery)

        mastery.total_questions += 1

        if payload.correct:
            mastery.correct_questions += 1

        mastery.mastery_score = round(
            mastery.correct_questions / max(mastery.total_questions, 1),
            4,
        )
        mastery.updated_at = datetime.utcnow()

        mastery_score = mastery.mastery_score

    # -------------------------------------------------------------
    # Lecture completion progress
    # -------------------------------------------------------------
    completion_percentage = None

    if payload.video_time is not None or payload.segment_id is not None:
        segments = (
            db.query(LectureSegment)
            .filter(LectureSegment.lecture_id == lecture_id)
            .order_by(LectureSegment.order_no)
            .all()
        )

        total = max(len(segments), 1)

        if payload.video_time is not None:
            covered = sum(
                1 for segment in segments
                if segment.end_seconds <= payload.video_time
            )
        else:
            referenced = (
                db.get(LectureSegment, payload.segment_id)
                if payload.segment_id is not None
                else None
            )

            covered = sum(
                1 for segment in segments
                if (
                    referenced is not None
                    and segment.end_seconds <= referenced.end_seconds
                )
            )

        completion_percentage = round(
            (covered / total) * 100,
        )

        progress = (
            db.query(LectureProgress)
            .filter(
                LectureProgress.user_id == current_user.id,
                LectureProgress.lecture_id == lecture_id,
            )
            .first()
        )

        completed = completion_percentage >= 100

        if progress is None:
            progress = LectureProgress(
                user_id=current_user.id,
                lecture_id=lecture_id,
                completion_percentage=completion_percentage,
                completed=completed,
                last_accessed=datetime.utcnow(),
            )
            db.add(progress)
        else:
            progress.completion_percentage = max(
                progress.completion_percentage,
                completion_percentage,
            )
            progress.completed = (
                progress.completed or completed
            )
            progress.last_accessed = datetime.utcnow()

        completion_percentage = progress.completion_percentage

        concept = payload.concept
        if concept:
            if payload.event_type == "lecture_concept_watched":
                values = set(progress.watched_concepts or [])
                values.add(concept)
                progress.watched_concepts = sorted(values)
            elif payload.event_type == "visualization_explored":
                values = set(progress.explored_concepts or [])
                values.add(concept)
                progress.explored_concepts = sorted(values)
            elif payload.event_type == "simulation_run":
                progress.simulations_run = (progress.simulations_run or 0) + 1
            elif payload.event_type == "question_correct":
                progress.questions_correct = (progress.questions_correct or 0) + 1

        progress.xp_earned = (progress.xp_earned or 0) + xp_awarded
        if completed:
            badge = f"lecture:{lecture_id}:completed"
            current_user.badges = sorted(set(current_user.badges or []) | {badge})

    db.commit()

    return {
        "success": True,
        "xp_awarded": xp_awarded,
        "activity_id": activity.id,
        "mastery_score": mastery_score,
        "completion_percentage": completion_percentage,
    }


# ============================================================
# LECTURE QUIZ (5 Randomized questions, gating: >=3/5 to unlock next)
# ============================================================

class QuizAnswerItem(BaseModel):
    question: str = ""
    selected: str = ""
    correct: str = ""


class QuizSubmitPayload(BaseModel):
    answers: list[QuizAnswerItem] = Field(default_factory=list)


def _generate_fallback_quiz(topic: str) -> list[dict]:
    """Large randomized question bank across quantum topics."""
    topic_lower = topic.lower()
    pool = [
        {
            "question": "What fundamental property allows a qubit to represent 0 and 1 simultaneously?",
            "options": ["A) Superposition", "B) Entanglement", "C) Interference", "D) Decoherence"],
            "correct": "A) Superposition",
            "explanation": "Superposition is the quantum principle allowing linear combinations of basis states |0⟩ and |1⟩."
        },
        {
            "question": "Which quantum gate transforms the basis state |0⟩ into an equal superposition state (|0⟩ + |1⟩)/√2?",
            "options": ["A) Pauli-X gate", "B) Hadamard (H) gate", "C) Pauli-Z gate", "D) Phase (S) gate"],
            "correct": "B) Hadamard (H) gate",
            "explanation": "The Hadamard gate creates an equal superposition of |0⟩ and |1⟩."
        },
        {
            "question": "What occurs when a measurement is performed on a qubit in superposition?",
            "options": ["A) The state remains unchanged", "B) The state collapses into either |0⟩ or |1⟩", "C) The qubit is destroyed", "D) The qubit automatically duplicates"],
            "correct": "B) The state collapses into either |0⟩ or |1⟩",
            "explanation": "Measurement collapses the continuous wavefunction into a definite classical state."
        },
        {
            "question": "What is the Bell state (|00⟩ + |11⟩)/√2 an example of?",
            "options": ["A) Single-qubit superposition", "B) Maximally entangled two-qubit state", "C) Classical bit string", "D) Uncorrelated product state"],
            "correct": "B) Maximally entangled two-qubit state",
            "explanation": "Bell states are maximally entangled pairs where measuring one qubit immediately determines the other."
        },
        {
            "question": "Which gate combination is traditionally used to prepare an entangled Bell pair?",
            "options": ["A) H gate on qubit 0, followed by CNOT with control 0 and target 1", "B) X gate on both qubits", "C) Z gate followed by S gate", "D) Measurement followed by reset"],
            "correct": "A) H gate on qubit 0, followed by CNOT with control 0 and target 1",
            "explanation": "A Hadamard creates superposition, then a CNOT entangles the target qubit with the control."
        },
        {
            "question": "The no-cloning theorem states that:",
            "options": ["A) Quantum circuits cannot have more than 50 gates", "B) An arbitrary unknown quantum state cannot be perfectly copied", "C) Qubits cannot be measured more than once", "D) Quantum hardware cannot be manufactured"],
            "correct": "B) An arbitrary unknown quantum state cannot be perfectly copied",
            "explanation": "Linearity of quantum mechanics forbids creating identical copies of an unknown quantum state."
        },
        {
            "question": "What is decoherence in a quantum computing system?",
            "options": ["A) Intentional error correction", "B) Loss of quantum coherence caused by environmental interaction and noise", "C) An algorithmic optimization step", "D) The process of cooling qubits"],
            "correct": "B) Loss of quantum coherence caused by environmental interaction and noise",
            "explanation": "Decoherence happens when external noise causes quantum states to decay into classical mixtures."
        },
        {
            "question": "In quantum circuit diagrams, what does a horizontal wire represent?",
            "options": ["A) A physical copper cable", "B) The time evolution of a single qubit", "C) The flow of electric current", "D) Classical internet data"],
            "correct": "B) The time evolution of a single qubit",
            "explanation": "Each horizontal wire tracks one qubit progressing forward in time from left to right."
        },
        {
            "question": "What does a Pauli-X gate do to a qubit state?",
            "options": ["A) Flips |0⟩ to |1⟩ and |1⟩ to |0⟩ (Quantum NOT)", "B) Changes phase only", "C) Measures the qubit", "D) Entangles two qubits"],
            "correct": "A) Flips |0⟩ to |1⟩ and |1⟩ to |0⟩ (Quantum NOT)",
            "explanation": "The Pauli-X gate acts as a bit-flip, mapping |0⟩ to |1⟩ and |1⟩ to |0⟩."
        },
        {
            "question": "What is Qiskit?",
            "options": ["A) A quantum hardware refrigerator", "B) An open-source Python SDK for quantum computing originally developed by IBM", "C) A type of laser", "D) A classical operating system"],
            "correct": "B) An open-source Python SDK for quantum computing originally developed by IBM",
            "explanation": "Qiskit is the leading open-source quantum programming framework in Python."
        },
    ]
    random.shuffle(pool)
    return pool[:5]


@router.get("/{lecture_id}/quiz")
def get_lecture_quiz(
    lecture_id: int,
    db: Session = Depends(get_db),
):
    """
    Generate 5 randomized quiz questions for a lecture.
    Uses AI Provider when available, with a rich randomized quantum pool fallback.
    """
    lecture = db.get(Lecture, lecture_id)
    if lecture is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lecture not found.",
        )

    from app.services.ai_provider import get_ai_provider

    try:
        provider = get_ai_provider()
        prompt = (
            f"Generate exactly 5 unique multiple-choice questions testing understanding of: \"{lecture.topic}\". "
            f"Description: {lecture.description or lecture.topic}. "
            "Level: Beginner to Intermediate Quantum Computing. "
            "Return ONLY a valid JSON array of 5 objects without markdown formatting or code blocks: "
            '[{"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correct": "A) ...", "explanation": "..."}]'
        )
        res = provider.ask(question=prompt, context="You are a quantum computing quiz generator. Return only raw JSON.")
        text = res.get("answer") or res.get("explanation") or res.get("message") or ""
        start = text.find("[")
        end = text.rfind("]") + 1
        if start != -1 and end > start:
            questions = json.loads(text[start:end])
            if isinstance(questions, list) and len(questions) >= 5:
                random.shuffle(questions)
                return {
                    "lecture_id": lecture_id,
                    "topic": lecture.topic,
                    "questions": questions[:5],
                }
    except Exception:
        pass

    return {
        "lecture_id": lecture_id,
        "topic": lecture.topic,
        "questions": _generate_fallback_quiz(lecture.topic),
    }


@router.post("/{lecture_id}/quiz/submit")
def submit_lecture_quiz(
    lecture_id: int,
    payload: QuizSubmitPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Evaluate 5 quiz questions for this lecture.
    GATING RULE: Requires at least 3 out of 5 correct answers (>=60%) to pass.
    If passed: marks lecture as completed and quiz_passed = True, unlocking the next lecture.
    """
    lecture = db.get(Lecture, lecture_id)
    if lecture is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lecture not found.",
        )

    total = len(payload.answers)
    if total == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No answers submitted.",
        )

    correct_count = sum(
        1 for a in payload.answers
        if a.selected.strip().lower() == a.correct.strip().lower()
        or (len(a.selected) > 0 and len(a.correct) > 0 and a.selected[0].upper() == a.correct[0].upper())
    )

    passed = correct_count >= 3
    percentage = round((correct_count / total) * 100, 1)

    # Record activity
    activity = UserActivity(
        user_id=current_user.id,
        activity_type="lecture_quiz_submitted",
        details={
            "lecture_id": lecture_id,
            "topic": lecture.topic,
            "correct": correct_count,
            "total": total,
            "percentage": percentage,
            "passed": passed,
        },
    )
    db.add(activity)

    progress = db.query(LectureProgress).filter(
        LectureProgress.user_id == current_user.id,
        LectureProgress.lecture_id == lecture_id,
    ).first()

    xp_earned = 30 if passed else 10

    if progress is None:
        progress = LectureProgress(
            user_id=current_user.id,
            lecture_id=lecture_id,
            completion_percentage=100.0 if passed else 50.0,
            completed=passed,
            quiz_passed=passed,
            xp_earned=xp_earned,
            last_accessed=datetime.utcnow(),
        )
        db.add(progress)
    else:
        if passed:
            progress.completed = True
            progress.quiz_passed = True
            progress.completion_percentage = 100.0
        progress.xp_earned = (progress.xp_earned or 0) + xp_earned
        progress.last_accessed = datetime.utcnow()

    if passed:
        current_user.xp = (current_user.xp or 0) + 30
        badge = f"lecture:{lecture_id}:passed"
        current_user.badges = sorted(set(current_user.badges or []) | {badge})

    db.commit()

    return {
        "success": True,
        "lecture_id": lecture_id,
        "correct": correct_count,
        "total": total,
        "percentage": percentage,
        "passed": passed,
        "xp_awarded": xp_earned,
        "message": (
            f"🎉 Congratulations! You scored {correct_count}/{total} ({percentage}%). Next lecture is now unlocked!"
            if passed
            else f"You scored {correct_count}/{total}. You need at least 3 correct answers to unlock the next lecture. Please review and try again!"
        ),
    }