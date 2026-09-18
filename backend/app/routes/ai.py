from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database.connection import get_db
from app.models.concept_mastery import ConceptMastery
from app.models.lecture_progress import LectureProgress
from app.models.lectures import Lecture
from app.models.user import User
from app.services.ai_service import (
    analyze_circuit,
    ask_ai,
    explain_quantum_result,
    predict_circuit_consequences,
)
from app.services.ai_provider import get_ai_provider


router = APIRouter(
    prefix="/api/ai",
    tags=["AI Assistance"],
)


# ============================================================
# REQUEST MODELS
# ============================================================

class AskRequest(BaseModel):
    question: str = Field(..., min_length=1)
    level: str = Field(default="beginner")
    lectures_completed: int = Field(default=0)
    topics_covered: list[str] = Field(default_factory=list)


# ============================================================
# AI TUTOR (Personalized with live DB progress)
# ============================================================

@router.post("/ask")
def ask_question(
    request: AskRequest,
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    """
    Answer a Quantum Computing question with personalized context
    derived from the user's completed lectures and quiz history in the DB.
    """
    try:
        personal_context_parts = []
        user_email = None

        if authorization and authorization.startswith("Bearer "):
            token = authorization[7:].strip()
            user_id = decode_access_token(token)
            if user_id:
                user = db.get(User, user_id)
                if user:
                    user_email = user.email

                    # Query user's actual progress from database
                    progress_records = db.query(LectureProgress).filter(
                        LectureProgress.user_id == user.id
                    ).all()

                    completed_rows = [p for p in progress_records if p.completed or p.quiz_passed]
                    completed_ids = [p.lecture_id for p in completed_rows]

                    lectures = db.query(Lecture).filter(Lecture.id.in_(completed_ids)).all() if completed_ids else []
                    completed_topics = [l.topic for l in lectures]

                    masteries = db.query(ConceptMastery).filter(
                        ConceptMastery.user_id == user.id
                    ).all()
                    strong = [m.concept for m in masteries if m.mastery_score >= 0.7]

                    personal_context_parts.append(
                        f"Student learning history from database: They have completed {len(completed_rows)} lecture(s)"
                        + (f" ({', '.join(completed_topics)})" if completed_topics else "")
                        + f". Quizzes passed: {sum(1 for p in progress_records if getattr(p, 'quiz_passed', False))}."
                    )
                    if strong:
                        personal_context_parts.append(f"Mastered concepts: {', '.join(strong)}.")

        # Fallback to payload metadata if client passed it directly
        if not personal_context_parts and (request.lectures_completed > 0 or request.topics_covered):
            personal_context_parts.append(
                f"Student has completed {request.lectures_completed} lecture(s). "
                f"Topics covered: {', '.join(request.topics_covered) if request.topics_covered else 'fundamentals'}."
            )

        context_str = ""
        if personal_context_parts:
            context_str = (
                "Personalization context: " + " ".join(personal_context_parts)
                + " Instruction: If appropriate, directly reference what the student has already covered "
                "(e.g., 'Since you have completed X lectures...'). "
                "Bridge the student's question to the concepts they already know, or use gentle foundational intuition if they are just beginning."
            )

        return ask_ai(
            question=request.question,
            level=request.level,
            context=context_str,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"AI Tutor error: {str(exc)}",
        ) from exc



# ============================================================
# QUANTUM RESULT EXPLANATION
# ============================================================

@router.post("/analyze-result")
def analyze_result(request: QuantumResultRequest):
    try:
        result = request.result or {}

        ai_context = result.get("ai_context") or {}

        counts = result.get("counts") or {}
        probabilities = result.get("probabilities") or {}
        exact_probabilities = (
            result.get("exact_probabilities")
            or result.get("exactProbabilities")
            or {}
        )

        statevector = (
            result.get("statevector")
            or result.get("state_vector")
        )

        circuit = (
            result.get("circuit")
            or result.get("circuit_context")
            or ai_context.get("circuit")
            or ai_context.get("circuit_context")
        )

        most_frequent_state = (
            result.get("most_frequent_state")
            or result.get("mostFrequentState")
        )

        shots = result.get("shots", 0)

        algorithm = (
            result.get("algorithm")
            or ai_context.get("algorithm")
            or "Quantum Circuit"
        )

        question = (
            result.get("question")
            or ai_context.get("question")
            or "Explain these quantum simulation results."
        )

        return explain_quantum_result(
            question=question,
            counts=counts,
            probabilities=probabilities,
            algorithm=algorithm,
            circuit_context=circuit,
            statevector=statevector,
            exact_probabilities=exact_probabilities,
            most_frequent_state=most_frequent_state,
            shots=shots,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Quantum result analysis error: {str(exc)}",
        ) from exc


# ============================================================
# LIVE CIRCUIT AI ANALYSIS
# ============================================================

@router.post("/circuit/analyze")
def circuit_analysis(request: LiveCircuitRequest):
    try:
        action = (
            request.action.strip()
            if request.action and request.action.strip()
            else request.question.strip()
        )

        return analyze_circuit(
            num_qubits=request.num_qubits,
            gates=request.gates,
            previous_gates=request.previous_gates,
            action=action,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Circuit analysis error: {str(exc)}",
        ) from exc


# ============================================================
# CIRCUIT CONSEQUENCES
# ============================================================

@router.post("/circuit/consequences")
def circuit_consequences(request: CircuitConsequenceRequest):
    try:
        return predict_circuit_consequences(
            num_qubits=request.num_qubits,
            gates=request.gates,
            proposed_operation=request.proposed_operation,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Circuit consequence error: {str(exc)}",
        ) from exc


# ============================================================
# GENERATE CODE
# ============================================================

@router.post("/generate-code")
def generate_code(request: CodeRequest):
    try:
        provider = get_ai_provider()

        return provider.generate_code(
            request.prompt,
            request.framework,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Code generation error: {str(exc)}",
        ) from exc


# ============================================================
# GENERATE CIRCUIT
# ============================================================

@router.post("/generate-circuit")
def generate_circuit(request: CircuitRequest):
    try:
        provider = get_ai_provider()

        return provider.generate_circuit_json(
            request.prompt,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Circuit generation error: {str(exc)}",
        ) from exc


# ============================================================
# DEBUG CODE
# ============================================================

@router.post("/debug")
def debug_code(request: CodeRequest):
    try:
        provider = get_ai_provider()

        return provider.debug_code(
            request.prompt,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Code debugging error: {str(exc)}",
        ) from exc


# ============================================================
# OPTIMIZE CIRCUIT
# ============================================================

@router.post("/optimize")
def optimize_circuit(request: CircuitRequest):
    try:
        provider = get_ai_provider()

        return provider.optimize_circuit(
            request.prompt,
        )

    except  Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Circuit optimization error: {str(exc)}",
        ) from exc


