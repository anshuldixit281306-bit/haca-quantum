"""
Deutsch-Jozsa Algorithm implementation for QuantumLearn.
Determines whether an oracle function is constant or balanced in a single quantum query.
"""

from typing import Any
from qiskit import QuantumCircuit
from app.services.simulation_backends import get_backend


def create_deutsch_jozsa_circuit(is_balanced: bool = True) -> QuantumCircuit:
    """
    Construct a 2-qubit Deutsch-Jozsa circuit (1 input qubit, 1 ancilla qubit).
    If is_balanced is True, f(x) = x (balanced); if False, f(x) = 0 (constant).
    """
    qc = QuantumCircuit(2, 1)

    # Initialize ancilla qubit to |1>
    qc.x(1)

    # Put both qubits in superposition
    qc.h(0)
    qc.h(1)

    # Oracle
    if is_balanced:
        qc.cx(0, 1)  # Phase kickback flips state |-> when x=1
    else:
        pass  # Constant oracle f(x) = 0 leaves ancilla unchanged

    # Interference on input qubit
    qc.h(0)

    # Measure input qubit
    qc.measure(0, 0)
    return qc


def run_deutsch_jozsa(is_balanced: bool = True, shots: int = 1024) -> dict[str, Any]:
    """Execute Deutsch-Jozsa algorithm and interpret result."""
    qc = create_deutsch_jozsa_circuit(is_balanced=is_balanced)
    backend = get_backend("qiskit_aer")
    res = backend.run_circuit(qc, shots=shots)

    # State '0' means constant, state '1' means balanced
    measured = res.get("most_frequent_state", "0")
    detected = "balanced" if measured.endswith("1") else "constant"

    res["algorithm"] = "Deutsch-Jozsa Algorithm"
    res["function_type"] = "balanced" if is_balanced else "constant"
    res["detected_type"] = detected
    res["success_interpretation"] = (
        f"The quantum oracle was evaluated with a single query. "
        f"Input register measured |{measured}⟩, correctly proving the function is {detected}."
    )
    return res
