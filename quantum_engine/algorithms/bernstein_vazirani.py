"""
Bernstein-Vazirani Algorithm implementation for QuantumLearn.
Finds a hidden bitstring s with a single quantum query using phase kickback.
"""

from typing import Any
from qiskit import QuantumCircuit
from app.services.simulation_backends import get_backend


def create_bernstein_vazirani_circuit(hidden_string: str = "101") -> QuantumCircuit:
    """
    Construct Bernstein-Vazirani circuit for hidden string s.
    Uses len(s) input qubits and 1 ancilla qubit.
    """
    n = len(hidden_string)
    qc = QuantumCircuit(n + 1, n)

    # Initialize ancilla qubit to |1>
    qc.x(n)

    # Apply Hadamard to all qubits
    qc.h(range(n + 1))

    # Inner-product Oracle: CX on every qubit where s[i] == '1'
    # Note: Qiskit orders bitstrings right-to-left (q0 is least significant bit)
    for i, bit in enumerate(reversed(hidden_string)):
        if bit == "1":
            qc.cx(i, n)

    # Apply Hadamard to input register
    qc.h(range(n))

    # Measure input qubits
    qc.measure(range(n), range(n))
    return qc


def run_bernstein_vazirani(hidden_string: str = "101", shots: int = 1024) -> dict[str, Any]:
    """Execute Bernstein-Vazirani algorithm and recover the hidden bitstring."""
    qc = create_bernstein_vazirani_circuit(hidden_string=hidden_string)
    backend = get_backend("qiskit_aer")
    res = backend.run_circuit(qc, shots=shots)

    # Recovered string from the most frequent measurement
    recovered = res.get("most_frequent_state", "")[:len(hidden_string)]

    res["algorithm"] = "Bernstein-Vazirani Algorithm"
    res["hidden_string"] = hidden_string
    res["recovered_string"] = recovered
    res["success_interpretation"] = (
        f"Hidden bitstring s = '{hidden_string}' was extracted with 100% certainty "
        f"in a single quantum query (compared to {len(hidden_string)} queries classically)."
    )
    return res
