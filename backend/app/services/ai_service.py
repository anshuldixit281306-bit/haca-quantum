"""
QuantumLearn AI Service

Central AI service layer for QuantumLearn.

Architecture:

    AI Tutor
        -> ask_ai()
        -> separate tutor experience

    Circuit AI
        -> analyze_circuit()
        -> explain_quantum_result()
        -> predict_circuit_consequences()

    Code Lab AI
        -> handled separately

Important rule:

    Qiskit / Quantum Engine = source of mathematical truth
    Groq / DeepSeek = explanation, interpretation and prediction

The AI must never invent or replace actual simulation results.
"""

from typing import Any

from app.services.ai_provider import get_ai_provider


# ============================================================
# HELPERS
# ============================================================

def _safe_dict(value: Any) -> dict[str, Any]:
    """Return a dictionary or an empty dictionary."""
    return value if isinstance(value, dict) else {}


def _safe_list(value: Any) -> list[Any]:
    """Return a list or an empty list."""
    return value if isinstance(value, list) else []


def _extract_answer(response: Any) -> str:
    """
    Extract a readable answer from different provider response formats.

    Providers may return:
        {"answer": "..."}
        {"explanation": "..."}
        {"message": "..."}
        {"content": "..."}
    """

    if isinstance(response, str):
        return response.strip()

    if not isinstance(response, dict):
        return ""

    possible_fields = (
        "answer",
        "explanation",
        "response",
        "content",
        "message",
        "text",
        "analysis",
    )

    for field in possible_fields:
        value = response.get(field)

        if isinstance(value, str) and value.strip():
            return value.strip()

    return ""


def _normalize_ai_response(
    response: Any,
    *,
    default_message: str,
) -> dict[str, Any]:
    """
    Normalize provider responses so the frontend always receives
    a predictable response structure.
    """

    if isinstance(response, dict):
        normalized = dict(response)

        answer = _extract_answer(normalized)

        if answer:
            normalized["answer"] = answer
            normalized.setdefault("success", True)
            return normalized

        # Provider returned a dict but no readable text.
        normalized.setdefault("success", False)
        normalized.setdefault("answer", default_message)

        return normalized

    if isinstance(response, str) and response.strip():
        return {
            "success": True,
            "answer": response.strip(),
        }

    return {
        "success": False,
        "answer": default_message,
    }


# ============================================================
# AI TUTOR
# ============================================================

def ask_ai(
    question: str,
    level: str = "beginner",
    context: str = "",
) -> dict[str, Any]:
    """
    Answer a Quantum Computing question using the
    separate AI Tutor system.

    This remains independent from Circuit AI.
    """

    if not question or not question.strip():
        return {
            "success": False,
            "answer": "Please enter a Quantum Computing question.",
            "topic": None,
            "level": level,
        }

    provider = get_ai_provider()

    try:
        response = provider.ask(
            question=question.strip(),
            context=context or "",
            level=level,
        )

        return _normalize_ai_response(
            response,
            default_message=(
                "The AI Tutor could not generate a readable answer."
            ),
        )

    except Exception as exc:
        return {
            "success": False,
            "answer": "The AI Tutor request failed.",
            "error": str(exc),
            "level": level,
        }


# ============================================================
# CIRCUIT AI — LIVE CIRCUIT ANALYSIS
# ============================================================

def analyze_circuit(
    num_qubits: int,
    gates: list[dict[str, Any]],
    previous_gates: list[dict[str, Any]] | None = None,
    action: str | None = None,
) -> dict[str, Any]:
    """
    Analyze the current quantum circuit.

    This is intended for live Circuit Simulator AI.

    The AI receives:
        - current circuit
        - previous circuit
        - latest user action

    The AI can explain:
        - what the latest operation does
        - what may happen next
        - possible consequences
        - alternatives
        - warnings

    The AI does NOT calculate the final quantum result itself.
    """

    if num_qubits < 1:
        return {
            "success": False,
            "message": "Circuit must contain at least one qubit.",
        }

    if not isinstance(gates, list):
        return {
            "success": False,
            "message": "Circuit gates must be provided as a list.",
        }

    safe_previous_gates = (
        previous_gates
        if isinstance(previous_gates, list)
        else []
    )

    circuit_context = {
        "num_qubits": num_qubits,
        "current_gates": gates,
        "previous_gates": safe_previous_gates,
        "latest_action": action,
    }

    provider = get_ai_provider()

    provider_method = getattr(
        provider,
        "analyze_circuit",
        None,
    )

    if not callable(provider_method):
        return {
            "success": False,
            "mode": "fallback",
            "message": (
                "Circuit AI provider is not connected "
                "to the live circuit analysis endpoint."
            ),
            "circuit": circuit_context,
        }

    try:
        response = provider_method(
            num_qubits=num_qubits,
            gates=gates,
            previous_gates=safe_previous_gates,
            action=action,
        )

        normalized = _normalize_ai_response(
            response,
            default_message=(
                "The Circuit AI could not produce a readable "
                "analysis for this circuit."
            ),
        )

        normalized.setdefault(
            "circuit",
            circuit_context,
        )

        return normalized

    except Exception as exc:
        return {
            "success": False,
            "message": "Circuit AI analysis failed.",
            "error": str(exc),
            "circuit": circuit_context,
        }


