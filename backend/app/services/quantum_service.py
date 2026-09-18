"""
Quantum simulation service for QuantumLearn.

Uses Qiskit and Qiskit Aer through the platform backend abstraction
to build, validate, and execute quantum circuits.

Responsibilities:
- Build and validate quantum circuits
- Support all platform gates
- Execute real quantum simulations
- Return measurement counts and probabilities
- Extract statevector information when available
- Calculate single-qubit Bloch coordinates
- Provide structured circuit context for AI analysis
- Keep Qiskit/Quantum Engine as the source of truth
"""

import math
from collections import Counter
from typing import Any

from qiskit import QuantumCircuit

from app.services.simulation_backends import get_backend


# ---------------------------------------------------------------------------
# Supported gates
# ---------------------------------------------------------------------------

SUPPORTED_SINGLE_QUBIT_GATES = {
    "h",
    "x",
    "y",
    "z",
    "s",
    "t",
    "rx",
    "ry",
    "rz",
}

SUPPORTED_TWO_QUBIT_GATES = {
    "cx",
    "cnot",
    "cz",
    "swap",
}


# ---------------------------------------------------------------------------
# Utility helpers
# ---------------------------------------------------------------------------

def _validate_qubit_index(
    qubit: Any,
    num_qubits: int,
    gate_name: str,
) -> int:
    """Validate and normalize a qubit index."""

    if qubit is None:
        raise ValueError(
            f"Gate '{gate_name.upper()}' requires a target qubit."
        )

    try:
        index = int(qubit)
    except (TypeError, ValueError):
        raise ValueError(
            f"Invalid qubit index '{qubit}' for gate '{gate_name.upper()}'."
        )

    if index < 0:
        raise ValueError(
            f"Qubit index cannot be negative: {index}."
        )

    if index >= num_qubits:
        raise ValueError(
            f"Qubit index {index} exceeds circuit size "
            f"({num_qubits} qubits)."
        )

    return index


def _normalize_probability_distribution(
    counts: dict[str, Any],
    shots: int,
) -> dict[str, float]:
    """
    Convert measurement counts into probabilities.

    Example:
        {'00': 512, '11': 512}
        ->
        {'00': 0.5, '11': 0.5}
    """

    if not counts or shots <= 0:
        return {}

    probabilities: dict[str, float] = {}

    for state, count in counts.items():
        try:
            numeric_count = float(count)
        except (TypeError, ValueError):
            numeric_count = 0.0

        probabilities[str(state)] = numeric_count / float(shots)

    return probabilities


def _clean_statevector_value(value: Any) -> dict[str, float]:
    """Convert a complex amplitude into JSON-safe real/imaginary values."""

    try:
        complex_value = complex(value)
    except (TypeError, ValueError):
        complex_value = complex(0.0, 0.0)

    magnitude = abs(complex_value)
    probability = magnitude ** 2
    phase = math.atan2(
        complex_value.imag,
        complex_value.real,
    )

    # Avoid floating-point noise around zero.
    real = 0.0 if abs(complex_value.real) < 1e-12 else complex_value.real
    imaginary = (
        0.0
        if abs(complex_value.imag) < 1e-12
        else complex_value.imag
    )

    return {
        "real": float(real),
        "imaginary": float(imaginary),
        "magnitude": float(magnitude),
        "probability": float(probability),
        "phase": float(phase),
    }


def _calculate_bloch_coordinates(
    statevector_data: list[dict[str, float]],
    num_qubits: int,
) -> dict[str, dict[str, float]]:
    """
    Calculate Bloch coordinates for single-qubit states.

    For a pure single-qubit state:

        |psi> = alpha|0> + beta|1>

        x = 2 Re(alpha* beta)
        y = 2 Im(alpha* beta)
        z = |alpha|² - |beta|²

    For multi-qubit states, reduced single-qubit density information
    is calculated directly from the statevector amplitudes.
    """

    if not statevector_data or num_qubits < 1:
        return {}

    bloch_coordinates: dict[str, dict[str, float]] = {}

    amplitudes = [
        complex(
            item.get("real", 0.0),
            item.get("imaginary", 0.0),
        )
        for item in statevector_data
    ]

    expected_dimension = 2 ** num_qubits

    if len(amplitudes) != expected_dimension:
        return {}

    for qubit in range(num_qubits):
        rho00 = 0.0
        rho11 = 0.0
        rho01 = complex(0.0, 0.0)

        for basis_index in range(expected_dimension):
            bit = (basis_index >> qubit) & 1

            if bit == 0:
                alpha = amplitudes[basis_index]

                partner_index = basis_index | (1 << qubit)

                if partner_index < expected_dimension:
                    beta = amplitudes[partner_index]

                    rho00 += abs(alpha) ** 2
                    rho11 += abs(beta) ** 2
                    rho01 += alpha * beta.conjugate()

        x = 2.0 * rho01.real
        y = 2.0 * rho01.imag
        z = rho00 - rho11

        bloch_coordinates[f"q{qubit}"] = {
            "x": float(x),
            "y": float(y),
            "z": float(z),
        }

    return bloch_coordinates


