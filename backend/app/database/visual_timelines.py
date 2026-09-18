"""
Default visual timelines for QuantumLearn prototype lectures.

Each lecture in the seed database gets a set of timestamped segments that
drive the "Interactive Visual Lecture" player:

    WATCH (YouTube) → SEE (visualization) → UNDERSTAND (explanation)
    → INTERACT (simulation) → PRACTICE (question)

Timestamps are manually curated here for the first implementation. The
AI-assisted pipeline (section 9) can later write the same structure through
POST /api/lectures/{id}/timeline without any schema change.
"""

from typing import Any


def _seg(
    start: int,
    end: int,
    concept: str,
    visualization: str,
    title: str,
    explanation: str,
    simulation: dict[str, Any] | None = None,
    code: dict[str, Any] | None = None,
    question: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Build a single segment dictionary."""
    return {
        "start": start,
        "end": end,
        "concept": concept,
        "visualization": visualization,
        "title": title,
        "explanation": explanation,
        "simulation": simulation,
        "code": code,
        "question": question,
    }


# ---------------------------------------------------------------------------
# Reusable simulation presets / code snippets / questions
# ---------------------------------------------------------------------------

SINGLE_QUBIT_CODE = {
    "language": "python",
    "lines": [
        "from qiskit import QuantumCircuit",
        "qc = QuantumCircuit(1)",
        "# Apply gates to q0 ...",
        "qc.measure_all()",
    ],
    "highlights": {},
}

SUPERPOSITION_SIM = {
    "num_qubits": 1,
    "gates": [{"gate": "h", "qubit": 0}],
    "shots": 1024,
    "algorithm": "Superposition (|+⟩)",
}

SUPERPOSITION_CODE = {
    "language": "python",
    "lines": [
        "from qiskit import QuantumCircuit",
        "qc = QuantumCircuit(1)",
        "qc.h(0)          # Hadamard on q0",
        "qc.measure_all()",
    ],
    "highlights": {2: ["superposition", "hadamard"]},
}

HADAMARD_SIM = {
    "num_qubits": 1,
    "gates": [{"gate": "h", "qubit": 0}],
    "shots": 1024,
    "algorithm": "Hadamard (|+⟩)",
}

BELL_SIM = {
    "num_qubits": 2,
    "gates": [
        {"gate": "h", "qubit": 0},
        {"gate": "cx", "control": 0, "target": 1},
    ],
    "shots": 1024,
    "algorithm": "Bell State (|Φ⁺⟩)",
}

BELL_CODE = {
    "language": "python",
    "lines": [
        "from qiskit import QuantumCircuit",
        "qc = QuantumCircuit(2)",
        "qc.h(0)          # Superposition on q0",
        "qc.cx(0, 1)      # Entangle q1 with q0",
        "qc.measure_all()",
    ],
    "highlights": {2: ["hadamard", "superposition"], 3: ["cnot", "entanglement"]},
}

MEASUREMENT_SIM = {
    "num_qubits": 1,
    "gates": [{"gate": "h", "qubit": 0}],
    "shots": 1000,
    "algorithm": "Measurement of |+⟩",
}

MEASUREMENT_CODE = {
    "language": "python",
    "lines": [
        "from qiskit import QuantumCircuit",
        "qc = QuantumCircuit(1)",
        "qc.h(0)          # Prepare superposition",
        "qc.measure(0, 0) # Collapse to 0 or 1",
    ],
    "highlights": {3: ["measurement", "collapse"]},
}

QUESTION_SUPERPOSITION = {
    "prompt": "After applying H to |0⟩ and measuring, what do you expect?",
    "options": ["Always |0⟩", "Always |1⟩", "Roughly 50% |0⟩ and 50% |1⟩", "Entangled states"],
    "answer_index": 2,
    "explanation": "H|0⟩ = (|0⟩ + |1⟩)/√2. Each measurement collapses to |0⟩ or |1⟩ with ~50% probability.",
}

QUESTION_MEASUREMENT = {
    "prompt": "What happens to a superposition when you measure it?",
    "options": [
        "It stays unchanged",
        "It collapses to one basis state",
        "It doubles in amplitude",
        "It disappears completely",
    ],
    "answer_index": 1,
    "explanation": "Measurement collapses the state to a single basis outcome |0⟩ or |1⟩ with probability equal to the squared amplitude.",
}

QUESTION_ENTANGLEMENT = {
    "prompt": "After the Bell state circuit (H + CNOT), the two qubits are...",
    "options": ["Independent", "Always opposite", "Perfectly correlated", "Classically copied"],
    "answer_index": 2,
    "explanation": "The circuit creates |Φ⁺⟩ = (|00⟩ + |11⟩)/√2: measuring one qubit instantly tells you the other — a non-local correlation.",
}


# ---------------------------------------------------------------------------
# Per-lecture segment templates (keyed by lecture order_no)
# ---------------------------------------------------------------------------

VISUAL_SEGMENT_TEMPLATES: dict[int, list[dict[str, Any]]] = {
    # ----------------------------------------------------------------
    # Lecture 1 — Introduction to Quantum Computing (~12:45)
    # ----------------------------------------------------------------
    1: [
        _seg(
            0, 75, "qubit", "qubit",
            "What is a Qubit?",
            "A qubit is the fundamental unit of quantum information. Unlike a "
            "classical bit (0 or 1), a qubit lives in a 2D quantum state space "
            "spanned by |0⟩ and |1⟩. Before measurement, it can be any "
            "combination of both.",
            simulation={"num_qubits": 1, "gates": [], "shots": 1024, "algorithm": "Qubit |0⟩"},
            code=SINGLE_QUBIT_CODE,
            question={
                "prompt": "How many basis states describe a single qubit?",
                "options": ["One", "Two (|0⟩ and |1⟩)", "Four", "Sixteen"],
                "answer_index": 1,
                "explanation": "A qubit has two computational basis states, |0⟩ and |1⟩. Superpositions combine them.",
            },
        ),
        _seg(
            75, 165, "superposition", "superposition",
            "Superposition",
            "A qubit can exist in a superposition |ψ⟩ = α|0⟩ + β|1⟩ where α and β "
            "are complex amplitudes. The probability of measuring |0⟩ is |α|² and "
            "of measuring |1⟩ is |β|², with |α|² + |β|² = 1.",
            simulation=SUPERPOSITION_SIM,
            code=SUPERPOSITION_CODE,
            question=QUESTION_SUPERPOSITION,
        ),
        _seg(
            165, 255, "hadamard", "hadamard",
            "The Hadamard Gate",
            "The Hadamard gate H maps |0⟩ → (|0⟩ + |1⟩)/√2, placing the qubit in "
            "an equal superposition. Applying H twice returns the qubit to its "
            "original state — H is its own inverse.",
            simulation=HADAMARD_SIM,
            code=SUPERPOSITION_CODE,
            question={
                "prompt": "What state does H create from |0⟩?",
                "options": ["|1⟩", "An equal superposition of |0⟩ and |1⟩", "An entangled pair", "A classical bit"],
                "answer_index": 1,
                "explanation": "H|0⟩ = (|0⟩ + |1⟩)/√2 — equal amplitudes, so both outcomes are equally likely.",
            },
        ),
        _seg(
            255, 345, "measurement", "measurement",
            "Measurement",
            "Measurement collapses a superposition into a single basis outcome. "
            "The outcome is probabilistic: for |ψ⟩ = α|0⟩ + β|1⟩, |0⟩ appears "
            "with probability |α|² and |1⟩ with probability |β|².",
            simulation=MEASUREMENT_SIM,
            code=MEASUREMENT_CODE,
            question=QUESTION_MEASUREMENT,
        ),
        _seg(
            345, 450, "probability", "probability",
            "Probability",
            "Quantum probabilities come from squared amplitudes. Running the "
            "same circuit many times builds a histogram that approximates the "
            "true probability distribution — real shots, real statistics.",
            simulation=SUPERPOSITION_SIM,
            code=SUPERPOSITION_CODE,
            question=QUESTION_SUPERPOSITION,
        ),
        _seg(
            450, 530, "circuit", "circuit",
            "Circuits & Gates",
            "Quantum programs are circuits: wires for qubits, boxes for gates. "
            "Every gate is a reversible unitary operation. Compose them to build "
            "algorithms like the Bell state.",
            simulation=BELL_SIM,
            code=BELL_CODE,
            question=QUESTION_ENTANGLEMENT,
        ),
        _seg(
            530, 600, "measurement", "histogram",
            "Seeing the Statistics",
            "After many runs, the histogram reveals the underlying probabilities. "
            "QuantumLearn runs the real circuit on Qiskit Aer so the bars are "
            "generated from actual measurement results — never fabricated.",
            simulation=MEASUREMENT_SIM,
            code=MEASUREMENT_CODE,
            question=QUESTION_MEASUREMENT,
        ),
        _seg(
            600, 765, "recap", "explanation",
            "Recap & Next Steps",
            "Qubits → superposition → gates → measurement → probability. That "
            "loop is the backbone of every quantum algorithm. Continue to "
            "Quantum States to explore statevectors and the Bloch sphere.",
            simulation=SUPERPOSITION_SIM,
            code=SUPERPOSITION_CODE,
            question=QUESTION_SUPERPOSITION,
        ),
    ],

    # ----------------------------------------------------------------
    # Lecture 2 — Quantum States (~15:20)
    # ----------------------------------------------------------------
    2: [
        _seg(
            0, 90, "qubit", "qubit",
            "The Qubit Revisited",
            "A quantum state is a vector of complex amplitudes. For one qubit the "
            "state |ψ⟩ = α|0⟩ + β|1⟩ is fully described by two amplitudes.",
            simulation={"num_qubits": 1, "gates": [], "shots": 1024, "algorithm": "State |0⟩"},
            code=SINGLE_QUBIT_CODE,
            question={
                "prompt": "The amplitudes α and β are...",
                "options": ["Real numbers between 0 and 1", "Complex numbers", "Whole numbers", "Always equal"],
                "answer_index": 1,
                "explanation": "Amplitudes are complex numbers; their squared magnitudes give probabilities.",
            },
        ),
        _seg(
            90, 200, "statevector", "qubit",
            "Statevectors & Amplitudes",
            "The statevector lists every amplitude, one per basis state. "
            "QuantumLearn reads the real statevector from the simulator so you "
            "always see the true mathematical state.",
            simulation=SUPERPOSITION_SIM,
            code=SINGLE_QUBIT_CODE,
            question=QUESTION_SUPERPOSITION,
        ),
        _seg(
            200, 330, "bloch", "bloch",
            "The Bloch Sphere",
            "Any single-qubit state maps to a point on the Bloch sphere. |0⟩ is "
            "the north pole, |1⟩ the south pole, and superposition states live on "
            "the equator. The point shown here is computed from the real "
            "statevector.",
            simulation=SUPERPOSITION_SIM,
            code=SUPERPOSITION_CODE,
            question={
                "prompt": "Where does the equal superposition |+⟩ sit on the Bloch sphere?",
                "options": ["North pole", "South pole", "Equator", "Center"],
                "answer_index": 2,
                "explanation": "|+⟩ = (|0⟩ + |1⟩)/√2 is on the +x equator, halfway between |0⟩ and |1⟩.",
            },
        ),
        _seg(
            330, 470, "superposition", "superposition",
            "Superposition Again",
            "Changing α and β changes the probabilities and the point on the "
            "Bloch sphere. Everything is connected: amplitudes → probabilities → "
            "geometry.",
            simulation=SUPERPOSITION_SIM,
            code=SUPERPOSITION_CODE,
            question=QUESTION_SUPERPOSITION,
        ),
        _seg(
            470, 600, "measurement", "measurement",
            "Measuring a State",
            "Measurement destroys the superposition. The distribution you get is "
            "exactly what the statevector predicted.",
            simulation=MEASUREMENT_SIM,
            code=MEASUREMENT_CODE,
            question=QUESTION_MEASUREMENT,
        ),
        _seg(
            600, 690, "probability", "histogram",
            "From State to Statistics",
            "Run 1000 shots and the histogram converges to the predicted "
            "probabilities. Compare theory with real measurement data.",
            simulation=SUPERPOSITION_SIM,
            code=SUPERPOSITION_CODE,
            question=QUESTION_SUPERPOSITION,
        ),
        _seg(
            690, 920, "entanglement", "explanation",
            "Preview: Multiple Qubits",
            "With two qubits the statevector has four amplitudes. Correlations "
            "between qubits — entanglement — become possible, which we explore in "
            "later lectures.",
            simulation=BELL_SIM,
            code=BELL_CODE,
            question=QUESTION_ENTANGLEMENT,
        ),
    ],

    # ----------------------------------------------------------------
    # Lecture 3 — Quantum Gates (~14:10)
    # ----------------------------------------------------------------
    3: [
        _seg(
            0, 70, "gates", "circuit",
            "What is a Gate?",
            "Gates are reversible transformations applied to qubits. Every gate "
            "is unitary: information is preserved, never erased.",
            simulation={"num_qubits": 1, "gates": [], "shots": 1024, "algorithm": "Identity"},
            code=SINGLE_QUBIT_CODE,
            question={
                "prompt": "Why must quantum gates be reversible?",
                "options": [
                    "To save energy",
                    "Quantum evolution is unitary and information is conserved",
                    "Classical computers require it",
                    "They do not need to be",
                ],
                "answer_index": 1,
                "explanation": "Closed quantum systems evolve by unitary operators, which are always invertible.",
            },
        ),
        _seg(
            70, 180, "hadamard", "hadamard",
            "Hadamard H",
            "H creates superposition: H|0⟩ = |+⟩ = (|0⟩ + |1⟩)/√2 and H|1⟩ = |−⟩. "
            "It is the single most important gate for creating quantum "
            "parallelism.",
            simulation=HADAMARD_SIM,
            code=SUPERPOSITION_CODE,
            question={
                "prompt": "What is H applied twice to |0⟩?",
                "options": ["|+⟩", "|−⟩", "|0⟩", "|1⟩"],
                "answer_index": 2,
                "explanation": "H² = I, so two Hadamards return the qubit to |0⟩.",
            },
        ),
        _seg(
            180, 300, "pauli-x", "gate",
            "Pauli-X (NOT)",
            "X flips the qubit: X|0⟩ = |1⟩ and X|1⟩ = |0⟩. It is the quantum "
            "analogue of the classical NOT gate.",
            simulation={"num_qubits": 1, "gates": [{"gate": "x", "qubit": 0}], "shots": 1024, "algorithm": "Pauli-X"},
            code={
                "language": "python",
                "lines": [
                    "from qiskit import QuantumCircuit",
                    "qc = QuantumCircuit(1)",
                    "qc.x(0)   # Bit flip",
                    "qc.measure_all()",
                ],
                "highlights": {2: ["pauli-x"]},
            },
            question={
                "prompt": "X applied to |0⟩ produces...",
                "options": ["|0⟩", "|1⟩", "Superposition", "Undefined"],
                "answer_index": 1,
                "explanation": "X is the quantum NOT gate: it exchanges |0⟩ and |1⟩.",
            },
        ),
        _seg(
            300, 400, "pauli-yz", "gate",
            "Pauli-Y and Pauli-Z",
            "Y rotates around the Bloch-sphere y-axis and Z flips the phase of "
            "|1⟩. Phase gates change interference without changing measurement "
            "probabilities.",
            simulation={"num_qubits": 1, "gates": [{"gate": "z", "qubit": 0}], "shots": 1024, "algorithm": "Pauli-Z"},
            code={
                "language": "python",
                "lines": [
                    "from qiskit import QuantumCircuit",
                    "qc = QuantumCircuit(1)",
                    "qc.z(0)   # Phase flip on |1⟩",
                    "qc.measure_all()",
                ],
                "highlights": {2: ["pauli-yz"]},
            },
            question={
                "prompt": "The Z gate changes the...",
                "options": ["Measurement probabilities", "Phase of the state", "Number of qubits", "Speed of the circuit"],
                "answer_index": 1,
                "explanation": "Z flips the phase of |1⟩ (|1⟩ → −|1⟩), which matters for interference but not for probabilities.",
            },
        ),
        _seg(
            400, 540, "cnot", "entanglement",
            "CNOT (Controlled-NOT)",
            "CNOT applies X to the target when the control is |1⟩. When the "
            "control is in superposition, CNOT creates entanglement — the "
            "cornerstone of quantum communication and computing.",
            simulation=BELL_SIM,
            code={
                "language": "python",
                "lines": [
                    "from qiskit import QuantumCircuit",
                    "qc = QuantumCircuit(2)",
                    "qc.h(0)          # control in superposition",
                    "qc.cx(0, 1)      # entangle target",
                    "qc.measure_all()",
                ],
                "highlights": {2: ["hadamard"], 3: ["cnot", "entanglement"]},
            },
            question=QUESTION_ENTANGLEMENT,
        ),
        _seg(
            540, 700, "circuit", "circuit",
            "Building Circuits",
            "Combine single-qubit and two-qubit gates to build real algorithms. "
            "The circuit visualizer animates each gate as the video explains it.",
            simulation=BELL_SIM,
            code=BELL_CODE,
            question=QUESTION_ENTANGLEMENT,
        ),
        _seg(
            700, 850, "measurement", "histogram",
            "Measuring Gate Output",
            "Every circuit ends with measurement. The histogram below comes from "
            "an actual simulation run — try the Bell state with 1000 shots.",
            simulation=MEASUREMENT_SIM,
            code=MEASUREMENT_CODE,
            question=QUESTION_MEASUREMENT,
        ),
    ],

    # ----------------------------------------------------------------
    # Lecture 4 — Quantum Measurement (~16:05)
    # ----------------------------------------------------------------
    4: [
        _seg(
            0, 100, "superposition", "superposition",
            "Preparing a Superposition",
            "Measurement is only interesting after a superposition. H creates one; "
            "now we ask what happens when we look.",
            simulation=SUPERPOSITION_SIM,
            code=SUPERPOSITION_CODE,
            question=QUESTION_SUPERPOSITION,
        ),
        _seg(
            100, 220, "measurement", "measurement",
            "The Measurement Postulate",
            "Measurement projects the state onto a basis. Each outcome occurs "
            "with probability equal to the squared amplitude of that basis state.",
            simulation=MEASUREMENT_SIM,
            code=MEASUREMENT_CODE,
            question=QUESTION_MEASUREMENT,
        ),
        _seg(
            220, 330, "collapse", "collapse",
            "State Collapse",
            "The superposition collapses in a single shot: you see |0⟩ or |1⟩, "
            "never both. Repeating the experiment many times reveals the "
            "underlying probabilities.",
            simulation=MEASUREMENT_SIM,
            code=MEASUREMENT_CODE,
            question=QUESTION_MEASUREMENT,
        ),
        _seg(
            330, 470, "probability", "histogram",
            "The Histogram",
            "With 1000 shots, the bars converge toward 50/50. The histogram is "
            "built from real Qiskit Aer counts — no fake data.",
            simulation=MEASUREMENT_SIM,
            code=MEASUREMENT_CODE,
            question=QUESTION_SUPERPOSITION,
        ),
        _seg(
            470, 600, "probability", "probability",
            "Probability from Amplitudes",
            "P(|0⟩) = |α|², P(|1⟩) = |β|². Amplitudes are the 'square root of "
            "probability' — the reason quantum computers need interference, not "
            "just randomness.",
            simulation=SUPERPOSITION_SIM,
            code=SUPERPOSITION_CODE,
            question=QUESTION_MEASUREMENT,
        ),
        _seg(
            600, 690, "wave", "wave",
            "Measurement & Interference",
            "Before measurement, amplitudes can interfere like waves — adding "
            "constructively or destructively. Measurement freezes the wave into "
            "one outcome.",
            simulation=SUPERPOSITION_SIM,
            code=SUPERPOSITION_CODE,
            question=QUESTION_SUPERPOSITION,
        ),
        _seg(
            690, 790, "bell", "entanglement",
            "Measuring Entangled Qubits",
            "Measure one qubit of a Bell pair and you instantly know the other. "
            "The correlation is perfect — and generated from the real circuit.",
            simulation=BELL_SIM,
            code=BELL_CODE,
            question=QUESTION_ENTANGLEMENT,
        ),
        _seg(
            790, 965, "measurement", "histogram",
            "Full Distribution",
            "All four outcomes of the Bell circuit appear with the correct "
            "statistics: ~50% |00⟩ and ~50% |11⟩, exactly as the statevector "
            "predicts.",
            simulation=BELL_SIM,
            code=BELL_CODE,
            question=QUESTION_ENTANGLEMENT,
        ),
    ],

    # ----------------------------------------------------------------
    # Lecture 5 — Quantum Entanglement (~18:30)
    # ----------------------------------------------------------------
    5: [
        _seg(
            0, 110, "bell", "entanglement",
            "The Bell State",
            "The simplest entangled state: |Φ⁺⟩ = (|00⟩ + |11⟩)/√2. Build it with "
            "H then CNOT and watch the correlations appear.",
            simulation=BELL_SIM,
            code=BELL_CODE,
            question=QUESTION_ENTANGLEMENT,
        ),
        _seg(
            110, 250, "entanglement", "entanglement",
            "What is Entanglement?",
            "Two qubits are entangled when their joint state cannot be written as "
            "separate single-qubit states. Measuring one instantly determines the "
            "other, regardless of distance.",
            simulation=BELL_SIM,
            code=BELL_CODE,
            question=QUESTION_ENTANGLEMENT,
        ),
        _seg(
            250, 380, "cnot", "entanglement",
            "Creating Entanglement with CNOT",
            "CNOT on a superposition control creates the correlation. Watch q0 "
            "and q1 become perfectly matched in the animation.",
            simulation=BELL_SIM,
            code={
                "language": "python",
                "lines": [
                    "from qiskit import QuantumCircuit",
                    "qc = QuantumCircuit(2)",
                    "qc.h(0)      # superposition on control",
                    "qc.cx(0, 1)  # correlate the target",
                    "qc.measure_all()",
                ],
                "highlights": {2: ["hadamard"], 3: ["cnot", "entanglement"]},
            },
            question=QUESTION_ENTANGLEMENT,
        ),
        _seg(
            380, 500, "bell", "circuit",
            "The Entangling Circuit",
            "A visual circuit walk-through: H on q0, CNOT control q0 → target q1, "
            "then measure both. Every step is animated from real data.",
            simulation=BELL_SIM,
            code=BELL_CODE,
            question=QUESTION_ENTANGLEMENT,
        ),
        _seg(
            500, 660, "measurement", "histogram",
            "Entanglement in the Histogram",
            "The measurement histogram shows only |00⟩ and |11⟩. This is the "
            "fingerprint of the Bell state — a real simulation result.",
            simulation=BELL_SIM,
            code=BELL_CODE,
            question=QUESTION_ENTANGLEMENT,
        ),
        _seg(
            660, 790, "probability", "probability",
            "Correlated Probabilities",
            "P(00) ≈ P(11) ≈ 50%, P(01) = P(10) = 0. The joint probability "
            "cannot be explained by independent single-qubit distributions — "
            "that's entanglement.",
            simulation=BELL_SIM,
            code=BELL_CODE,
            question=QUESTION_ENTANGLEMENT,
        ),
        _seg(
            790, 900, "teleportation", "explanation",
            "Application: Teleportation",
            "Entanglement plus classical communication lets us transfer a quantum "
            "state to a distant qubit. QuantumLearn's Algorithms explorer has a "
            "full teleportation simulation.",
            simulation=BELL_SIM,
            code={
                "language": "python",
                "lines": [
                    "from qiskit import QuantumCircuit",
                    "qc = QuantumCircuit(3)",
                    "# Entangle qubits 1 and 2, teleport q0 ...",
                    "qc.measure_all()",
                ],
                "highlights": {},
            },
            question=QUESTION_ENTANGLEMENT,
        ),
        _seg(
            900, 1110, "recap", "explanation",
            "Entanglement Recap",
            "Superposition gives quantum parallelism; entanglement gives "
            "correlations no classical system can produce. Together they power "
            "teleportation, QKD, and algorithms like Grover's search.",
            simulation=BELL_SIM,
            code=BELL_CODE,
            question=QUESTION_ENTANGLEMENT,
        ),
    ],
}
def build_default_timeline(
    order_no: int,
    duration_seconds: int | None = None,
) -> list[dict[str, Any]]:
    """
    Return the curated segments for a prototype lecture.

    Used by GET /api/lectures/{id}/timeline as a fallback when no segments
    have been stored in the database yet, so the feature always works.
    """
    segments = VISUAL_SEGMENT_TEMPLATES.get(order_no, [])

    if not segments:
        # Generic fallback so every lecture still gets a functional timeline.
        segments = [
            _seg(
                0, 90, "qubit", "qubit",
                "What is a Qubit?",
                "A qubit is the fundamental unit of quantum information.",
                simulation={"num_qubits": 1, "gates": [], "shots": 1024},
            ),
            _seg(
                90, 180, "superposition", "superposition",
                "Superposition",
                "A qubit can be a combination of |0⟩ and |1⟩.",
                simulation=SUPERPOSITION_SIM,
            ),
            _seg(
                180, 270, "hadamard", "hadamard",
                "Hadamard Gate",
                "H creates an equal superposition.",
                simulation=HADAMARD_SIM,
            ),
            _seg(
                270, 360, "measurement", "measurement",
                "Measurement",
                "Measurement collapses the state.",
                simulation=MEASUREMENT_SIM,
            ),
            _seg(
                360, 450, "probability", "probability",
                "Probability",
                "Probabilities come from squared amplitudes.",
                simulation=SUPERPOSITION_SIM,
            ),
        ]

    if duration_seconds:
        # Clamp segment end times to the video length so navigation stays valid.
        for segment in segments:
            segment["end"] = min(segment["end"], duration_seconds)

    return segments
def _parse_duration(
    duration: str | None,
) -> int | None:
    """Convert a 'MM:SS' or 'H:MM:SS' duration string into seconds."""
    if not duration:
        return None

    try:
        parts = [int(part) for part in str(duration).strip().split(":")]
    except (TypeError, ValueError):
        return None

    seconds = 0
    for part in parts:
        seconds = seconds * 60 + part

    return seconds


def seed_lecture_segments(
    db,
    lectures,
) -> int:
    """
    Idempotently insert curated visual-timeline segments for lectures.

    Segments are only inserted for lectures that do not already have any
    stored segments, so existing content is never duplicated or overwritten.
    Returns the number of segments created.
    """
    from app.models.lecture_segment import LectureSegment

    created = 0

    for lecture in lectures:
        existing = (
            db.query(LectureSegment)
            .filter(LectureSegment.lecture_id == lecture.id)
            .count()
        )

        if existing:
            continue

        segments = build_default_timeline(
            lecture.order_no,
            _parse_duration(lecture.duration),
        )

        for index, segment in enumerate(segments):
            db.add(
                LectureSegment(
                    lecture_id=lecture.id,
                    start_seconds=int(segment["start"]),
                    end_seconds=int(segment["end"]),
                    concept=str(segment["concept"]),
                    visualization=str(segment["visualization"]),
                    title=str(segment["title"]),
                    explanation=str(segment.get("explanation", "")),
                    simulation=segment.get("simulation"),
                    code=segment.get("code"),
                    question=segment.get("question"),
                    order_no=index,
                )
            )
            created += 1

    return created