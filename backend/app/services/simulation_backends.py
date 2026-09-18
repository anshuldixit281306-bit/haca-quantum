"""
Quantum simulation backends abstraction layer for QuantumLearn.

Qiskit Aer is the primary production simulator.

Responsibilities:
- Execute real quantum circuits
- Generate measurement counts
- Generate normalized and exact probabilities
- Extract statevector amplitudes
- Generate phase information
- Generate Dirac notation
- Calculate Bloch-sphere coordinates
- Generate a readable circuit diagram
- Return structured data for the AI analysis layer

Important architecture rule:

    Qiskit / Quantum Engine = mathematical source of truth
    DeepSeek / AI            = explanation and interpretation

The AI layer must never replace the actual quantum simulation.
"""

from abc import ABC, abstractmethod
import math
from typing import Any

from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

try:
    from qiskit_aer import AerSimulator
except ImportError:
    AerSimulator = None

try:
    import pennylane as qml
except ImportError:
    qml = None

try:
    import cirq
except ImportError:
    cirq = None


# ============================================================================
# Abstract backend
# ============================================================================

class SimulationBackend(ABC):
    """Abstract base class for quantum simulation backends."""

    id: str
    name: str
    framework: str
    available: bool
    status: str

    @abstractmethod
    def run_circuit(
        self,
        circuit: QuantumCircuit,
        shots: int = 1024,
    ) -> dict[str, Any]:
        """Execute a quantum circuit and return simulation data."""
        raise NotImplementedError

    @abstractmethod
    def get_info(self) -> dict[str, Any]:
        """Return backend metadata and capabilities."""
        raise NotImplementedError


# ============================================================================
# Qiskit Aer Backend
# ============================================================================

