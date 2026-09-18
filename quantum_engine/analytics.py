"""
QuantumLearn Quantum Analytics

Analyzes simulation results and circuit properties.
"""

from __future__ import annotations

import math
from collections import Counter
from typing import Any

from qiskit import QuantumCircuit


def calculate_probabilities(
    counts: dict[str, int],
) -> dict[str, float]:
    """Convert measurement counts into probabilities."""

    total = sum(counts.values())

    if total <= 0:
        return {}

    return {
        state: round(count / total, 6)
        for state, count in counts.items()
    }


def calculate_entropy(
    probabilities: dict[str, float],
) -> float:
    """Calculate Shannon entropy of measurement distribution."""

    entropy = 0.0

    for probability in probabilities.values():

        if probability > 0:
            entropy -= probability * math.log2(probability)

    return round(entropy, 6)


def analyze_counts(
    counts: dict[str, int],
) -> dict[str, Any]:
    """
    Analyze measurement results.

    Returns dominant state, probabilities and entropy.
    """

    if not counts:
        return {
            "total_shots": 0,
            "dominant_state": None,
            "dominant_probability": 0.0,
            "probabilities": {},
            "entropy": 0.0,
        }

    total_shots = sum(counts.values())

    probabilities = calculate_probabilities(counts)

    dominant_state = max(
        counts,
        key=counts.get,
    )

    return {
        "total_shots": total_shots,
        "dominant_state": dominant_state,
        "dominant_probability": probabilities[dominant_state],
        "probabilities": probabilities,
        "entropy": calculate_entropy(probabilities),
    }


def analyze_circuit(
    circuit: QuantumCircuit,
) -> dict[str, Any]:
    """Analyze structural properties of a quantum circuit."""

    gate_counts: Counter[str] = Counter()

    for instruction in circuit.data:

        operation_name = instruction.operation.name

        if operation_name != "measure":
            gate_counts[operation_name] += 1

    try:
        depth = circuit.depth()
    except Exception:
        depth = None

    return {
        "num_qubits": circuit.num_qubits,
        "num_classical_bits": circuit.num_clbits,
        "gate_count": sum(gate_counts.values()),
        "gate_counts": dict(gate_counts),
        "circuit_depth": depth,
        "operations": len(circuit.data),
    }


def analyze_simulation(
    circuit: QuantumCircuit,
    counts: dict[str, int],
) -> dict[str, Any]:
    """
    Combine circuit analysis and simulation analysis.

    This output will later be passed to the AI Result Analyzer.
    """

    return {
        "circuit": analyze_circuit(circuit),
        "simulation": analyze_counts(counts),
    }