# ============================================================
# CIRCUIT AI — SIMULATION RESULT EXPLANATION
# ============================================================

def explain_quantum_result(
    question: str = "",
    counts: dict[str, int] | None = None,
    probabilities: dict[str, float] | None = None,
    algorithm: str = "Quantum Experiment",
    circuit_context: dict[str, Any] | None = None,
    statevector: dict[str, Any] | None = None,
    exact_probabilities: dict[str, float] | None = None,
    most_frequent_state: str | None = None,
    shots: int | None = None,
) -> dict[str, Any]:
    """
    Explain an actual quantum simulation result.

    Qiskit / Quantum Engine data is authoritative.

    The AI receives:
        - actual measurement counts
        - actual probabilities
        - theoretical probabilities
        - actual shot count
        - actual most frequent state
        - actual circuit information
        - optional statevector
        - user's question
    """

    safe_counts = _safe_dict(counts)
    safe_probabilities = _safe_dict(probabilities)
    safe_exact_probabilities = _safe_dict(exact_probabilities)
    safe_circuit_context = _safe_dict(circuit_context)
    safe_statevector = _safe_dict(statevector)

    # ------------------------------------------------------------
    # Determine shots from actual counts when necessary
    # ------------------------------------------------------------

    if shots is None:
        try:
            shots = sum(
                int(value)
                for value in safe_counts.values()
            )
        except (TypeError, ValueError):
            shots = 0

    # ------------------------------------------------------------
    # Determine most frequent state
    # ------------------------------------------------------------

    if most_frequent_state is None and safe_counts:
        try:
            most_frequent_state = max(
                safe_counts,
                key=safe_counts.get,
            )
        except Exception:
            most_frequent_state = None

    # ------------------------------------------------------------
    # Build factual simulation package
    # ------------------------------------------------------------

    result_context: dict[str, Any] = {
        "algorithm": algorithm,
        "shots": shots,
        "measurement": {
            "counts": safe_counts,
            "probabilities": safe_probabilities,
            "most_frequent_state": most_frequent_state,
        },
        "theoretical": {
            "exact_probabilities": safe_exact_probabilities,
        },
        "circuit": safe_circuit_context,
    }

    if safe_statevector:
        result_context["statevector"] = safe_statevector

    # ------------------------------------------------------------
    # Ask specialized Circuit AI provider
    # ------------------------------------------------------------

    provider = get_ai_provider()

    provider_method = getattr(
        provider,
        "explain_quantum_result",
        None,
    )

    if callable(provider_method):
        try:
            response = provider_method(
                question=question,
                result=result_context,
            )

            normalized = _normalize_ai_response(
                response,
                default_message=(
                    "The AI could not produce a readable "
                    "explanation for this circuit."
                ),
            )

            normalized["question"] = question

            # Always preserve the actual quantum result.
            normalized.setdefault(
                "result",
                result_context,
            )

            return normalized

        except Exception as exc:
            return {
                "success": False,
                "question": question,
                "answer": (
                    "The Circuit AI explanation request failed."
                ),
                "error": str(exc),
                "result": result_context,
            }

    # ------------------------------------------------------------
    # Secondary provider compatibility
    # ------------------------------------------------------------

    provider_method = getattr(
        provider,
        "analyze_result",
        None,
    )

    if callable(provider_method):
        try:
            response = provider_method(
                question=question,
                result=result_context,
            )

            normalized = _normalize_ai_response(
                response,
                default_message=(
                    "The AI could not produce a readable "
                    "explanation for this circuit."
                ),
            )

            normalized["question"] = question
            normalized.setdefault(
                "result",
                result_context,
            )

            return normalized

        except Exception as exc:
            return {
                "success": False,
                "question": question,
                "answer": (
                    "The Circuit AI explanation request failed."
                ),
                "error": str(exc),
                "result": result_context,
            }

    # ------------------------------------------------------------
    # Deterministic fallback
    # ------------------------------------------------------------

    return _local_quantum_result_explanation(
        question=question,
        result=result_context,
    )


# ============================================================
# LOCAL RESULT EXPLANATION FALLBACK
# ============================================================

