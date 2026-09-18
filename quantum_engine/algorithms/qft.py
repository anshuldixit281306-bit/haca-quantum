"""
Quantum Fourier Transform (QFT) implementation for QuantumLearn.
Transforms computational basis states into phase representation.
"""

import math
from typing import Any
from qiskit import QuantumCircuit
from app.services.simulation_backends import get_backend


def create_qft_circuit(num_qubits: int = 3, inverse: bool = False) -> QuantumCircuit:
    """
    Construct a clean n-qubit Quantum Fourier Transform circuit.
    """
    qc = QuantumCircuit(num_qubits, num_qubits)

    # Initial state preparation (e.g., state |1> to observe Fourier transformed phases)
    qc.x(0)

    # Apply QFT
    for j in range(num_qubits):
        qc.h(j)
        for k in range(j + 1, num_qubits):
            angle = math.pi / (2 ** (k - j))
            if inverse:
                angle = -angle
            # Use cp (controlled phase)
            qc.cp(angle, k, j)

    # Swaps to align endianness
    for i in range(num_qubits // 2):
        qc.swap(i, num_qubits - i - 1)

    qc.measure(range(num_qubits), range(num_qubits))
    return qc


def run_qft(num_qubits: int = 3, shots: int = 1024) -> dict[str, Any]:
    """Execute QFT and return frequency analysis metrics."""
    qc = create_qft_circuit(num_qubits=num_qubits)
    backend = get_backend("qiskit_aer")
    res = backend.run_circuit(qc, shots=shots)
    res["algorithm"] = f"Quantum Fourier Transform ({num_qubits} qubits)"
    res["explanation"] = (
        f"QFT maps quantum amplitudes into Fourier frequency basis in O(n²) operations, "
        f"providing exponential speedup over the classical FFT O(N log N) where N = 2^n."
    )
    return res
