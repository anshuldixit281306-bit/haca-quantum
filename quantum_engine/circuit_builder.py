"""
QuantumLearn Circuit Builder

Creates Qiskit circuits from simple operation definitions.
"""

from __future__ import annotations

from typing import Any

from qiskit import QuantumCircuit


SUPPORTED_SINGLE_QUBIT_GATES = {
    "H": "h",
    "X": "x",
    "Y": "y",
    "Z": "z",
    "S": "s",
    "T": "t",
}


class CircuitBuilder:
    """Build quantum circuits using a simple Python API."""

    def __init__(self, num_qubits: int) -> None:
        if not isinstance(num_qubits, int):
            raise ValueError("num_qubits must be an integer")

        if num_qubits < 1 or num_qubits > 20:
            raise ValueError("num_qubits must be between 1 and 20")

        self.num_qubits = num_qubits
        self.circuit = QuantumCircuit(num_qubits)

    def _validate_qubit(self, qubit: int) -> None:
        if not isinstance(qubit, int):
            raise ValueError("qubit must be an integer")

        if qubit < 0 or qubit >= self.num_qubits:
            raise ValueError(
                f"qubit must be between 0 and {self.num_qubits - 1}"
            )

    def add_gate(
        self,
        gate: str,
        qubit: int,
    ) -> "CircuitBuilder":
        """Add a single-qubit gate."""

        gate = gate.upper().strip()

        self._validate_qubit(qubit)

        if gate not in SUPPORTED_SINGLE_QUBIT_GATES:
            raise ValueError(
                f"Unsupported gate '{gate}'. "
                f"Supported gates: {list(SUPPORTED_SINGLE_QUBIT_GATES)}"
            )

        method_name = SUPPORTED_SINGLE_QUBIT_GATES[gate]
        getattr(self.circuit, method_name)(qubit)

        return self

    def add_cnot(
        self,
        control: int,
        target: int,
    ) -> "CircuitBuilder":
        """Add a CNOT gate."""

        self._validate_qubit(control)
        self._validate_qubit(target)

        if control == target:
            raise ValueError(
                "Control and target qubits must be different"
            )

        self.circuit.cx(control, target)

        return self

    def add_measurement(
        self,
    ) -> "CircuitBuilder":
        """Add measurements to all qubits."""

        self.circuit.measure_all()

        return self

    def build(self) -> QuantumCircuit:
        """Return the constructed Qiskit circuit."""

        return self.circuit.copy()

    def draw(self) -> str:
        """Return a text representation of the circuit."""

        return self.circuit.draw(output="text")


def build_circuit(
    num_qubits: int,
    operations: list[dict[str, Any]],
    measure: bool = True,
) -> QuantumCircuit:
    """
    Build a circuit from operation dictionaries.

    Example:

    operations = [
        {"gate": "H", "qubit": 0},
        {"gate": "CNOT", "control": 0, "target": 1}
    ]
    """

    builder = CircuitBuilder(num_qubits)

    for operation in operations:
        gate = str(operation.get("gate", "")).upper()

        if gate == "CNOT":
            builder.add_cnot(
                control=operation["control"],
                target=operation["target"],
            )
        else:
            builder.add_gate(
                gate=gate,
                qubit=operation["qubit"],
            )

    if measure:
        builder.add_measurement()

    return builder.build()