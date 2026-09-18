"""
QuantumLearn Circuit Validator

Validates circuit operations before sending them to Qiskit.
"""

from __future__ import annotations

from typing import Any


SUPPORTED_GATES = {
    "H",
    "X",
    "Y",
    "Z",
    "S",
    "T",
    "CNOT",
}


class CircuitValidator:
    """Validate quantum circuit operation definitions."""

    def __init__(self, num_qubits: int) -> None:
        self.num_qubits = num_qubits

    def validate(
        self,
        operations: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """
        Validate a list of quantum operations.

        Returns:
            {
                "valid": True/False,
                "errors": [...]
            }
        """

        errors: list[str] = []

        if not isinstance(self.num_qubits, int):
            errors.append("num_qubits must be an integer")

        elif self.num_qubits < 1 or self.num_qubits > 20:
            errors.append("num_qubits must be between 1 and 20")

        if not isinstance(operations, list):
            errors.append("operations must be a list")
            return {
                "valid": False,
                "errors": errors,
            }

        for index, operation in enumerate(operations):

            if not isinstance(operation, dict):
                errors.append(
                    f"Operation {index}: must be an object"
                )
                continue

            gate = str(
                operation.get("gate", "")
            ).upper()

            if gate not in SUPPORTED_GATES:
                errors.append(
                    f"Operation {index}: unsupported gate '{gate}'"
                )
                continue

            if gate == "CNOT":
                control = operation.get("control")
                target = operation.get("target")

                if not isinstance(control, int):
                    errors.append(
                        f"Operation {index}: control must be an integer"
                    )

                if not isinstance(target, int):
                    errors.append(
                        f"Operation {index}: target must be an integer"
                    )

                if isinstance(control, int):
                    if control < 0 or control >= self.num_qubits:
                        errors.append(
                            f"Operation {index}: "
                            f"control qubit out of range"
                        )

                if isinstance(target, int):
                    if target < 0 or target >= self.num_qubits:
                        errors.append(
                            f"Operation {index}: "
                            f"target qubit out of range"
                        )

                if (
                    isinstance(control, int)
                    and isinstance(target, int)
                    and control == target
                ):
                    errors.append(
                        f"Operation {index}: "
                        "control and target must be different"
                    )

            else:
                qubit = operation.get("qubit")

                if not isinstance(qubit, int):
                    errors.append(
                        f"Operation {index}: qubit must be an integer"
                    )
                    continue

                if qubit < 0 or qubit >= self.num_qubits:
                    errors.append(
                        f"Operation {index}: qubit out of range"
                    )

        return {
            "valid": len(errors) == 0,
            "errors": errors,
        }


def validate_circuit(
    num_qubits: int,
    operations: list[dict[str, Any]],
) -> dict[str, Any]:
    """Convenience validation function."""

    validator = CircuitValidator(num_qubits)

    return validator.validate(operations)