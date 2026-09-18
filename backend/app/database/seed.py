"""
Database seed data for QuantumLearn.
Includes authentic courses, prototype lectures, lecture-linked assessments,
coding challenges, and administrative users.
"""

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.database.visual_timelines import seed_lecture_segments
from app.models.assessment import Assessment
from app.models.challenge import CodingChallenge
from app.models.course import Course
from app.models.lectures import Lecture
from app.models.user import User


SAMPLE_COURSES = [
    {
        "title": "Qubits & Superposition",
        "description": "Learn what a qubit is and how superposition differs from classical bits.",
        "difficulty": "beginner",
        "category": "fundamentals",
    },
    {
        "title": "Quantum Gates",
        "description": "Explore single- and two-qubit gates: H, X, Y, Z, and CNOT.",
        "difficulty": "beginner",
        "category": "fundamentals",
    },
    {
        "title": "Measurement & Probability",
        "description": "Understand quantum measurement and probability.",
        "difficulty": "beginner",
        "category": "fundamentals",
    },
    {
        "title": "Entanglement & Bell State",
        "description": "Learn the basics of quantum entanglement and Bell states.",
        "difficulty": "intermediate",
        "category": "circuits",
    },
    {
        "title": "Quantum Circuits",
        "description": "Learn how quantum gates are combined to create circuits.",
        "difficulty": "intermediate",
        "category": "circuits",
    },
]


PROTOTYPE_LECTURES = [
    {
        "title": "Lecture 1",
        "description": (
            "An introduction to quantum computing and the basic ideas "
            "behind quantum information."
        ),
        "topic": "Introduction to Quantum Computing",
        "youtube_url": "https://www.youtube.com/watch?v=UwbLakrlxWQ",
        "thumbnail_url": (
            "https://img.youtube.com/vi/UwbLakrlxWQ/hqdefault.jpg"
        ),
        "duration": "12:45",
        "order_no": 1,
    },
    {
        "title": "Lecture 2",
        "description": (
            "Learn how quantum states represent information using "
            "qubits, statevectors, and Bloch sphere notation."
        ),
        "topic": "Quantum States",
        "youtube_url": "https://www.youtube.com/watch?v=Pg8HbXwFb5A",
        "thumbnail_url": (
            "https://img.youtube.com/vi/Pg8HbXwFb5A/hqdefault.jpg"
        ),
        "duration": "15:20",
        "order_no": 2,
    },
    {
        "title": "Lecture 3",
        "description": (
            "Understand the basic quantum gates used to manipulate "
            "qubits, including Pauli gates, Hadamard, and CNOT."
        ),
        "topic": "Quantum Gates",
        "youtube_url": "https://www.youtube.com/watch?v=PK5muZbmako",
        "thumbnail_url": (
            "https://img.youtube.com/vi/PK5muZbmako/hqdefault.jpg"
        ),
        "duration": "14:10",
        "order_no": 3,
    },
    {
        "title": "Lecture 4",
        "description": (
            "Learn how quantum measurement works and how measurement "
            "collapses superpositions into classical probabilities."
        ),
        "topic": "Quantum Measurement",
        "youtube_url": "https://www.youtube.com/watch?v=iI9OpuMyB1I",
        "thumbnail_url": (
            "https://img.youtube.com/vi/iI9OpuMyB1I/hqdefault.jpg"
        ),
        "duration": "16:05",
        "order_no": 4,
    },
    {
        "title": "Lecture 5",
        "description": (
            "Understand quantum entanglement, Bell states, and why "
            "non-local correlations enable quantum teleportation."
        ),
        "topic": "Quantum Entanglement",
        "youtube_url": "https://www.youtube.com/watch?v=zP5e62wTgwg",
        "thumbnail_url": (
            "https://img.youtube.com/vi/zP5e62wTgwg/hqdefault.jpg"
        ),
        "duration": "18:30",
        "order_no": 5,
    },
]


