"""
Quantum Teleportation

Prototype implementation of the quantum teleportation protocol.
"""

from typing import Any

from qiskit import QuantumCircuit

from quantum_engine.simulator import simulate


def create_teleportation_circuit() -> QuantumCircuit:
    """
    Create a 3-qubit quantum teleportation circuit.

    Qubit 0 -> input state
    Qubit 1 -> Alice's entangled qubit
    Qubit 2 -> Bob's qubit
    """

    circuit = QuantumCircuit(3)

    # -------------------------------------------------
    # 1. Prepare an example input state
    # -------------------------------------------------

    circuit.ry(
        1.234,
        0,
    )

    # -------------------------------------------------
    # 2. Create Bell pair
    # -------------------------------------------------

    circuit.h(1)
    circuit.cx(1, 2)

    # -------------------------------------------------
    # 3. Bell-state interaction
    # -------------------------------------------------

    circuit.cx(0, 1)
    circuit.h(0)

    # -------------------------------------------------
    # 4. Bob's correction operations
    # -------------------------------------------------

    circuit.cx(1, 2)
    circuit.cz(0, 2)

    return circuit


def run_teleportation(
    shots: int = 1024,
) -> dict[str, Any]:
    """
    Run quantum teleportation simulation.

    Returns only JSON-serializable values so that
    FastAPI can safely return the response.
    """

    if shots < 1 or shots > 100000:
        raise ValueError(
            "shots must be between 1 and 100000"
        )

    circuit = create_teleportation_circuit()

    result = simulate(
        circuit,
        shots=shots,
    )

    # -------------------------------------------------
    # Convert Qiskit result values into normal
    # Python JSON-safe values.
    # -------------------------------------------------

    counts = {
        str(key): int(value)
        for key, value in result["counts"].items()
    }

    probabilities = {
        str(key): float(value)
        for key, value in result["probabilities"].items()
    }

    return {
        "success": True,
        "algorithm": "Quantum Teleportation",
        "num_qubits": 3,
        "shots": int(shots),
        "counts": counts,
        "probabilities": probabilities,
        "description": (
            "Demonstrates the quantum teleportation protocol "
            "using an input state, entanglement, and quantum "
            "gate operations."
        ),
        "circuit": str(result["circuit"]),
    }