class QiskitAerBackend(SimulationBackend):
    """
    Primary QuantumLearn simulator.

    Uses:
        - Statevector for exact quantum-state analysis
        - AerSimulator for shot-based measurement simulation
    """

    id = "qiskit_aer"
    name = "Qiskit Aer Simulator"
    framework = "Qiskit"
    available = AerSimulator is not None
    status = "Active" if AerSimulator is not None else "Unavailable"

    def __init__(self):
        if self.available:
            self._simulator = AerSimulator()
        else:
            self._simulator = None

    # ------------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------------

    @staticmethod
    def _has_measurements(circuit: QuantumCircuit) -> bool:
        """Return True if the circuit already contains measurement operations."""

        try:
            for instruction in circuit.data:
                operation = getattr(instruction, "operation", None)

                if operation is not None:
                    if operation.name == "measure":
                        return True

                # Compatibility with older Qiskit instruction format.
                elif len(instruction) > 0:
                    if getattr(instruction[0], "name", "") == "measure":
                        return True

        except Exception:
            pass

        return False

    @staticmethod
    def _clean_complex(value: complex) -> dict[str, float]:
        """Convert a complex amplitude into JSON-safe numerical data."""

        real = float(value.real)
        imaginary = float(value.imag)

        if abs(real) < 1e-12:
            real = 0.0

        if abs(imaginary) < 1e-12:
            imaginary = 0.0

        magnitude = abs(value)
        probability = magnitude ** 2

        phase = math.atan2(
            imaginary,
            real,
        )

        return {
            "real": real,
            "imaginary": imaginary,
            "magnitude": float(magnitude),
            "probability": float(probability),
            "phase": float(phase),
            "phase_deg": float(math.degrees(phase)),
        }

    @staticmethod
    def _build_statevector_data(
        statevector: Statevector,
        num_qubits: int,
    ) -> list[dict[str, Any]]:
        """
        Convert Qiskit Statevector into structured basis-state data.
        """

        data: list[dict[str, Any]] = []

        for index, amplitude in enumerate(statevector.data):

            binary_state = format(
                index,
                f"0{num_qubits}b",
            )

            complex_value = complex(amplitude)

            values = QiskitAerBackend._clean_complex(
                complex_value
            )

            data.append(
                {
                    "basis_state": f"|{binary_state}⟩",
                    "state": binary_state,
                    **values,
                }
            )

        return data

    @staticmethod
    def _build_exact_probabilities(
        statevector: Statevector,
        num_qubits: int,
    ) -> dict[str, float]:
        """
        Calculate exact theoretical measurement probabilities.

        These probabilities come directly from |amplitude|².
        """

        probabilities: dict[str, float] = {}

        for index, amplitude in enumerate(statevector.data):

            probability = float(
                abs(complex(amplitude)) ** 2
            )

            if probability > 1e-12:

                binary_state = format(
                    index,
                    f"0{num_qubits}b",
                )

                probabilities[binary_state] = round(
                    probability,
                    10,
                )

        return probabilities

    @staticmethod
    def _build_dirac_notation(
        statevector: Statevector,
        num_qubits: int,
    ) -> str:
        """
        Generate a readable Dirac notation.

        Example:

            |ψ⟩ = 0.707|00⟩ + 0.707|11⟩
        """

        terms: list[str] = []

        for index, amplitude in enumerate(statevector.data):

            value = complex(amplitude)
            magnitude = abs(value)

            if magnitude <= 1e-10:
                continue

            binary_state = format(
                index,
                f"0{num_qubits}b",
            )

            phase = math.atan2(
                value.imag,
                value.real,
            )

            # Common real amplitudes get cleaner notation.
            if abs(phase) < 1e-8:
                coefficient = f"{magnitude:.6f}"

                terms.append(
                    f"{coefficient}|{binary_state}⟩"
                )

            elif abs(abs(phase) - math.pi) < 1e-8:
                coefficient = f"-{magnitude:.6f}"

                terms.append(
                    f"{coefficient}|{binary_state}⟩"
                )

            else:
                coefficient = (
                    f"{magnitude:.6f}"
                    f"·e^(i{phase:.4f})"
                )

                terms.append(
                    f"{coefficient}|{binary_state}⟩"
                )

        if not terms:
            return "|ψ⟩ = |0⟩"

        return "|ψ⟩ = " + " + ".join(terms)

    @staticmethod
    def _calculate_single_qubit_bloch(
        statevector: Statevector,
    ) -> dict[str, float] | None:
        """
        Calculate Bloch coordinates for a single-qubit pure state.

            |ψ⟩ = α|0⟩ + β|1⟩

            x = 2 Re(α*β)
            y = 2 Im(α*β)
            z = |α|² - |β|²
        """

        if len(statevector.data) != 2:
            return None

        alpha = complex(
            statevector.data[0]
        )

        beta = complex(
            statevector.data[1]
        )

        product = alpha.conjugate() * beta

        x = 2.0 * product.real
        y = 2.0 * product.imag

        z = (
            abs(alpha) ** 2
            - abs(beta) ** 2
        )

        # Numerical protection.
        x = max(-1.0, min(1.0, x))
        y = max(-1.0, min(1.0, y))
        z = max(-1.0, min(1.0, z))

        theta = math.acos(z)

        if abs(x) > 1e-10 or abs(y) > 1e-10:
            phi = math.atan2(y, x)
        else:
            phi = 0.0

        return {
            "x": round(x, 6),
            "y": round(y, 6),
            "z": round(z, 6),
            "theta": round(theta, 6),
            "phi": round(phi, 6),
            "theta_deg": round(
                math.degrees(theta),
                3,
            ),
            "phi_deg": round(
                math.degrees(phi),
                3,
            ),
        }

    @staticmethod
    def _build_measurement_probabilities(
        counts: dict[str, int],
        shots: int,
    ) -> dict[str, float]:
        """Convert measured counts to empirical probabilities."""

        if shots <= 0:
            return {}

        return {
            state: round(
                count / shots,
                10,
            )
            for state, count in sorted(
                counts.items()
            )
        }

    @staticmethod
    def _build_measurement_summary(
        counts: dict[str, int],
        exact_probabilities: dict[str, float],
        shots: int,
    ) -> dict[str, Any]:
        """
        Build a factual summary that can be passed to the AI layer.

        This contains no AI-generated interpretation.
        """

        if counts:
            most_frequent_state = max(
                counts,
                key=counts.get,
            )

            highest_count = counts[
                most_frequent_state
            ]

            measured_probability = (
                highest_count / shots
                if shots > 0
                else 0.0
            )

        else:
            most_frequent_state = None
            highest_count = 0
            measured_probability = 0.0

        return {
            "most_frequent_state": most_frequent_state,
            "highest_count": highest_count,
            "measured_probability": round(
                measured_probability,
                10,
            ),
            "number_of_observed_states": len(
                counts
            ),
            "number_of_possible_states": len(
                exact_probabilities
            ),
        }

    # ------------------------------------------------------------------------
    # Main execution
    # ------------------------------------------------------------------------

    def run_circuit(
        self,
        circuit: QuantumCircuit,
        shots: int = 1024,
    ) -> dict[str, Any]:

        if not self.available or self._simulator is None:
            raise RuntimeError(
                "Qiskit Aer is not available. "
                "Install it with: pip install qiskit-aer"
            )

        if shots < 1:
            raise ValueError(
                "Shots must be at least 1."
            )

        # ====================================================================
        # STEP 1 — Statevector analysis
        # ====================================================================

        circuit_for_statevector = (
            circuit.remove_final_measurements(
                inplace=False
            )
        )

        try:
            statevector = Statevector.from_instruction(
                circuit_for_statevector
            )
        except Exception as exc:
            raise RuntimeError(
                f"Unable to calculate circuit statevector: {exc}"
            ) from exc

        num_qubits = circuit.num_qubits

        statevector_data = (
            self._build_statevector_data(
                statevector,
                num_qubits,
            )
        )

        exact_probabilities = (
            self._build_exact_probabilities(
                statevector,
                num_qubits,
            )
        )

        dirac_notation = (
            self._build_dirac_notation(
                statevector,
                num_qubits,
            )
        )

        # ====================================================================
        # STEP 2 — Bloch sphere
        # ====================================================================

        bloch = None

        if num_qubits == 1:
            bloch = (
                self._calculate_single_qubit_bloch(
                    statevector
                )
            )

        # ====================================================================
        # STEP 3 — Measurement simulation
        # ====================================================================

        circuit_to_run = circuit.copy()

        if not self._has_measurements(
            circuit_to_run
        ):
            circuit_to_run.measure(
                range(num_qubits),
                range(num_qubits),
            )

        try:
            job = self._simulator.run(
                circuit_to_run,
                shots=shots,
            )

            qiskit_result = job.result()

            raw_counts = qiskit_result.get_counts(
                circuit_to_run
            )

        except Exception as exc:
            raise RuntimeError(
                f"Quantum measurement simulation failed: {exc}"
            ) from exc

        # ====================================================================
        # STEP 4 — Normalize counts
        # ====================================================================

        counts: dict[str, int] = {}

        for state, count in raw_counts.items():

            normalized_state = (
                str(state)
                .replace(" ", "")
            )

            counts[
                normalized_state
            ] = int(count)

        probabilities = (
            self._build_measurement_probabilities(
                counts,
                shots,
            )
        )

        measurement_summary = (
            self._build_measurement_summary(
                counts,
                exact_probabilities,
                shots,
            )
        )

        # ====================================================================
        # STEP 5 — Circuit diagram
        # ====================================================================

        try:
            circuit_diagram = str(
                circuit_to_run.draw(
                    output="text"
                )
            )
        except Exception:
            circuit_diagram = ""

        # ====================================================================
        # STEP 6 — Circuit metrics
        # ====================================================================

        try:
            circuit_depth = int(
                circuit.depth()
            )
        except Exception:
            circuit_depth = None

        try:
            operation_count = len(
                circuit.data
            )
        except Exception:
            operation_count = None

        try:
            gate_counts = {
                str(name): int(count)
                for name, count
                in circuit.count_ops().items()
            }
        except Exception:
            gate_counts = {}

        # ====================================================================
        # STEP 7 — AI grounding payload
        # ====================================================================

        ai_context = {
            "source": "qiskit_aer",
            "source_of_truth": "quantum_simulation",

            "circuit": {
                "num_qubits": num_qubits,
                "depth": circuit_depth,
                "operation_count": operation_count,
                "gate_counts": gate_counts,
                "diagram": circuit_diagram,
            },

            "execution": {
                "shots": shots,
            },

            "measurement": {
                "counts": counts,
                "probabilities": probabilities,
                "most_frequent_state": (
                    measurement_summary[
                        "most_frequent_state"
                    ]
                ),
                "highest_count": (
                    measurement_summary[
                        "highest_count"
                    ]
                ),
                "measured_probability": (
                    measurement_summary[
                        "measured_probability"
                    ]
                ),
            },

            "theoretical": {
                "exact_probabilities": (
                    exact_probabilities
                ),
                "statevector": statevector_data,
                "dirac_notation": dirac_notation,
            },

            "bloch": bloch,
        }

        # ====================================================================
        # FINAL RESPONSE
        # ====================================================================

        return {
            "success": True,

            # Backend information
            "backend": self.id,
            "backend_name": self.name,

            # Execution
            "shots": shots,
            "num_qubits": num_qubits,

            # Measurement result
            "counts": counts,
            "probabilities": probabilities,
            "exact_probabilities": exact_probabilities,
            "most_frequent_state": (
                measurement_summary[
                    "most_frequent_state"
                ]
            ),

            # Quantum state
            "statevector": {
                "amplitudes": statevector_data,
                "dirac_notation": dirac_notation,
            },

            # Visualization data
            "bloch": bloch,

            # Circuit information
            "circuit_depth": circuit_depth,
            "operation_count": operation_count,
            "gate_counts": gate_counts,
            "circuit_diagram": circuit_diagram,

            # Measurement metadata
            "measurement_summary": measurement_summary,

            # AI grounding
            "ai_context": ai_context,
        }

    # ------------------------------------------------------------------------
    # Backend information
    # ------------------------------------------------------------------------

    def get_info(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "framework": self.framework,
            "available": self.available,
            "status": self.status,
            "max_qubits": 32,
            "description": (
                "High-performance Qiskit Aer simulator "
                "for exact state analysis and shot-based "
                "quantum measurement."
            ),
            "capabilities": [
                "statevector",
                "measurement",
                "probabilities",
                "counts",
                "phase",
                "Dirac notation",
                "Bloch sphere",
                "circuit diagram",
            ],
        }