LECTURE_ASSESSMENTS = {
    1: [  # Lecture 1: Introduction to Quantum Computing
        {
            "title": "Fundamental Unit of Quantum Information",
            "question": "What is the primary fundamental unit of quantum information?",
            "options": ["Bit", "Qubit", "Byte", "Transistor"],
            "correct_answer": "Qubit",
            "concept": "Quantum Computing",
            "difficulty": "beginner",
            "explanation": "A quantum bit (qubit) is the basic unit of quantum information, capable of existing in superpositions of 0 and 1.",
            "order_no": 1,
        },
        {
            "title": "Superposition Principle",
            "question": "Which quantum mechanical principle allows a qubit to exist in a linear combination of states |0⟩ and |1⟩ simultaneously?",
            "options": ["Entanglement", "Superposition", "Decoherence", "Quantum Tunneling"],
            "correct_answer": "Superposition",
            "concept": "Superposition",
            "difficulty": "beginner",
            "explanation": "Superposition allows a quantum state to be described as a linear combination of basis vectors α|0⟩ + β|1⟩.",
            "order_no": 2,
        },
        {
            "title": "Quantum Parallelism Capacity",
            "question": "How many basis states can an n-qubit quantum register represent simultaneously in superposition?",
            "options": ["n states", "2n states", "2^n states", "n^2 states"],
            "correct_answer": "2^n states",
            "concept": "Qubit",
            "difficulty": "intermediate",
            "explanation": "An n-qubit system has a Hilbert space dimension of 2^n, allowing simultaneous linear combinations of all 2^n binary configurations.",
            "order_no": 3,
        },
        {
            "title": "Reversibility and Unitary Evolution",
            "question": "Why must all unmeasured quantum gate operations be mathematically unitary and reversible?",
            "options": ["To conserve total probability (|α|² + |β|² = 1)", "To increase circuit execution speed", "Because classical gates cannot be inverted", "To eliminate the need for error correction"],
            "correct_answer": "To conserve total probability (|α|² + |β|² = 1)",
            "concept": "Quantum Circuits",
            "difficulty": "intermediate",
            "explanation": "Unitary transformations preserve the norm of statevectors, ensuring that total measurement probability always sums to exactly 1.",
            "order_no": 4,
        },
        {
            "title": "Quantum Speedup Applications",
            "question": "For which of the following computational tasks is quantum computing theoretically proven to provide a quadratic speedup?",
            "options": ["Integer factorization", "Unstructured database search", "Matrix multiplication", "String sorting"],
            "correct_answer": "Unstructured database search",
            "concept": "Quantum Computing",
            "difficulty": "intermediate",
            "explanation": "Grover's algorithm searches an unsorted database of N items in O(√N) evaluations compared to O(N) classically, which is a quadratic speedup.",
            "order_no": 5,
        },
        {
            "title": "Quantum Interference Mechanism",
            "question": "How do quantum algorithms use interference to identify correct solutions to computational problems?",
            "options": ["By increasing thermal vibrations", "By constructively amplifying amplitudes of correct solutions while destructively cancelling incorrect ones", "By converting qubits directly into classical memory", "By measuring every qubit after every gate"],
            "correct_answer": "By constructively amplifying amplitudes of correct solutions while destructively cancelling incorrect ones",
            "concept": "Interference",
            "difficulty": "intermediate",
            "explanation": "Quantum algorithms design phase shifts so that undesirable computational paths cancel out destructively while desired outputs interfere constructively.",
            "order_no": 6,
        },
        {
            "title": "Quantum Circuit Diagram Reading",
            "question": "In a standard quantum circuit diagram, what does a horizontal wire line represent?",
            "options": ["An electrical power wire", "The timeline of a single qubit's quantum state progressing from left to right", "A classical bus", "A magnetic field conduit"],
            "correct_answer": "The timeline of a single qubit's quantum state progressing from left to right",
            "concept": "Quantum Circuits",
            "difficulty": "beginner",
            "explanation": "In quantum circuit notation, each horizontal line represents a single qubit, and gates applied along the line occur sequentially in time from left to right.",
            "order_no": 7,
        },
    ],
    2: [  # Lecture 2: Quantum States
        {
            "title": "Statevector Probability Amplitudes",
            "question": "In the statevector equation |ψ⟩ = α|0⟩ + β|1⟩, what do the mathematical coefficients α and β represent?",
            "options": ["Probabilities directly", "Complex probability amplitudes", "Physical temperatures", "Spin frequencies"],
            "correct_answer": "Complex probability amplitudes",
            "concept": "Qubit",
            "difficulty": "beginner",
            "explanation": "α and β are complex numbers whose squared magnitudes |α|² and |β|² yield the measurement probabilities in the computational basis.",
            "order_no": 1,
        },
        {
            "title": "State Normalization Requirement",
            "question": "If a qubit is prepared in the state |ψ⟩ = (1/√2)|0⟩ + c|1⟩, what must |c|² equal for the state to be validly normalized?",
            "options": ["1.0", "0.5", "0.25", "0.0"],
            "correct_answer": "0.5",
            "concept": "Superposition",
            "difficulty": "beginner",
            "explanation": "Normalization requires |α|² + |β|² = 1. Since (1/√2)² = 0.5, |c|² must be 1 - 0.5 = 0.5.",
            "order_no": 2,
        },
        {
            "title": "Bloch Sphere Poles",
            "question": "On the standard geometric Bloch Sphere, which statevector resides at the North Pole (+Z axis)?",
            "options": ["|0⟩", "|1⟩", "|+⟩", "|-⟩"],
            "correct_answer": "|0⟩",
            "concept": "Qubit",
            "difficulty": "beginner",
            "explanation": "The North Pole (Z = +1) represents the basis state |0⟩, while the South Pole (Z = -1) represents the basis state |1⟩.",
            "order_no": 3,
        },
        {
            "title": "Bloch Sphere Equator State",
            "question": "Which quantum statevector corresponds to the positive X-axis (+X) on the equator of the Bloch Sphere?",
            "options": ["|0⟩", "|1⟩", "|+⟩ = (|0⟩ + |1⟩)/√2", "|-⟩ = (|0⟩ - |1⟩)/√2"],
            "correct_answer": "|+⟩ = (|0⟩ + |1⟩)/√2",
            "concept": "Phase",
            "difficulty": "intermediate",
            "explanation": "The state |+⟩ = (|0⟩ + |1⟩)/√2 has coordinates (X=1, Y=0, Z=0) on the Bloch sphere, located on the equator along +X.",
            "order_no": 4,
        },
        {
            "title": "Global Phase vs Relative Phase",
            "question": "What is the physical difference between global phase and relative phase in quantum state representation?",
            "options": ["Global phase is physically unobservable, whereas relative phase creates observable interference", "Global phase can be measured directly with a single detector", "Relative phase has no effect on measurement probabilities", "Both are always equal to zero"],
            "correct_answer": "Global phase is physically unobservable, whereas relative phase creates observable interference",
            "concept": "Phase",
            "difficulty": "intermediate",
            "explanation": "An overall phase factor e^(iθ)|ψ⟩ cannot be observed in any measurement, but the relative phase between |0⟩ and |1⟩ (e.g., in |+⟩ vs |-⟩) drastically changes measurement outcomes.",
            "order_no": 5,
        },
        {
            "title": "Orthogonal Quantum States",
            "question": "Two pure quantum states |ψ₁⟩ and |ψ₂⟩ are orthogonal when their inner product ⟨ψ₁|ψ₂⟩ equals:",
            "options": ["1", "0", "0.5", "-1"],
            "correct_answer": "0",
            "concept": "Qubit",
            "difficulty": "intermediate",
            "explanation": "Orthogonal quantum states have an inner product of zero, meaning they are completely distinguishable in a single measurement.",
            "order_no": 6,
        },
        {
            "title": "Default Initialization State",
            "question": "In Qiskit and standard quantum computing architectures, what state are newly allocated qubits initialized to by default?",
            "options": ["|0⟩", "|1⟩", "|+⟩", "A completely random mixed state"],
            "correct_answer": "|0⟩",
            "concept": "Quantum Computing",
            "difficulty": "beginner",
            "explanation": "By convention, newly declared quantum registers start in the all-zero ground state |0...0⟩.",
            "order_no": 7,
        },
    ],
    3: [  # Lecture 3: Quantum Gates
        {
            "title": "Pauli-X Gate Operation",
            "question": "What is the result of applying a Pauli-X gate to the computational basis state |0⟩?",
            "options": ["X|0⟩ = |0⟩", "X|0⟩ = |1⟩", "X|0⟩ = (|0⟩+|1⟩)/√2", "X|0⟩ = -|0⟩"],
            "correct_answer": "X|0⟩ = |1⟩",
            "concept": "Quantum Gates",
            "difficulty": "beginner",
            "explanation": "The Pauli-X gate performs a bit-flip, mapping |0⟩ to |1⟩ and |1⟩ to |0⟩.",
            "order_no": 1,
        },
        {
            "title": "Hadamard Gate Transformation",
            "question": "What state is produced when a Hadamard (H) gate is applied to state |0⟩?",
            "options": ["|0⟩", "|1⟩", "|+⟩ = (|0⟩ + |1⟩)/√2", "|-⟩ = (|0⟩ - |1⟩)/√2"],
            "correct_answer": "|+⟩ = (|0⟩ + |1⟩)/√2",
            "concept": "Quantum Gates",
            "difficulty": "beginner",
            "explanation": "The Hadamard gate maps basis state |0⟩ to an equal superposition state |+⟩ = (|0⟩ + |1⟩)/√2.",
            "order_no": 2,
        },
        {
            "title": "Hadamard Self-Inverse Property",
            "question": "What is the effect of applying two consecutive Hadamard gates (H · H) to an arbitrary qubit state |ψ⟩?",
            "options": ["The qubit collapses into |0⟩", "The state remains unchanged because H · H = Identity", "The qubit rotates 90 degrees around Z", "The qubit becomes entangled with the next qubit"],
            "correct_answer": "The state remains unchanged because H · H = Identity",
            "concept": "Quantum Gates",
            "difficulty": "intermediate",
            "explanation": "Because the Hadamard gate is Hermitian and unitary, H = H⁻¹, meaning H² = I. Applying it twice returns the original state.",
            "order_no": 3,
        },
        {
            "title": "Pauli-Z Gate Phase Shift",
            "question": "How does the Pauli-Z gate transform the computational basis state |1⟩?",
            "options": ["Z|1⟩ = |0⟩", "Z|1⟩ = -|1⟩", "Z|1⟩ = i|1⟩", "Z|1⟩ = |1⟩"],
            "correct_answer": "Z|1⟩ = -|1⟩",
            "concept": "Quantum Gates",
            "difficulty": "beginner",
            "explanation": "The Pauli-Z gate leaves |0⟩ unchanged (Z|0⟩ = |0⟩) and introduces a phase flip of π on state |1⟩ (Z|1⟩ = -|1⟩).",
            "order_no": 4,
        },
        {
            "title": "CNOT Gate Functionality",
            "question": "In a Controlled-NOT (CNOT) gate with control qubit q0 and target qubit q1, when does the target qubit flip?",
            "options": ["Always", "Only when the control qubit q0 is in state |1⟩", "Only when the target qubit q1 is in state |1⟩", "Never"],
            "correct_answer": "Only when the control qubit q0 is in state |1⟩",
            "concept": "Quantum Gates",
            "difficulty": "beginner",
            "explanation": "The CNOT gate acts as a conditional bit-flip: if control is |1⟩, target is inverted; if control is |0⟩, target is unchanged.",
            "order_no": 5,
        },
        {
            "title": "Phase Gates S and T",
            "question": "What is the relationship between the S gate (phase π/2) and the T gate (phase π/4)?",
            "options": ["S = T²", "T = S²", "S and T are identical", "T = S†"],
            "correct_answer": "S = T²",
            "concept": "Quantum Gates",
            "difficulty": "intermediate",
            "explanation": "Applying two T gates produces a π/4 + π/4 = π/2 phase shift, which is exactly the S gate.",
            "order_no": 6,
        },
        {
            "title": "Circuit Sequence Interpretation",
            "question": "For a qubit initialized to |0⟩, applying gate sequence H then X yields which quantum state?",
            "options": ["(|1⟩ + |0⟩)/√2", "|1⟩", "|0⟩", "(|0⟩ - |1⟩)/√2"],
            "correct_answer": "(|1⟩ + |0⟩)/√2",
            "concept": "Quantum Circuits",
            "difficulty": "intermediate",
            "explanation": "H|0⟩ = (|0⟩ + |1⟩)/√2. Applying X flips each basis term: X|0⟩->|1⟩ and X|1⟩->|0⟩, giving (|1⟩ + |0⟩)/√2.",
            "order_no": 7,
        },
    ],
    4: [  # Lecture 4: Quantum Measurement
        {
            "title": "Born Rule Calculation",
            "question": "According to the Born rule, if a qubit is in state |ψ⟩ = (√3/2)|0⟩ + (1/2)|1⟩, what is the probability of measuring 0?",
            "options": ["75% (3/4)", "25% (1/4)", "86.6% (√3/2)", "50% (1/2)"],
            "correct_answer": "75% (3/4)",
            "concept": "Measurement",
            "difficulty": "intermediate",
            "explanation": "The probability of measuring |0⟩ is P(0) = |α|² = (√3/2)² = 3/4 = 0.75 (75%).",
            "order_no": 1,
        },
        {
            "title": "Wavefunction Collapse",
            "question": "What happens to the quantum state immediately after a projective computational measurement yields outcome '1'?",
            "options": ["The state remains in superposition", "The state collapses into the definite basis state |1⟩", "The state returns to |0⟩", "The qubit enters a thermal mixed state"],
            "correct_answer": "The state collapses into the definite basis state |1⟩",
            "concept": "Measurement",
            "difficulty": "beginner",
            "explanation": "Upon projective measurement, the quantum superposition collapses into the eigenstate corresponding to the observed outcome.",
            "order_no": 2,
        },
        {
            "title": "Repeatability of Projective Measurement",
            "question": "If a measurement collapses a qubit into |0⟩, what is the probability of obtaining outcome '0' in an immediate second measurement?",
            "options": ["100%", "50%", "0%", "Depends on the number of shots"],
            "correct_answer": "100%",
            "concept": "Measurement",
            "difficulty": "beginner",
            "explanation": "Since the state has already collapsed to |0⟩, repeating the measurement in the same basis gives outcome '0' with certainty.",
            "order_no": 3,
        },
        {
            "title": "No-Cloning Principle",
            "question": "Why is it impossible to make an exact copy of an unknown quantum state before measuring it?",
            "options": ["Because of the No-Cloning Theorem established by Wootters, Zurek, and Dieks", "Because classical storage is too small", "Because quantum computers lack copy commands", "Because photons cannot be absorbed"],
            "correct_answer": "Because of the No-Cloning Theorem established by Wootters, Zurek, and Dieks",
            "concept": "Measurement",
            "difficulty": "intermediate",
            "explanation": "The linearity of unitary quantum mechanics makes it mathematically impossible to build a universal cloner that duplicates an unknown arbitrary quantum state.",
            "order_no": 4,
        },
        {
            "title": "Measuring in the X-Basis",
            "question": "How can you measure a qubit in the X-basis (|+⟩/|-⟩) on a quantum processor whose detectors only measure in the Z-basis?",
            "options": ["Apply a Hadamard (H) gate immediately before measurement", "Apply a Pauli-X gate before measurement", "Apply a Pauli-Z gate before measurement", "It is physically impossible"],
            "correct_answer": "Apply a Hadamard (H) gate immediately before measurement",
            "concept": "Measurement",
            "difficulty": "intermediate",
            "explanation": "Applying H transforms the X-basis states into Z-basis states (H|+⟩ = |0⟩, H|-⟩ = |1⟩), allowing standard Z-measurement to read the X-basis.",
            "order_no": 5,
        },
        {
            "title": "Statistical Sampling and Shots",
            "question": "In quantum simulation and hardware execution, what does the parameter 'shots' (e.g., shots=1024) control?",
            "options": ["The number of qubits in the circuit", "The number of independent repetitions executed to build measurement frequency statistics", "The physical laser intensity", "The depth of the circuit"],
            "correct_answer": "The number of independent repetitions executed to build measurement frequency statistics",
            "concept": "Measurement",
            "difficulty": "beginner",
            "explanation": "Because quantum measurement is probabilistic, circuits are executed repeatedly across 'shots' to build statistical histograms of bitstring outcomes.",
            "order_no": 6,
        },
        {
            "title": "Mid-Circuit Measurements",
            "question": "In modern dynamic quantum circuits, what can mid-circuit measurement outcomes be used for?",
            "options": ["To conditionally trigger subsequent quantum gates based on classical feed-forward logic", "Only to prematurely terminate the program", "They have no effect on other qubits", "To double the qubit clock speed"],
            "correct_answer": "To conditionally trigger subsequent quantum gates based on classical feed-forward logic",
            "concept": "Quantum Circuits",
            "difficulty": "intermediate",
            "explanation": "Mid-circuit measurements allow classical feed-forward: subsequent quantum gates can be conditionally applied based on intermediate measurement results.",
            "order_no": 7,
        },
    ],
    5: [  # Lecture 5: Quantum Entanglement
        {
            "title": "Canonical Bell State Construction",
            "question": "Which two-gate circuit creates the maximally entangled Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 from initial state |00⟩?",
            "options": ["H on q0, followed by CNOT with control q0 and target q1", "X on q0, followed by X on q1", "H on q0, followed by H on q1", "CNOT with control q0 and target q1, followed by H on q0"],
            "correct_answer": "H on q0, followed by CNOT with control q0 and target q1",
            "concept": "Bell State",
            "difficulty": "beginner",
            "explanation": "H on q0 creates (|00⟩+|10⟩)/√2. Then CNOT(0, 1) flips target q1 whenever control q0 is 1, creating the Bell state (|00⟩+|11⟩)/√2.",
            "order_no": 1,
        },
        {
            "title": "Entangled Measurement Correlation",
            "question": "If two qubits share the Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 and Alice measures qubit 0 and gets '1', what is Bob's outcome for qubit 1?",
            "options": ["1 with 100% certainty", "0 with 100% certainty", "0 or 1 with 50% probability each", "Undefined until Bob measures along X"],
            "correct_answer": "1 with 100% certainty",
            "concept": "Entanglement",
            "difficulty": "beginner",
            "explanation": "The Bell state |Φ⁺⟩ only contains components |00⟩ and |11⟩. Measuring '1' on the first qubit collapses the joint state to |11⟩, ensuring the second qubit is also 1.",
            "order_no": 2,
        },
        {
            "title": "Definition of Entanglement",
            "question": "Mathematically, when is a multi-qubit quantum state defined as entangled?",
            "options": ["When it cannot be decomposed into a tensor product of individual qubit states |ψ_A⟩ ⊗ |ψ_B⟩", "When all qubits are in state |1⟩", "When the qubits are located on the same chip", "When both qubits have phase π"],
            "correct_answer": "When it cannot be decomposed into a tensor product of individual qubit states |ψ_A⟩ ⊗ |ψ_B⟩",
            "concept": "Entanglement",
            "difficulty": "intermediate",
            "explanation": "An entangled state is any composite state that cannot be factored as a product state |ψ_A⟩ ⊗ |ψ_B⟩ of its constituent subsystems.",
            "order_no": 3,
        },
        {
            "title": "The EPR Paradox Argument",
            "question": "What central thesis did Einstein, Podolsky, and Rosen (EPR) argue regarding quantum entanglement in 1935?",
            "options": ["That quantum mechanics was complete and purely deterministic", "That quantum mechanics was incomplete and required local hidden variables", "That qubits could travel faster than light", "That superposition does not exist"],
            "correct_answer": "That quantum mechanics was incomplete and required local hidden variables",
            "concept": "Entanglement",
            "difficulty": "intermediate",
            "explanation": "EPR argued that non-local quantum correlations implied the existence of local hidden variables and that quantum theory was incomplete.",
            "order_no": 4,
        },
        {
            "title": "Bell's Theorem Implication",
            "question": "What did John Bell prove in Bell's Theorem regarding local hidden variable theories?",
            "options": ["That local hidden variables cannot reproduce all statistical predictions of quantum mechanics", "That classical computers can simulate quantum mechanics in polynomial time", "That entanglement is an illusion caused by noise", "That quantum circuits must have depth less than 100"],
            "correct_answer": "That local hidden variables cannot reproduce all statistical predictions of quantum mechanics",
            "concept": "Entanglement",
            "difficulty": "intermediate",
            "explanation": "Bell showed that quantum mechanics predicts correlations that violate any local realistic inequality, proving the universe is fundamentally non-local in nature.",
            "order_no": 5,
        },
        {
            "title": "Classical Information in Quantum Teleportation",
            "question": "In the standard quantum teleportation protocol, how many classical bits must Alice send to Bob to reconstruct a single unknown qubit state?",
            "options": ["2 classical bits", "1 classical bit", "0 classical bits", "Infinitely many bits"],
            "correct_answer": "2 classical bits",
            "concept": "Entanglement",
            "difficulty": "intermediate",
            "explanation": "Alice measures her two qubits in the Bell basis, obtaining 2 classical bits. Bob applies one of four Pauli operations (I, X, Z, XZ) based on these 2 bits to reconstruct the state.",
            "order_no": 6,
        },
        {
            "title": "No-Communication Theorem",
            "question": "Can quantum entanglement alone be used to send instantaneous classical messages faster than light?",
            "options": ["No, the No-Communication Theorem proves entanglement alone cannot convey faster-than-light signals", "Yes, instantaneous messaging is the primary purpose of entanglement", "Yes, but only between identical atoms", "Yes, if the qubits are kept at absolute zero"],
            "correct_answer": "No, the No-Communication Theorem proves entanglement alone cannot convey faster-than-light signals",
            "concept": "Entanglement",
            "difficulty": "beginner",
            "explanation": "Because local measurement outcomes on an entangled pair are completely random, no usable message can be communicated without transmitting classical information at or below light speed.",
            "order_no": 7,
        },
    ],
}


