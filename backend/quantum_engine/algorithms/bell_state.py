"""
Bell State / Quantum Entanglement

Creates a standard two-qubit Bell state.
"""

from typing import Any

from qiskit import QuantumCircuit

from quantum_engine.analytics import analyze_simulation
from quantum_engine.simulator import simulate
from quantum_engine.visualization import visualization_payload


def create_bell_circuit() -> QuantumCircuit:
    """Create a standard Bell state circuit."""

    circuit = QuantumCircuit(2)

    # Put qubit 0 into superposition.
    circuit.h(0)

    # Entangle qubit 0 and qubit 1.
    circuit.cx(0, 1)

    return circuit


def run_bell_state(
    shots: int = 1024,
) -> dict[str, Any]:
    """Run Bell state simulation."""

    circuit = create_bell_circuit()

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
        "algorithm": "Bell State",
        "description": (
            "Creates an entangled pair of qubits using "
            "H and CNOT gates."
        ),
        "shots": shots,
        "counts": result["counts"],
        "probabilities": result["probabilities"],
        "analysis": analysis,
        "visualization": visualization,
        "circuit": result["circuit"],
    }