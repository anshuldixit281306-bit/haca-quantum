"""
QuantumLearn Quantum Visualization

Provides circuit diagrams and measurement data
in frontend-friendly formats.
"""

from __future__ import annotations

from typing import Any

from qiskit import QuantumCircuit


def circuit_to_text(
    circuit: QuantumCircuit,
) -> str:
    """Convert a Qiskit circuit to a text diagram."""

    return circuit.draw(output="text")


def measurement_chart_data(
    counts: dict[str, int],
) -> list[dict[str, Any]]:
    """
    Convert measurement counts into frontend-friendly chart data.
    """

    total = sum(counts.values())

    if total <= 0:
        return []

    data = []

    for state, count in sorted(
        counts.items(),
        key=lambda item: item[0],
    ):
        data.append(
            {
                "state": state,
                "count": count,
                "probability": round(
                    count / total,
                    6,
                ),
                "percentage": round(
                    (count / total) * 100,
                    2,
                ),
            }
        )

    return data


def visualization_payload(
    circuit: QuantumCircuit,
    counts: dict[str, int],
) -> dict[str, Any]:
    """
    Create a complete visualization payload.

    Designed for the Quantum Lab frontend.
    """

    return {
        "circuit_diagram": circuit_to_text(circuit),
        "measurements": measurement_chart_data(counts),
    }