SAMPLE_CHALLENGES = [
    {
        "title": "Create a Superposition",
        "description": (
            "Initialize a quantum circuit with 1 qubit and place it into an equal "
            "superposition state |+⟩ = (|0⟩ + |1⟩)/√2 using the Hadamard gate. "
            "Measure the qubit and verify that both 0 and 1 outcomes occur with roughly equal probability."
        ),
        "difficulty": "beginner",
        "category": "Fundamentals",
        "starter_code": (
            "# Task: Apply a Hadamard gate to qubit 0 and measure it\n"
            "from qiskit import QuantumCircuit\n\n"
            "qc = QuantumCircuit(1, 1)\n"
            "# Your code here:\n"
            "qc.h(0)\n"
            "qc.measure(0, 0)\n"
        ),
        "expected_output": "Equal distribution of |0> and |1>",
        "test_cases": [
            {"name": "Has H gate", "check": "h_on_0"},
            {"name": "Has Measurement", "check": "has_measure"},
        ],
        "hints": [
            "Use qc.h(0) to put qubit 0 into superposition.",
            "Add qc.measure(0, 0) to observe the outcome in classical bit 0.",
        ],
        "order_no": 1,
    },
    {
        "title": "Pauli-X Bit Flip",
        "description": (
            "Qubits initialize to state |0⟩. Use the Pauli-X gate to flip qubit 0 "
            "into state |1⟩, measure it, and verify that the output state is 100% |1⟩."
        ),
        "difficulty": "beginner",
        "category": "Quantum Gates",
        "starter_code": (
            "# Task: Flip qubit 0 from |0> to |1> using the X gate\n"
            "from qiskit import QuantumCircuit\n\n"
            "qc = QuantumCircuit(1, 1)\n"
            "# Apply X gate:\n"
            "qc.x(0)\n"
            "qc.measure(0, 0)\n"
        ),
        "expected_output": "100% |1>",
        "test_cases": [
            {"name": "Has X gate", "check": "x_on_0"},
            {"name": "Target state is 1", "check": "measures_1"},
        ],
        "hints": [
            "qc.x(0) inverts the state from |0> to |1>.",
        ],
        "order_no": 2,
    },
    {
        "title": "Entangle Two Qubits (Bell State)",
        "description": (
            "Build the canonical Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 using 2 qubits. "
            "Apply a Hadamard gate to qubit 0, followed by a CNOT gate with qubit 0 as control "
            "and qubit 1 as target."
        ),
        "difficulty": "intermediate",
        "category": "Entanglement",
        "starter_code": (
            "# Task: Build a 2-qubit Bell state |Phi+>\n"
            "from qiskit import QuantumCircuit\n\n"
            "qc = QuantumCircuit(2, 2)\n"
            "# 1. Put qubit 0 in superposition:\n"
            "qc.h(0)\n"
            "# 2. Entangle qubit 0 and qubit 1:\n"
            "qc.cx(0, 1)\n"
            "# 3. Measure both qubits:\n"
            "qc.measure([0, 1], [0, 1])\n"
        ),
        "expected_output": "Approximately 50% |00> and 50% |11>",
        "test_cases": [
            {"name": "Has H on qubit 0", "check": "h_on_0"},
            {"name": "Has CNOT(0, 1)", "check": "cx_0_1"},
            {"name": "No unentangled outcomes", "check": "bell_correlated"},
        ],
        "hints": [
            "First apply qc.h(0) to create superposition on the control qubit.",
            "Then apply qc.cx(0, 1) to entangle control qubit 0 with target qubit 1.",
        ],
        "order_no": 3,
    },
    {
        "title": "Phase Flip with Pauli-Z",
        "description": (
            "Demonstrate phase kickback and phase flipping. Put qubit 0 into state |+⟩ using H, "
            "apply the Pauli-Z gate to flip the phase to |-⟩, and then apply another H gate. "
            "Observe that H · Z · H transforms |0⟩ into |1⟩."
        ),
        "difficulty": "intermediate",
        "category": "Phase & Interference",
        "starter_code": (
            "# Task: Apply H, Z, then H to observe how phase flip transforms to bit flip\n"
            "from qiskit import QuantumCircuit\n\n"
            "qc = QuantumCircuit(1, 1)\n"
            "# Apply H, Z, H:\n"
            "qc.h(0)\n"
            "qc.z(0)\n"
            "qc.h(0)\n"
            "qc.measure(0, 0)\n"
        ),
        "expected_output": "100% |1>",
        "test_cases": [
            {"name": "Has H-Z-H sequence", "check": "hzh_sequence"},
            {"name": "Final state is |1>", "check": "measures_1"},
        ],
        "hints": [
            "H |0> = |+>. Z |+> = |->. H |-> = |1>.",
            "This identity proves that H Z H = X.",
        ],
        "order_no": 4,
    },
    {
        "title": "Quantum Teleportation Protocol",
        "description": (
            "Implement quantum teleportation using 3 qubits. Qubit 0 is Alice's state to teleport (prepare with X), "
            "qubits 1 and 2 are a Bell pair shared between Alice and Bob. Alice measures in the Bell basis, "
            "and classical corrections on Bob's qubit 2 recover the state |1⟩."
        ),
        "difficulty": "advanced",
        "category": "Algorithms",
        "starter_code": (
            "# Task: Teleport state |1> from qubit 0 to qubit 2\n"
            "from qiskit import QuantumCircuit\n\n"
            "qc = QuantumCircuit(3, 3)\n"
            "# Prepare state to teleport on q0 (|1>):\n"
            "qc.x(0)\n\n"
            "# Create Bell pair between q1 and q2:\n"
            "qc.h(1)\n"
            "qc.cx(1, 2)\n\n"
            "# Alice's Bell measurement on q0 and q1:\n"
            "qc.cx(0, 1)\n"
            "qc.h(0)\n"
            "qc.measure([0, 1], [0, 1])\n\n"
            "# Bob's corrections on q2:\n"
            "qc.cx(1, 2)\n"
            "qc.cz(0, 2)\n"
            "qc.measure(2, 2)\n"
        ),
        "expected_output": "Target qubit 2 collapses to state |1>",
        "test_cases": [
            {"name": "Prepares state on q0", "check": "x_on_0"},
            {"name": "Creates Bell pair q1-q2", "check": "bell_pair_1_2"},
            {"name": "Bob receives state |1>", "check": "teleport_success"},
        ],
        "hints": [
            "Alice entangles the source qubit q0 with her half of the Bell pair q1.",
            "After measuring q0 and q1, Bob applies CX controlled by q1 and CZ controlled by q0 to qubit 2.",
        ],
        "order_no": 5,
    },
    {
        "title": "Grover's 2-Qubit Search",
        "description": (
            "Implement a 2-qubit Grover search algorithm to find the marked target state |11⟩. "
            "Start with equal superposition across both qubits (H on q0, q1), apply the phase oracle "
            "(CZ on q0, q1 marks |11⟩), and apply the 2-qubit diffusion operator (H-X-CZ-X-H). "
            "Measure both qubits and verify |11⟩ is found with 100% probability."
        ),
        "difficulty": "advanced",
        "category": "Algorithms",
        "starter_code": (
            "# Task: 2-Qubit Grover Search for target state |11>\n"
            "from qiskit import QuantumCircuit\n\n"
            "qc = QuantumCircuit(2, 2)\n"
            "# 1. Initialize superposition:\n"
            "qc.h([0, 1])\n\n"
            "# 2. Oracle for |11> (CZ gate marks state 11 with phase -1):\n"
            "qc.cz(0, 1)\n\n"
            "# 3. Diffusion operator:\n"
            "qc.h([0, 1])\n"
            "qc.x([0, 1])\n"
            "qc.cz(0, 1)\n"
            "qc.x([0, 1])\n"
            "qc.h([0, 1])\n\n"
            "# 4. Measure:\n"
            "qc.measure([0, 1], [0, 1])\n"
        ),
        "expected_output": "Target state |11> measured with near 100% probability",
        "test_cases": [
            {"name": "Applies Hadamard initialization", "check": "h_on_both"},
            {"name": "Applies Oracle", "check": "oracle_present"},
            {"name": "Finds |11> with high probability", "check": "grover_found_11"},
        ],
        "hints": [
            "In a 2-qubit system with 1 marked item, exactly one Grover iteration (π/4 * √4 = 1) yields 100% probability.",
            "The CZ gate acts as the exact oracle for target |11> because CZ|11> = -|11> while leaving other basis states positive.",
        ],
        "order_no": 6,
    },
]