def _extract_statevector_information(
    raw_statevector: Any,
    num_qubits: int,
) -> dict[str, Any] | None:
    """
    Convert a Qiskit Statevector into JSON-safe structured information.
    """

    if raw_statevector is None:
        return None

    try:
        amplitudes = list(raw_statevector)
    except Exception:
        return None

    statevector_data: list[dict[str, Any]] = []

    for index, amplitude in enumerate(amplitudes):
        binary_state = format(
            index,
            f"0{num_qubits}b",
        )

        value = _clean_statevector_value(amplitude)

        statevector_data.append(
            {
                "basis_state": f"|{binary_state}⟩",
                "state": binary_state,
                **value,
            }
        )

    bloch_coordinates = _calculate_bloch_coordinates(
        statevector_data,
        num_qubits,
    )

    return {
        "num_amplitudes": len(statevector_data),
        "amplitudes": statevector_data,
        "bloch_coordinates": bloch_coordinates,
    }


def _get_counts_from_result(
    result: dict[str, Any],
) -> dict[str, int]:
    """Normalize counts returned by different simulation backends."""

    raw_counts = result.get("counts", {})

    if raw_counts is None:
        return {}

    normalized: dict[str, int] = {}

    try:
        items = raw_counts.items()
    except AttributeError:
        return {}

    for state, count in items:
        state_key = str(state)

        try:
            normalized[state_key] = int(count)
        except (TypeError, ValueError):
            normalized[state_key] = 0

    return normalized


def _get_most_frequent_state(
    counts: dict[str, int],
) -> str | None:
    """Return the measured state with the highest frequency."""

    if not counts:
        return None

    return max(
        counts.items(),
        key=lambda item: item[1],
    )[0]


# ---------------------------------------------------------------------------
# Circuit metadata
# ---------------------------------------------------------------------------

def describe_circuit(
    num_qubits: int,
    gates: list[dict],
) -> dict[str, Any]:
    """
    Create structured circuit metadata.

    This data is intentionally independent from DeepSeek.
    It gives the AI layer reliable facts about the circuit.
    """

    gate_sequence: list[dict[str, Any]] = []
    gate_counts: Counter[str] = Counter()

    for position, operation in enumerate(gates):
        gate = str(
            operation.get("gate", "")
        ).lower().strip()

        if not gate:
            continue

        gate_counts[gate] += 1

        item: dict[str, Any] = {
            "step": position + 1,
            "gate": gate.upper(),
        }

        if "qubit" in operation:
            item["qubit"] = operation.get("qubit")

        if "control" in operation:
            item["control"] = operation.get("control")

        if "target" in operation:
            item["target"] = operation.get("target")

        if "param" in operation:
            item["param"] = operation.get("param")

        if "params" in operation:
            item["params"] = operation.get("params")

        gate_sequence.append(item)

    return {
        "num_qubits": num_qubits,
        "num_gates": len(gate_sequence),
        "gate_counts": dict(gate_counts),
        "gate_sequence": gate_sequence,
    }


# ---------------------------------------------------------------------------
# Circuit builder
# ---------------------------------------------------------------------------