# ============================================================================
# PennyLane Backend
# ============================================================================

class PennyLaneBackend(SimulationBackend):
    """PennyLane plugin architecture interface."""

    id = "pennylane_default"
    name = "PennyLane (default.qubit)"
    framework = "PennyLane"
    available = qml is not None
    status = (
        "Active"
        if qml is not None
        else "Pluggable (SDK not installed)"
    )

    def run_circuit(
        self,
        circuit: QuantumCircuit,
        shots: int = 1024,
    ) -> dict[str, Any]:

        if not self.available:
            raise NotImplementedError(
                "PennyLane is not currently installed. "
                "Install it with: pip install pennylane"
            )

        return {
            "success": False,
            "detail": (
                "PennyLane execution adapter is "
                "reserved for future backend expansion."
            ),
        }

    def get_info(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "framework": self.framework,
            "available": self.available,
            "status": self.status,
            "max_qubits": 26,
            "description": (
                "Differentiable quantum simulation "
                "for hybrid quantum-classical algorithms."
            ),
        }


# ============================================================================
# Cirq Backend
# ============================================================================

class CirqBackend(SimulationBackend):
    """Google Cirq backend architecture interface."""

    id = "cirq_simulator"
    name = "Google Cirq Simulator"
    framework = "Cirq"
    available = cirq is not None
    status = (
        "Active"
        if cirq is not None
        else "Pluggable (SDK not installed)"
    )

    def run_circuit(
        self,
        circuit: QuantumCircuit,
        shots: int = 1024,
    ) -> dict[str, Any]:

        if not self.available:
            raise NotImplementedError(
                "Google Cirq is not currently installed. "
                "Install it with: pip install cirq"
            )

        return {
            "success": False,
            "detail": (
                "Cirq execution adapter is "
                "reserved for future backend expansion."
            ),
        }

    def get_info(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "framework": self.framework,
            "available": self.available,
            "status": self.status,
            "max_qubits": 28,
            "description": (
                "Google Quantum AI framework "
                "for NISQ algorithms and quantum processors."
            ),
        }


# ============================================================================
# Backend registry
# ============================================================================

_BACKENDS: dict[str, SimulationBackend] = {
    "qiskit_aer": QiskitAerBackend(),
    "pennylane": PennyLaneBackend(),
    "cirq": CirqBackend(),
}


# ============================================================================
# Public API
# ============================================================================

def get_backend(
    backend_id: str = "qiskit_aer",
) -> SimulationBackend:
    """
    Retrieve a simulation backend.

    Unknown backend IDs safely fall back to Qiskit Aer.
    """

    normalized_id = str(
        backend_id
    ).lower().strip()

    return _BACKENDS.get(
        normalized_id,
        _BACKENDS["qiskit_aer"],
    )


def list_available_backends() -> list[dict[str, Any]]:
    """Return metadata for all registered simulation backends."""

    return [
        backend.get_info()
        for backend in _BACKENDS.values()
    ]