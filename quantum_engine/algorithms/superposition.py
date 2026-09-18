"""
Quantum Superposition Algorithm

Creates a single-qubit superposition using the Hadamard gate.
"""

from typing import Any

from qiskit import QuantumCircuit

from quantum_engine.analytics import analyze_simulation
from quantum_engine.simulator import simulate
from quantum_engine.visualization import visualization_payload


def create_superposition_circuit() -> QuantumCircuit:
    """Create a 1-qubit superposition circuit."""

    circuit = QuantumCircuit(1)

    # Hadamard creates:
    # |0> -> (|0> + |1>) / sqrt(2)
    circuit.h(0)

    return circuit


def run_superposition(
    shots: int = 1024,
) -> dict[str, Any]:
    """Run the superposition experiment."""

    circuit = create_superposition_circuit()

    result = simulate(
        circuit,
        shots=shots,
    )

    analysis = analyze_simulation(
        circuit,
        result["counts"],
    )

    visualization = visualization_payload(
        circuit,
        result["counts"],
    )

    return {
        "success": True,
        "algorithm": "Superposition",
        "description": (
            "A Hadamard gate creates an equal quantum "
            "superposition of |0> and |1>."
        ),
        "shots": shots,
        "counts": result["counts"],
        "probabilities": result["probabilities"],
        "analysis": analysis,
        "visualization": visualization,
        "circuit": result["circuit"],
    }