def build_circuit(
    num_qubits: int,
    gates: list[dict],
    add_measurements: bool = False,
) -> QuantumCircuit:
    """
    Build a Qiskit circuit from platform gate definitions.

    The circuit is strictly validated before execution.
    """

    if num_qubits < 1:
        raise ValueError(
            "Circuit must contain at least 1 qubit."
        )

    if num_qubits > 20:
        raise ValueError(
            "Circuit size limited to 20 qubits "
            "for interactive simulation."
        )

    circuit = QuantumCircuit(
        num_qubits,
        num_qubits,
    )

    for operation in gates:
        if not isinstance(operation, dict):
            raise ValueError(
                "Every circuit operation must be an object."
            )

        gate = str(
            operation.get("gate", "")
        ).lower().strip()

        if not gate:
            raise ValueError(
                "Circuit operation is missing a gate."
            )

        # ---------------------------------------------------------------
        # Single-qubit gates
        # ---------------------------------------------------------------

        if gate in SUPPORTED_SINGLE_QUBIT_GATES:
            qubit = _validate_qubit_index(
                operation.get("qubit"),
                num_qubits,
                gate,
            )

            param = operation.get("param")

            if param is None:
                params = operation.get("params")

                if isinstance(params, (list, tuple)) and params:
                    param = params[0]

            # Existing platform behaviour:
            # if no rotation parameter is supplied, use pi.
            if param is None:
                angle = math.pi
            else:
                try:
                    angle = float(param)
                except (TypeError, ValueError):
                    raise ValueError(
                        f"Invalid angle '{param}' "
                        f"for gate '{gate.upper()}'."
                    )

            if gate == "h":
                circuit.h(qubit)

            elif gate == "x":
                circuit.x(qubit)

            elif gate == "y":
                circuit.y(qubit)

            elif gate == "z":
                circuit.z(qubit)

            elif gate == "s":
                circuit.s(qubit)

            elif gate == "t":
                circuit.t(qubit)

            elif gate == "rx":
                circuit.rx(
                    angle,
                    qubit,
                )

            elif gate == "ry":
                circuit.ry(
                    angle,
                    qubit,
                )

            elif gate == "rz":
                circuit.rz(
                    angle,
                    qubit,
                )

        # ---------------------------------------------------------------
        # Two-qubit gates
        # ---------------------------------------------------------------

        elif gate in SUPPORTED_TWO_QUBIT_GATES:
            control = operation.get("control")

            if control is None:
                control = operation.get("qubit")

            target = operation.get("target")

            control = _validate_qubit_index(
                control,
                num_qubits,
                gate,
            )

            target = _validate_qubit_index(
                target,
                num_qubits,
                gate,
            )

            if control == target:
                raise ValueError(
                    f"{gate.upper()} control and target "
                    "qubits must be distinct."
                )

            if gate in {"cx", "cnot"}:
                circuit.cx(
                    control,
                    target,
                )

            elif gate == "cz":
                circuit.cz(
                    control,
                    target,
                )

            elif gate == "swap":
                circuit.swap(
                    control,
                    target,
                )

        # ---------------------------------------------------------------
        # Measurement
        # ---------------------------------------------------------------

        elif gate == "measure":
            qubit = _validate_qubit_index(
                operation.get("qubit", 0),
                num_qubits,
                gate,
            )

            circuit.measure(
                qubit,
                qubit,
            )

        else:
            raise ValueError(
                f"Unsupported gate: '{gate}'. "
                f"Supported gates: "
                f"{', '.join(sorted(SUPPORTED_SINGLE_QUBIT_GATES | SUPPORTED_TWO_QUBIT_GATES))}"
            )

    if add_measurements:
        circuit.measure(
            range(num_qubits),
            range(num_qubits),
        )

    return circuit


# ---------------------------------------------------------------------------
# Statevector fallback simulation
# ---------------------------------------------------------------------------