def seed_if_empty(db: Session) -> None:
    """
    Seed initial courses, prototype lectures, lecture assessments,
    coding challenges, and administrative users.
    """

    # 1. Seed Courses
    if db.query(Course).first() is None:
        for course_data in SAMPLE_COURSES:
            db.add(Course(**course_data))
        db.flush()

    # 2. Seed Lectures
    first_course = db.query(Course).order_by(Course.id).first()
    course_id = first_course.id if first_course else 1

    existing_lectures = {
        l.order_no: l for l in db.query(Lecture).all()
    }

    lecture_map: dict[int, Lecture] = {}

    for l_data in PROTOTYPE_LECTURES:
        order_no = l_data["order_no"]
        if order_no in existing_lectures:
            lecture_map[order_no] = existing_lectures[order_no]
        else:
            lec = Lecture(course_id=course_id, **l_data)
            db.add(lec)
            db.flush()
            lecture_map[order_no] = lec

    # 3. Seed Lecture Assessments
    for order_no, questions in LECTURE_ASSESSMENTS.items():
        lecture = lecture_map.get(order_no)
        if not lecture:
            continue

        existing_count = (
            db.query(Assessment)
            .filter(Assessment.lecture_id == lecture.id)
            .count()
        )

        if existing_count == 0:
            for q_data in questions:
                assessment = Assessment(
                    lecture_id=lecture.id,
                    course_id=lecture.course_id,
                    **q_data,
                )
                db.add(assessment)

    # 4. Seed Coding Challenges
    if db.query(CodingChallenge).first() is None:
        for challenge_data in SAMPLE_CHALLENGES:
            db.add(CodingChallenge(**challenge_data))

    # 5. Seed Admin User
    admin_user = (
        db.query(User)
        .filter(User.email == "admin@quantumlearn.com")
        .first()
    )

    if admin_user is None:
        admin = User(
            name="Quantum Administrator",
            email="admin@quantumlearn.com",
            hashed_password=hash_password("Admin@12345"),
            role="admin",
        )
        db.add(admin)

    # 6. Seed visual lecture timelines
    db.flush()
    seed_lecture_segments(db, db.query(Lecture).all())

    db.commit()


def seed_lectures_if_empty(db: Session) -> None:
    """Ensure all lectures are seeded."""
    seed_if_empty(db)