import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[3]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
"""
Quantum circuit and algorithm API routes.

Connects the FastAPI backend with the QuantumLearn
quantum_engine package.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.schemas.circuit import CircuitRequest
from app.schemas.circuit import ExecuteCodeRequest
from app.database.connection import get_db
from app.models.user import User
from app.models.user_activity import UserActivity
from app.routes.auth import get_current_user
from app.services.code_executor import execute_quantum_code
from app.services.quantum_service import (
    simulate_bell_state,
    simulate_circuit,
    simulate_superposition,
)

from quantum_engine.algorithms import (
    run_grover,
    run_teleportation,
)


router = APIRouter(
    prefix="/api/quantum",
    tags=["Quantum Computing"],
)


@router.post("/simulate")
def simulate(request: CircuitRequest):
    """
    Simulate a custom quantum circuit.
    """

    try:
        gates = [
            gate.model_dump()
            for gate in request.gates
        ]

        result = simulate_circuit(
            num_qubits=request.num_qubits,
            gates=gates,
            shots=request.shots,
            algorithm=request.algorithm,
        )

        return result

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Quantum simulation failed: {exc}",
        ) from exc


@router.post("/bell-state")
def bell_state(
    shots: int = Query(
        default=1024,
        ge=1,
        le=100000,
    ),
):
    """
    Run a standard Bell State experiment.
    """

    try:
        return simulate_bell_state(
            shots=shots,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Bell State simulation failed: {exc}",
        ) from exc


@router.post("/superposition")
def superposition(
    shots: int = Query(
        default=1024,
        ge=1,
        le=100000,
    ),
):
    """
    Run a single-qubit superposition experiment.
    """

    try:
        return simulate_superposition(
            shots=shots,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Superposition simulation failed: {exc}",
        ) from exc


@router.post("/grover")
def grover(
    target: str = Query(
        default="11",
        description="Target state: 00, 01, 10 or 11",
    ),
    shots: int = Query(
        default=1024,
        ge=1,
        le=100000,
    ),
):
    """
    Run a 2-qubit Grover search.
    """

    try:
        return run_grover(
            target=target,
            shots=shots,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Grover simulation failed: {exc}",
        ) from exc


@router.post("/teleportation")
def teleportation(
    shots: int = Query(
        default=1024,
        ge=1,
        le=100000,
    ),
):
    """
    Run a quantum teleportation experiment.
    """

    try:
        return run_teleportation(
            shots=shots,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Teleportation simulation failed: {exc}",
        ) from exc


@router.post("/execute-code")
def execute_code(
    request: ExecuteCodeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = execute_quantum_code(request.code, request.shots)
    db.add(UserActivity(user_id=current_user.id, activity_type="code_executed", details={"success": result.get("success", False)}))
    db.commit()
    return result