def _run_statevector_simulation(
    circuit: QuantumCircuit,
    shots: int,
) -> dict[str, Any]:
    """
    Real Qiskit statevector simulation used when the Aer native library is
    unavailable on the current machine (e.g. a missing controller DLL).

    This is NOT a fake result:

    1. The exact quantum state is computed by Qiskit's Statevector engine
       (the same mathematical source of truth Qiskit Aer uses).
    2. Measurement counts are sampled from the exact squared amplitudes
       using a deterministic-seed Monte Carlo sampler.

    The response clearly identifies itself with:
        "backend": "qiskit_statevector"
        "measurement_mode": "sampled_from_statevector"
        "exact_probabilities": ...
    """

    import random

    from qiskit.quantum_info import Statevector

    random.seed(42)

    num_qubits = circuit.num_qubits

    # Remove closing measurement operations so the pure state can be computed.
    try:
        clean_circuit = circuit.remove_final_measurements(
            inplace=False
        )
    except Exception:
        clean_circuit = circuit.copy()

    statevector = Statevector.from_instruction(
        clean_circuit
    )

    amplitudes = [complex(v) for v in statevector.data]

    states = []
    weights = []
    exact_probabilities: dict[str, float] = {}

    for index, amplitude in enumerate(amplitudes):
        probability = abs(amplitude) ** 2

        if probability <= 1e-12:
            continue

        binary_state = format(
            index,
            f"0{num_qubits}b",
        )

        states.append(binary_state)
        weights.append(probability)
        exact_probabilities[binary_state] = round(
            probability,
            10,
        )

    # Normalize weights (numerical safety).
    total_weight = sum(weights)

    if not states or total_weight <= 0:
        states = ["0" * num_qubits]
        weights = [1.0]
        exact_probabilities = {states[0]: 1.0}

    weights = [w / total_weight for w in weights]

    sampled = random.choices(
        population=states,
        weights=weights,
        k=shots,
    )

    from collections import Counter

    counts = {
        state: int(count)
        for state, count in Counter(sampled).items()
    }

    probabilities = {
        state: round(count / shots, 6)
        for state, count in counts.items()
    }

    most_frequent_state = max(
        counts,
        key=counts.get,
    ) if counts else None

    return {
        "success": True,
        "backend": "qiskit_statevector",
        "measurement_mode": "sampled_from_statevector",
        "shots": shots,
        "counts": counts,
        "probabilities": probabilities,
        "exact_probabilities": exact_probabilities,
        "most_frequent_state": most_frequent_state,
        "statevector": statevector,
    }


# ---------------------------------------------------------------------------
# Main simulation
# ---------------------------------------------------------------------------

