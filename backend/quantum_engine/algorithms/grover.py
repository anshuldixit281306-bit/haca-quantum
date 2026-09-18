"""
Grover's Search Algorithm

Prototype implementation of a 2-qubit Grover search.
"""

from typing import Any

from qiskit import QuantumCircuit

from quantum_engine.simulator import simulate


VALID_TARGETS = {
    "00",
    "01",
    "10",
    "11",
}


def create_grover_circuit(
    target: str = "11",
) -> QuantumCircuit:
    """
    Create a 2-qubit Grover search circuit.

    Args:
        target: Search target: 00, 01, 10 or 11.
    """

    target = target.strip()

    if target not in VALID_TARGETS:
        raise ValueError(
            "target must be one of: 00, 01, 10, 11"
        )

    circuit = QuantumCircuit(2)

    # -----------------------------------------
    # 1. Create equal superposition
    # -----------------------------------------

    circuit.h(0)
    circuit.h(1)

    # -----------------------------------------
    # 2. Oracle
    # -----------------------------------------

    # Convert target into |11>
    if target[0] == "0":
        circuit.x(0)

    if target[1] == "0":
        circuit.x(1)

    # Phase-mark the target state
    circuit.cz(0, 1)

    # Restore original basis
    if target[0] == "0":
        circuit.x(0)

    if target[1] == "0":
        circuit.x(1)

    # -----------------------------------------
    # 3. Diffusion operator
    # -----------------------------------------

    circuit.h(0)
    circuit.h(1)

    circuit.x(0)
    circuit.x(1)

    circuit.h(1)
    circuit.cx(0, 1)
    circuit.h(1)

    circuit.x(0)
    circuit.x(1)

    circuit.h(0)
    circuit.h(1)

    return circuit


def run_grover(
    target: str = "11",
    shots: int = 1024,
) -> dict[str, Any]:
    """
    Run Grover search and return JSON-safe data.
    """

    if shots < 1 or shots > 100000:
        raise ValueError(
            "shots must be between 1 and 100000"
        )

    circuit = create_grover_circuit(
        target=target,
    )

    result = simulate(
        circuit,
        shots=shots,
    )

    # Make sure counts/probabilities are JSON-safe.
    counts = {
        str(key): int(value)
        for key, value in result["counts"].items()
    }

    probabilities = {
        str(key): float(value)
        for key, value in result["probabilities"].items()
    }

    most_frequent_state = max(counts, key=counts.get) if counts else target

    return {
        "success": True,
        "algorithm": "Grover Search",
        "target": target,
        "most_frequent_state": most_frequent_state,
        "num_qubits": 2,
        "shots": int(shots),
        "counts": counts,
        "probabilities": probabilities,
        "description": (
            f"Grover's algorithm searches for the target "
            f"state |{target}> using amplitude amplification."
        ),
        "circuit": str(result["circuit"]),
    }