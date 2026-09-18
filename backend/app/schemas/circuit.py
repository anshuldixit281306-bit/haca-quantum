"""
Pydantic schemas for quantum circuit simulation, multi-backend execution,
and code-based lab experiments.
"""

from typing import Any
from pydantic import BaseModel, Field, model_validator


SUPPORTED_GATES = {
    "h",
    "x",
    "y",
    "z",
    "s",
    "t",
    "cx",
    "cnot",
    "cz",
    "swap",
    "rx",
    "ry",
    "rz",
    "measure",
}


class GateOperation(BaseModel):
    """A single operation in a quantum circuit."""

    gate: str = Field(..., min_length=1, max_length=20)
    qubit: int | None = Field(default=None, ge=0)
    control: int | None = Field(default=None, ge=0)
    target: int | None = Field(default=None, ge=0)
    param: float | None = Field(default=None)
    column: int | None = Field(default=None, ge=0)

    @model_validator(mode="after")
    def validate_gate_operation(self):
        gate = self.gate.lower().strip()

        if gate not in SUPPORTED_GATES:
            raise ValueError(
                f"Unsupported gate '{self.gate}'. "
                f"Supported gates: {', '.join(sorted(SUPPORTED_GATES))}"
            )

        if gate in {"cx", "cnot", "cz", "swap"}:
            if self.control is None:
                self.control = self.qubit
            if self.control is None or self.target is None:
                raise ValueError(
                    f"{gate.upper()} requires both 'control' and 'target' qubits."
                )

            if self.control == self.target:
                raise ValueError(
                    f"{gate.upper()} control and target qubits must be different."
                )

        elif gate != "measure":
            if self.qubit is None:
                raise ValueError(
                    f"Gate '{gate}' requires a 'qubit' field."
                )

        return self


class CircuitRequest(BaseModel):
    """Request body for quantum circuit simulation."""

    num_qubits: int = Field(..., ge=1, le=20)
    gates: list[GateOperation] = Field(default_factory=list)
    shots: int = Field(default=1024, ge=1, le=100000)
    algorithm: str | None = Field(default=None, max_length=100)
    measure: bool = True
    backend: str = Field(default="qiskit_aer")


class ExecuteCodeRequest(BaseModel):
    """Request body for running arbitrary user Python/Qiskit code in Code Lab."""

    code: str = Field(..., min_length=1, max_length=50000)
    shots: int = Field(default=1024, ge=1, le=100000)
    framework: str = Field(default="qiskit")


class PredictCircuitRequest(BaseModel):
    """Request body for pre-execution AI/analytical circuit outcome prediction."""

    num_qubits: int = Field(..., ge=1, le=20)
    gates: list[GateOperation] = Field(default_factory=list)