def simulate_circuit(
    num_qubits: int,
    gates: list[dict],
    shots: int = 1024,
    algorithm: str | None = None,
    backend: str = "qiskit_aer",
) -> dict[str, Any]:
    """
    Build and execute a quantum circuit.

    IMPORTANT:
    Qiskit/Quantum Engine remains the source of truth.

    The returned object contains enough factual information for the
    Circuit AI to explain the actual circuit and actual simulation
    result instead of generating a generic explanation.
    """

    if num_qubits < 1:
        raise ValueError(
            "Circuit must contain at least 1 qubit."
        )

    if num_qubits > 20:
        raise ValueError(
            "Circuit size limited to 20 qubits "
            "for interactive simulation."
        )

    if shots < 1 or shots > 100000:
        raise ValueError(
            "Shots must be between 1 and 100,000."
        )

    if not isinstance(gates, list):
        raise ValueError(
            "Gates must be provided as a list."
        )

    # ---------------------------------------------------------------
    # Build and validate circuit
    # ---------------------------------------------------------------

    circuit = build_circuit(
        num_qubits=num_qubits,
        gates=gates,
        add_measurements=False,
    )

    circuit_metadata = describe_circuit(
        num_qubits=num_qubits,
        gates=gates,
    )

    # ---------------------------------------------------------------
    # Execute actual simulation
    # ---------------------------------------------------------------

    sim_backend = get_backend(backend)

    # -------------------------------------------------------------------
    # Execute the real simulation.
    #
    # If the configured backend (normally Qiskit Aer) cannot run on this
    # machine — for example its native controller DLL is missing — the
    # exact Qiskit Statevector is computed and measurements are sampled
    # from the real squared amplitudes. The result is clearly labelled
    # with "backend": "qiskit_statevector".
    # -------------------------------------------------------------------
    try:
        result = sim_backend.run_circuit(
            circuit,
            shots=shots,
        )
    except Exception:
        result = _run_statevector_simulation(
            circuit,
            shots=shots,
        )
        backend = "qiskit_statevector"

    if not isinstance(result, dict):
        raise ValueError(
            "Quantum simulation backend returned "
            "an invalid response."
        )

    # ---------------------------------------------------------------
    # Normalize measurement result
    # ---------------------------------------------------------------

    counts = _get_counts_from_result(result)

    probabilities = _normalize_probability_distribution(
        counts,
        shots,
    )

    most_frequent_state = _get_most_frequent_state(
        counts
    )

    # ---------------------------------------------------------------
    # Try to extract statevector
    # ---------------------------------------------------------------

    raw_statevector = result.get(
        "statevector"
    )

    statevector_info = None

    if raw_statevector is not None:
        statevector_info = _extract_statevector_information(
            raw_statevector,
            num_qubits,
        )

    # Some backends may already provide statevector
    # information as a dictionary.
    if isinstance(raw_statevector, dict):
        statevector_info = raw_statevector

    # ---------------------------------------------------------------
    # Circuit structural information
    # ---------------------------------------------------------------

    circuit_depth = None

    try:
        circuit_depth = int(
            circuit.depth()
        )
    except Exception:
        circuit_depth = None

    operation_count = None

    try:
        operation_count = len(
            circuit.data
        )
    except Exception:
        operation_count = len(gates)

    # ---------------------------------------------------------------
    # Prepare AI-grounded context
    # ---------------------------------------------------------------

    ai_context = {
        "num_qubits": num_qubits,
        "shots": shots,
        "algorithm": algorithm,
        "gate_sequence": circuit_metadata[
            "gate_sequence"
        ],
        "gate_counts": circuit_metadata[
            "gate_counts"
        ],
        "num_gates": circuit_metadata[
            "num_gates"
        ],
        "circuit_depth": circuit_depth,
        "operation_count": operation_count,
        "counts": counts,
        "probabilities": probabilities,
        "most_frequent_state": most_frequent_state,
    }

    if statevector_info is not None:
        ai_context["statevector"] = statevector_info

    # ---------------------------------------------------------------
    # Final normalized response
    # ---------------------------------------------------------------

    normalized_result: dict[str, Any] = {
        # Core simulation result
        "counts": counts,
        "probabilities": probabilities,
        "shots": shots,
        "most_frequent_state": most_frequent_state,

        # Circuit information
        "num_qubits": num_qubits,
        "num_gates": circuit_metadata["num_gates"],
        "gate_counts": circuit_metadata["gate_counts"],
        "gate_sequence": circuit_metadata["gate_sequence"],
        "circuit_depth": circuit_depth,
        "operation_count": operation_count,

        # Optional metadata
        "algorithm": algorithm,
        "backend": backend,

        # Statevector data
        "statevector": statevector_info,

        # Explicit AI grounding payload
        "ai_context": ai_context,
    }

    # Preserve any additional backend metadata that may already exist.
    for key, value in result.items():
        if key not in normalized_result:
            normalized_result[key] = value

    return normalized_result


# ---------------------------------------------------------------------------
# Algorithm demonstrations
# ---------------------------------------------------------------------------

def simulate_bell_state(
    shots: int = 1024,
) -> dict[str, Any]:
    """
    Simulate canonical Bell State |Φ+>.

    |Φ+> = (|00> + |11>) / sqrt(2)
    """

    gates = [
        {
            "gate": "h",
            "qubit": 0,
        },
        {
            "gate": "cx",
            "control": 0,
            "target": 1,
        },
    ]

    return simulate_circuit(
        num_qubits=2,
        gates=gates,
        shots=shots,
        algorithm="Bell State (|Φ⁺⟩)",
    )


def simulate_superposition(
    shots: int = 1024,
) -> dict[str, Any]:
    """
    Simulate single-qubit equal superposition |+>.

    |+> = (|0> + |1>) / sqrt(2)
    """

    gates = [
        {
            "gate": "h",
            "qubit": 0,
        },
    ]

    return simulate_circuit(
        num_qubits=1,
        gates=gates,
        shots=shots,
        algorithm="Superposition (|+⟩)",
    )


def simulate_grover(
    target: str = "11",
    shots: int = 1024,
) -> dict[str, Any]:
    """Simulate 2-qubit Grover Search for target string."""

    from quantum_engine.algorithms.grover import run_grover

    return run_grover(
        target=target,
        shots=shots,
    )


def simulate_teleportation(
    shots: int = 1024,
) -> dict[str, Any]:
    """Simulate quantum teleportation protocol."""

    from quantum_engine.algorithms.teleportation import run_teleportation

    return run_teleportation(
        shots=shots,
    )