# ============================================================
# PREDICT CIRCUIT
# ============================================================

@router.post("/predict")
def predict_circuit(request: CircuitRequest):
    try:
        provider = get_ai_provider()

        return provider.predict_circuit(
            request.prompt,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Circuit prediction error: {str(exc)}",
        ) from exc


# ============================================================
# CODE LAB ANALYSIS
# ============================================================

@router.post("/code-lab/analyze")
def code_lab_analysis(request: CodeLabAnalysisRequest):
    try:
        provider = get_ai_provider()

        context = (
            f"Language: {request.language}\n"
            f"Code:\n{request.code}\n\n"
            f"Execution result:\n{request.execution or 'No execution result provided.'}"
        )

        question = (
            request.question.strip()
            if request.question and request.question.strip()
            else "Analyze this code and explain how it can be improved."
        )

        response = provider.ask(
            question=question,
            context=context,
        )

        if isinstance(response, dict):
            response["experience"] = "code_lab"

        return response

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Code Lab analysis error: {str(exc)}",
        ) from exc


# ============================================================
# BASIC HEALTH CHECK
# ============================================================

@router.get("/health")
def ai_health():
    try:
        provider = get_ai_provider()

        return {
            "success": True,
            "status": "healthy",
            "provider": type(provider).__name__,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"AI health check failed: {str(exc)}",
        ) from exc