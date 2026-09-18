"""
QuantumLearn Quantum Simulator

Core Qiskit/Aer simulation engine.
Runs quantum circuits and returns structured results.
"""

from __future__ import annotations

from typing import Any

from qiskit import QuantumCircuit

try:
    from qiskit_aer import AerSimulator
except ImportError:
    AerSimulator = None


class QuantumSimulator:
    """Wrapper around Qiskit Aer for running quantum circuits."""

    def __init__(self) -> None:
        if AerSimulator is None:
            raise ImportError(
                "qiskit-aer is not installed. "
                "Install it with: pip install qiskit-aer"
            )

        self.backend = AerSimulator()

    def run(
        self,
        circuit: QuantumCircuit,
        shots: int = 1024,
    ) -> dict[str, Any]:
        """
        Execute a quantum circuit and return counts/probabilities.

        Args:
            circuit: Qiskit QuantumCircuit.
            shots: Number of measurements.

        Returns:
            Dictionary containing simulation results.
        """

        if not isinstance(shots, int):
            raise ValueError("shots must be an integer")

        if shots < 1 or shots > 100000:
            raise ValueError("shots must be between 1 and 100000")

        if not isinstance(circuit, QuantumCircuit):
            raise TypeError("circuit must be a Qiskit QuantumCircuit")

        # Make a copy so the original circuit is not modified.
        circuit_to_run = circuit.copy()

        # Add measurements if the circuit has none.
        if circuit_to_run.num_clbits == 0:
            measured_circuit = QuantumCircuit(
                circuit_to_run.num_qubits,
                circuit_to_run.num_qubits,
            )
            measured_circuit.compose(
                circuit_to_run,
                inplace=True,
            )
            measured_circuit.measure(
                range(circuit_to_run.num_qubits),
                range(circuit_to_run.num_qubits),
            )
            circuit_to_run = measured_circuit

        elif not any(
            instruction.operation.name == "measure"
            for instruction in circuit_to_run.data
        ):
            circuit_to_run.measure_all()

        job = self.backend.run(
            circuit_to_run,
            shots=shots,
        )

        result = job.result()
        counts = result.get_counts(circuit_to_run)

        # Convert counts to normal Python integers.
        counts = {
            str(state): int(count)
            for state, count in counts.items()
        }

        probabilities = {
            state: round(count / shots, 6)
            for state, count in counts.items()
        }

        return {
            "success": True,
            "shots": shots,
            "num_qubits": circuit.num_qubits,
            "counts": counts,
            "probabilities": probabilities,
            "circuit": circuit_to_run.draw(output="text"),
        }


def simulate(
    circuit: QuantumCircuit,
    shots: int = 1024,
) -> dict[str, Any]:
    """Convenience function for running a circuit."""

    simulator = QuantumSimulator()

    return simulator.run(
        circuit=circuit,
        shots=shots,
    )