def _local_quantum_result_explanation(
    question: str,
    result: dict[str, Any],
) -> dict[str, Any]:
    """
    Deterministic fallback explanation.

    This keeps the API useful if the external AI provider
    temporarily fails.
    """

    measurement = _safe_dict(
        result.get("measurement")
    )

    counts = _safe_dict(
        measurement.get("counts")
    )

    probabilities = _safe_dict(
        measurement.get("probabilities")
    )

    most_frequent_state = measurement.get(
        "most_frequent_state"
    )

    shots = result.get(
        "shots",
        0,
    )

    circuit = _safe_dict(
        result.get("circuit")
    )

    gate_counts = _safe_dict(
        circuit.get("gate_counts")
    )

    num_qubits = circuit.get(
        "num_qubits"
    )

    num_gates = circuit.get(
        "num_gates"
    )

    if not counts:
        explanation = (
            "The simulation did not return measurement counts."
        )
    else:
        state_text = (
            f"|{most_frequent_state}⟩"
            if most_frequent_state
            else "the most frequent state"
        )

        explanation = (
            f"The circuit was simulated using {shots} shots. "
            f"The most frequently observed state was "
            f"{state_text}."
        )

        if probabilities:
            explanation += (
                " The measured probability distribution was "
                "calculated from the actual simulation results."
            )

    return {
        "success": True,
        "mode": "local_fallback",
        "question": question,
        "answer": explanation,

        "circuit_summary": {
            "num_qubits": num_qubits,
            "num_gates": num_gates,
            "gate_counts": gate_counts,
        },

        "result_summary": {
            "shots": shots,
            "counts": counts,
            "probabilities": probabilities,
            "most_frequent_state": most_frequent_state,
        },

        "insight": (
            "The displayed measurement values come from the "
            "Quantum Engine. The AI layer is used only for "
            "interpretation."
        ),

        "warning": None,
        "consequences": [],
        "alternatives": [],
    }


# ============================================================
# CIRCUIT AI — PREDICT CONSEQUENCES
# ============================================================

def predict_circuit_consequences(
    num_qubits: int,
    gates: list[dict[str, Any]],
    proposed_operation: dict[str, Any],
) -> dict[str, Any]:
    """
    Predict the consequences of adding a proposed operation.

    The AI explains possible consequences.

    The Quantum Engine remains responsible for actual
    mathematical simulation.
    """

    if num_qubits < 1:
        return {
            "success": False,
            "message": "Circuit must contain at least one qubit.",
        }

    if not isinstance(gates, list):
        return {
            "success": False,
            "message": "Circuit gates must be provided as a list.",
        }

    if not isinstance(proposed_operation, dict):
        return {
            "success": False,
            "message": (
                "The proposed circuit operation must be an object."
            ),
        }

    provider = get_ai_provider()

    provider_method = getattr(
        provider,
        "predict_circuit_consequences",
        None,
    )

    if callable(provider_method):
        try:
            response = provider_method(
                num_qubits=num_qubits,
                gates=gates,
                proposed_operation=proposed_operation,
            )

            normalized = _normalize_ai_response(
                response,
                default_message=(
                    "The Circuit Agent could not produce a readable "
                    "prediction for this operation."
                ),
            )

            normalized.setdefault(
                "current_circuit",
                {
                    "num_qubits": num_qubits,
                    "gates": gates,
                },
            )

            normalized.setdefault(
                "proposed_operation",
                proposed_operation,
            )

            return normalized

        except Exception as exc:
            return {
                "success": False,
                "message": (
                    "Unable to predict circuit consequences."
                ),
                "answer": (
                    "The Circuit AI prediction request failed."
                ),
                "error": str(exc),
                "current_circuit": {
                    "num_qubits": num_qubits,
                    "gates": gates,
                },
                "proposed_operation": proposed_operation,
            }

    return {
        "success": False,
        "mode": "fallback",
        "message": (
            "Specialized Circuit AI provider is not connected "
            "to the circuit prediction endpoint."
        ),
        "answer": (
            "The Circuit Agent is currently unavailable "
            "for this prediction."
        ),
        "current_circuit": {
            "num_qubits": num_qubits,
            "gates": gates,
        },
        "proposed_operation": proposed_operation,
        "consequences": [],
        "alternatives": [],
        "warning": None,
    }


# ============================================================
# AI SERVICE STATUS
# ============================================================

def ai_service_status() -> dict[str, Any]:
    """
    Return AI service status.

    AI Tutor and Circuit AI are represented separately.
    """

    provider = get_ai_provider()

    provider_name = provider.__class__.__name__

    return {
        "available": True,

        "engine": "QuantumLearn AI",

        "provider": provider_name,

        "ai_tutor": {
            "enabled": True,
            "mode": "separate",
        },

        "circuit_ai": {
            "enabled": True,
            "mode": "circuit_context_aware",
            "grounded_in_quantum_engine": True,
        },

        "code_lab_ai": {
            "enabled": False,
            "mode": "planned",
        },

        "external_api_required": False,
    }


# ============================================================
# EXPORTS
# ============================================================

__all__ = [
    "ask_ai",
    "analyze_circuit",
    "explain_quantum_result",
    "predict_circuit_consequences",
    "ai_service_status",
]