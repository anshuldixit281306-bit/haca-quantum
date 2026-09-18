"""
QuantumLearn Quantum Computing Knowledge Base

This module contains structured educational knowledge
used by the local QuantumLearn AI Tutor.
"""

# ============================================================
# KNOWLEDGE BASE
# ============================================================

KNOWLEDGE_BASE = {

    # --------------------------------------------------------
    # QUANTUM COMPUTING
    # --------------------------------------------------------

    "quantum computing": {
        "title": "Quantum Computing",
        "category": "Fundamentals",

        "definition": (
            "Quantum computing is a computing paradigm that uses "
            "principles of quantum mechanics, such as superposition, "
            "entanglement, and interference, to process information."
        ),

        "simple_explanation": (
            "A classical computer uses bits that are either 0 or 1. "
            "A quantum computer uses qubits, which can exist in a "
            "combination of 0 and 1 until they are measured."
        ),

        "how_it_works": [
            "Information is stored in qubits.",
            "Quantum gates modify the states of qubits.",
            "Superposition allows qubits to represent combinations of states.",
            "Entanglement creates strong correlations between qubits.",
            "Interference changes the probability of different outcomes.",
            "Measurement converts quantum information into classical information."
        ],

        "key_ideas": [
            "Qubits",
            "Superposition",
            "Measurement",
            "Quantum gates",
            "Entanglement",
            "Interference",
            "Quantum circuits",
            "Quantum algorithms"
        ],

        "advantages": [
            "Can provide major speedups for certain problems.",
            "Can efficiently simulate some quantum systems.",
            "Provides new approaches to optimization and search.",
            "May improve some cryptographic and scientific applications."
        ],

        "benefits": [
            "Potentially faster solutions for specific computational problems.",
            "Useful for scientific simulation.",
            "Potential applications in drug discovery and materials science.",
            "Can support research in optimization and machine learning."
        ],

        "disadvantages": [
            "Quantum computers are difficult to build and maintain.",
            "Qubits are sensitive to noise.",
            "Quantum error correction requires significant resources.",
            "Most problems do not automatically become faster on a quantum computer."
        ],

        "limitations": [
            "Current quantum hardware has limited scale and reliability.",
            "Quantum states can lose information through decoherence.",
            "Quantum algorithms are available only for specific classes of problems.",
            "Large fault-tolerant quantum computers are still under development."
        ],

        "real_world_examples": [
            "Quantum chemistry simulation",
            "Drug discovery research",
            "Materials science",
            "Optimization research",
            "Cryptography research",
            "Financial modeling research"
        ],

        "applications": [
            "Cryptography",
            "Drug discovery",
            "Chemistry simulation",
            "Optimization",
            "Materials science",
            "Machine learning research",
            "Financial modeling"
        ],

        "classical_comparison": (
            "Classical computers use bits and conventional logic gates. "
            "Quantum computers use qubits and quantum gates. "
            "Quantum computers are not replacements for classical computers; "
            "they are designed to provide advantages for particular problems."
        ),

        "mathematical_explanation": (
            "A general single-qubit state can be written as "
            "|ψ⟩ = α|0⟩ + β|1⟩, where α and β are complex probability "
            "amplitudes satisfying |α|² + |β|² = 1."
        ),

        "example": (
            "Applying a Hadamard gate to |0⟩ produces "
            "(|0⟩ + |1⟩)/√2. An ideal measurement then gives 0 or 1 "
            "with approximately equal probability."
        ),

        "common_misconceptions": [
            "Quantum computers are not simply faster versions of classical computers.",
            "A qubit does not mean that we can directly read both 0 and 1 at the same time.",
            "Superposition does not mean unlimited computing power.",
            "Quantum computers will not replace classical computers for every task."
        ],

        "related_topics": [
            "Qubit",
            "Superposition",
            "Quantum Gates",
            "Measurement",
            "Entanglement",
            "Quantum Algorithms"
        ]
    },


    # --------------------------------------------------------
    # QUBIT
    # --------------------------------------------------------

    "qubit": {
        "title": "Qubit",
        "category": "Quantum Fundamentals",

        "definition": (
            "A qubit, or quantum bit, is the fundamental unit of "
            "quantum information."
        ),

        "simple_explanation": (
            "A classical bit is either 0 or 1. A qubit can exist in "
            "a quantum state that is a combination of |0⟩ and |1⟩ "
            "until it is measured."
        ),

        "how_it_works": [
            "A qubit has two computational basis states: |0⟩ and |1⟩.",
            "It can exist in a superposition of these states.",
            "Quantum gates can change its state.",
            "Measurement produces a classical result."
        ],

        "key_ideas": [
            "Basis states",
            "Superposition",
            "Probability amplitudes",
            "Measurement",
            "Quantum gates"
        ],

        "advantages": [
            "Can represent quantum superpositions.",
            "Can participate in entanglement.",
            "Forms the basic building block of quantum circuits."
        ],

        "benefits": [
            "Allows quantum algorithms to manipulate quantum information.",
            "Supports quantum parallelism and interference."
        ],

        "disadvantages": [
            "Qubits are sensitive to environmental noise.",
            "Their quantum state is difficult to preserve."
        ],

        "limitations": [
            "Measurement collapses the quantum state.",
            "Physical qubits are affected by errors and decoherence."
        ],

        "real_world_examples": [
            "Superconducting qubits",
            "Trapped-ion qubits",
            "Photonic qubits",
            "Spin qubits"
        ],

        "applications": [
            "Quantum algorithms",
            "Quantum simulation",
            "Quantum cryptography",
            "Quantum communication"
        ],

        "classical_comparison": (
            "A classical bit has a definite value of 0 or 1. "
            "A qubit can be represented as a linear combination of "
            "both computational basis states."
        ),

        "mathematical_explanation": (
            "A single qubit can be represented as "
            "|ψ⟩ = α|0⟩ + β|1⟩, where |α|² + |β|² = 1."
        ),

        "example": (
            "For an equal superposition, a qubit can be written as "
            "|ψ⟩ = (|0⟩ + |1⟩)/√2."
        ),

        "common_misconceptions": [
            "A qubit is not simply a bit that is simultaneously readable as 0 and 1.",
            "The result of a measurement is still a classical value."
        ],

        "related_topics": [
            "Superposition",
            "Measurement",
            "Hadamard Gate",
            "Entanglement"
        ]
    },


    # --------------------------------------------------------
    # SUPERPOSITION
    # --------------------------------------------------------

    "superposition": {
        "title": "Quantum Superposition",
        "category": "Quantum Fundamentals",

        "definition": (
            "Superposition is the quantum-mechanical principle that "
            "allows a quantum system to exist in a combination of possible states."
        ),

        "simple_explanation": (
            "Instead of being restricted to only |0⟩ or |1⟩, a qubit "
            "can exist in a combination of both states before measurement."
        ),

        "how_it_works": [
            "A qubit starts in a basis state such as |0⟩.",
            "A quantum gate can create a superposition.",
            "The resulting state contains probability amplitudes.",
            "Measurement produces one definite classical outcome."
        ],

        "key_ideas": [
            "Probability amplitudes",
            "Quantum states",
            "Measurement",
            "Hadamard gate"
        ],

        "advantages": [
            "Allows quantum algorithms to manipulate multiple possible states.",
            "Forms a key part of many quantum algorithms."
        ],

        "benefits": [
            "Enables quantum interference.",
            "Supports algorithms such as Grover's search."
        ],

        "disadvantages": [
            "The state cannot simply be read without measurement.",
            "Noise can destroy superposition."
        ],

        "limitations": [
            "Measurement changes the state.",
            "Superposition alone does not guarantee computational speedup."
        ],

        "real_world_examples": [
            "Quantum algorithm states",
            "Quantum simulation experiments"
        ],

        "applications": [
            "Quantum algorithms",
            "Quantum simulation",
            "Quantum information processing"
        ],

        "classical_comparison": (
            "A classical bit has one definite value at a time. "
            "A qubit can have a superposition of computational basis states."
        ),

        "mathematical_explanation": (
            "A general single-qubit state is "
            "|ψ⟩ = α|0⟩ + β|1⟩."
        ),

        "example": (
            "The Hadamard gate transforms |0⟩ into "
            "(|0⟩ + |1⟩)/√2."
        ),

        "common_misconceptions": [
            "Superposition does not allow us to directly observe every state simultaneously.",
            "Superposition is not the same as uncertainty caused by lack of knowledge."
        ],

        "related_topics": [
            "Qubit",
            "Hadamard",
            "Measurement",
            "Interference"
        ]
    },


    # --------------------------------------------------------
    # MEASUREMENT
    # --------------------------------------------------------

    "measurement": {
        "title": "Quantum Measurement",
        "category": "Quantum Fundamentals",

        "definition": (
            "Quantum measurement is the process of extracting classical "
            "information from a quantum state."
        ),

        "simple_explanation": (
            "Before measurement, a qubit can be in a superposition. "
            "When measured, we obtain a definite classical result such as 0 or 1."
        ),

        "how_it_works": [
            "The quantum state is prepared.",
            "A measurement is performed.",
            "One of the allowed classical outcomes is obtained.",
            "The quantum state is projected onto the measured state."
        ],

        "key_ideas": [
            "Measurement",
            "Probability",
            "Collapse",
            "Classical result"
        ],

        "advantages": [
            "Allows quantum information to be read by classical systems."
        ],

        "benefits": [
            "Connects quantum computation with classical output."
        ],

        "disadvantages": [
            "Measurement can destroy useful quantum information."
        ],

        "limitations": [
            "We cannot generally observe a complete quantum state from one measurement."
        ],

        "real_world_examples": [
            "Quantum experiments",
            "Quantum algorithm measurements"
        ],

        "applications": [
            "Quantum computing",
            "Quantum communication",
            "Quantum experiments"
        ],

        "classical_comparison": (
            "Classical systems can usually be read without fundamentally "
            "changing the stored bit. Quantum measurement can change the quantum state."
        ),

        "mathematical_explanation": (
            "For |ψ⟩ = α|0⟩ + β|1⟩, measuring in the computational basis "
            "gives 0 with probability |α|² and 1 with probability |β|²."
        ),

        "example": (
            "For the state (|0⟩ + |1⟩)/√2, ideal measurement produces "
            "0 or 1 with approximately 50% probability each."
        ),

        "common_misconceptions": [
            "Measurement is not simply looking at a qubit without affecting it.",
            "Repeated measurements are needed to estimate probabilities experimentally."
        ],

        "related_topics": [
            "Qubit",
            "Superposition",
            "Probability",
            "Quantum State"
        ]
    },


    # --------------------------------------------------------
    # ENTANGLEMENT
    # --------------------------------------------------------

    "entanglement": {
        "title": "Quantum Entanglement",
        "category": "Quantum Fundamentals",

        "definition": (
            "Quantum entanglement is a quantum phenomenon in which "
            "multiple quantum systems share a joint state that cannot "
            "be described independently."
        ),

        "simple_explanation": (
            "Two or more qubits can become strongly correlated. "
            "Their measurement outcomes can be related even when the "
            "qubits are physically separated."
        ),

        "how_it_works": [
            "Multiple qubits interact through quantum operations.",
            "The resulting system can become entangled.",
            "The state of the combined system must be described jointly.",
            "Measurements reveal correlated outcomes."
        ],

        "key_ideas": [
            "Quantum correlation",
            "Joint quantum state",
            "Bell states",
            "Measurement"
        ],

        "advantages": [
            "Essential for several quantum algorithms and communication protocols."
        ],

        "benefits": [
            "Supports quantum teleportation.",
            "Important in quantum cryptography and quantum networks."
        ],

        "disadvantages": [
            "Entanglement is fragile and sensitive to noise."
        ],

        "limitations": [
            "Entanglement does not allow faster-than-light communication."
        ],

        "real_world_examples": [
            "Bell-state experiments",
            "Quantum communication experiments",
            "Quantum networking research"
        ],

        "applications": [
            "Quantum teleportation",
            "Quantum cryptography",
            "Quantum networks",
            "Quantum computing"
        ],

        "classical_comparison": (
            "Classical systems can have correlations, but quantum entanglement "
            "is a specifically quantum form of correlation described by a joint state."
        ),

        "mathematical_explanation": (
            "One example is the Bell state "
            "|Φ+⟩ = (|00⟩ + |11⟩)/√2."
        ),

        "example": (
            "If two qubits are prepared in the Bell state above, "
            "measurements in the computational basis produce correlated "
            "results: 00 or 11."
        ),

        "common_misconceptions": [
            "Entanglement does not permit faster-than-light messaging.",
            "Entanglement is not simply ordinary classical correlation."
        ],

        "related_topics": [
            "Bell State",
            "Qubit",
            "Superposition",
            "Quantum Teleportation"
        ]
    },


    # --------------------------------------------------------
    # HADAMARD
    # --------------------------------------------------------

    "hadamard": {
        "title": "Hadamard Gate",
        "category": "Quantum Gates",

        "definition": (
            "The Hadamard gate, commonly written as H, is a single-qubit "
            "quantum gate that creates or removes equal superposition."
        ),

        "simple_explanation": (
            "The Hadamard gate can turn |0⟩ into an equal combination of "
            "|0⟩ and |1⟩, and it can also transform certain superposition "
            "states back into basis states."
        ),

        "how_it_works": [
            "Apply H to |0⟩ to create an equal superposition.",
            "Apply H to |1⟩ to create a superposition with a relative phase.",
            "Applying H twice returns the original state."
        ],

        "key_ideas": [
            "Superposition",
            "Interference",
            "Single-qubit gate",
            "Unitary operation"
        ],

        "advantages": [
            "Simple way to create superposition.",
            "Used in many quantum algorithms."
        ],

        "benefits": [
            "Important in state preparation.",
            "Used in algorithms such as Grover's algorithm."
        ],

        "disadvantages": [
            "It is only one operation and cannot solve problems by itself."
        ],

        "limitations": [
            "Its effect depends on the input state.",
            "Real hardware introduces gate errors."
        ],

        "real_world_examples": [
            "Quantum algorithm circuits",
            "Superposition experiments"
        ],

        "applications": [
            "Grover's algorithm",
            "Quantum Fourier transform circuits",
            "Bell-state preparation",
            "Quantum experiments"
        ],

        "classical_comparison": (
            "Classical logic gates transform definite bit values. "
            "The Hadamard gate transforms quantum amplitudes."
        ),

        "mathematical_explanation": (
            "H = 1/√2 [[1, 1], [1, -1]]. "
            "It transforms |0⟩ into (|0⟩ + |1⟩)/√2."
        ),

        "example": (
            "Starting with |0⟩ and applying H gives an equal probability "
            "of measuring 0 or 1."
        ),

        "common_misconceptions": [
            "Hadamard does not simply generate random numbers.",
            "It creates a quantum superposition before measurement."
        ],

        "related_topics": [
            "Superposition",
            "Qubit",
            "Grover",
            "Interference"
        ]
    },


    # --------------------------------------------------------
    # PAULI X
    # --------------------------------------------------------

    "pauli x": {
        "title": "Pauli-X Gate",
        "category": "Quantum Gates",

        "definition": (
            "The Pauli-X gate is a single-qubit quantum gate that "
            "performs a bit flip."
        ),

        "simple_explanation": (
            "It changes |0⟩ to |1⟩ and |1⟩ to |0⟩."
        ),

        "how_it_works": [
            "Apply X to |0⟩ to obtain |1⟩.",
            "Apply X to |1⟩ to obtain |0⟩."
        ],

        "key_ideas": [
            "Bit flip",
            "Single-qubit gate",
            "Pauli operator"
        ],

        "advantages": [
            "Simple and fundamental quantum operation."
        ],

        "benefits": [
            "Useful for manipulating computational basis states."
        ],

        "disadvantages": [
            "It only performs a specific transformation."
        ],

        "limitations": [
            "It does not create entanglement by itself."
        ],

        "real_world_examples": [
            "Quantum circuits",
            "Quantum error correction"
        ],

        "applications": [
            "Bit-flip operations",
            "Quantum error correction",
            "Quantum circuits"
        ],

        "classical_comparison": (
            "The X gate is similar to a classical NOT operation."
        ),

        "mathematical_explanation": (
            "X = [[0, 1], [1, 0]]."
        ),

        "example": (
            "X|0⟩ = |1⟩ and X|1⟩ = |0⟩."
        ),

        "common_misconceptions": [
            "X is not the same as the Hadamard gate."
        ],

        "related_topics": [
            "Hadamard",
            "Pauli Y",
            "Pauli Z",
            "Quantum Gates"
        ]
    },


    # --------------------------------------------------------
    # PAULI Y
    # --------------------------------------------------------

    "pauli y": {
        "title": "Pauli-Y Gate",
        "category": "Quantum Gates",

        "definition": (
            "The Pauli-Y gate is a single-qubit quantum gate that "
            "combines a bit flip with a phase change."
        ),

        "simple_explanation": (
            "The Y gate changes the qubit between |0⟩ and |1⟩ while "
            "also introducing a complex phase."
        ),

        "how_it_works": [
            "It transforms |0⟩ into i|1⟩.",
            "It transforms |1⟩ into -i|0⟩."
        ],

        "key_ideas": [
            "Bit flip",
            "Phase",
            "Pauli operator"
        ],

        "advantages": [
            "Provides an important quantum transformation."
        ],

        "benefits": [
            "Useful in quantum circuits and error correction."
        ],

        "disadvantages": [
            "Its action is more complex than a simple bit flip."
        ],

        "limitations": [
            "It is still a single-qubit operation."
        ],

        "real_world_examples": [
            "Quantum circuits",
            "Quantum error correction"
        ],

        "applications": [
            "Quantum gates",
            "Error correction",
            "Quantum experiments"
        ],

        "classical_comparison": (
            "There is no direct classical bit operation equivalent to the full Y transformation."
        ),

        "mathematical_explanation": (
            "Y = [[0, -i], [i, 0]]."
        ),

        "example": (
            "Y|0⟩ = i|1⟩."
        ),

        "common_misconceptions": [
            "The Y gate is not simply another version of X."
        ],

        "related_topics": [
            "Pauli X",
            "Pauli Z",
            "Phase"
        ]
    },


    # --------------------------------------------------------
    # PAULI Z
    # --------------------------------------------------------

    "pauli z": {
        "title": "Pauli-Z Gate",
        "category": "Quantum Gates",

        "definition": (
            "The Pauli-Z gate is a single-qubit quantum gate that "
            "changes the phase of the |1⟩ component."
        ),

        "simple_explanation": (
            "The Z gate leaves |0⟩ unchanged and changes |1⟩ to -|1⟩."
        ),

        "how_it_works": [
            "Z|0⟩ = |0⟩.",
            "Z|1⟩ = -|1⟩."
        ],

        "key_ideas": [
            "Phase flip",
            "Single-qubit operation",
            "Interference"
        ],

        "advantages": [
            "Useful for controlling relative phase."
        ],

        "benefits": [
            "Important in interference-based quantum algorithms."
        ],

        "disadvantages": [
            "Its effect may not be visible from computational-basis probabilities alone."
        ],

        "limitations": [
            "It does not change computational basis probabilities directly."
        ],

        "real_world_examples": [
            "Quantum circuits",
            "Phase-error correction"
        ],

        "applications": [
            "Phase manipulation",
            "Quantum error correction",
            "Quantum algorithms"
        ],

        "classical_comparison": (
            "There is no direct classical bit operation corresponding to a quantum phase flip."
        ),

        "mathematical_explanation": (
            "Z = [[1, 0], [0, -1]]."
        ),

        "example": (
            "Z(|0⟩ + |1⟩)/√2 = (|0⟩ - |1⟩)/√2."
        ),

        "common_misconceptions": [
            "Z does not simply change 1 into 0."
        ],

        "related_topics": [
            "Phase",
            "Pauli X",
            "Hadamard",
            "Interference"
        ]
    },


    # --------------------------------------------------------
    # CNOT
    # --------------------------------------------------------

    "cnot": {
        "title": "CNOT Gate",
        "category": "Quantum Gates",

        "definition": (
            "The Controlled-NOT, or CNOT, gate is a two-qubit quantum "
            "gate that flips a target qubit when the control qubit is |1⟩."
        ),

        "simple_explanation": (
            "The control qubit decides whether the target qubit should flip."
        ),

        "how_it_works": [
            "If the control is 0, the target remains unchanged.",
            "If the control is 1, the target is flipped.",
            "CNOT can create entanglement when used with a superposition."
        ],

        "key_ideas": [
            "Control qubit",
            "Target qubit",
            "Conditional operation",
            "Entanglement"
        ],

        "advantages": [
            "Fundamental two-qubit operation.",
            "Can create entanglement."
        ],

        "benefits": [
            "Used in many quantum algorithms.",
            "Important in quantum teleportation and error correction."
        ],

        "disadvantages": [
            "Requires interaction between two qubits."
        ],

        "limitations": [
            "Hardware implementation can introduce errors."
        ],

        "real_world_examples": [
            "Bell-state preparation",
            "Quantum teleportation circuits",
            "Quantum error correction"
        ],

        "applications": [
            "Entanglement",
            "Quantum teleportation",
            "Quantum algorithms",
            "Error correction"
        ],

        "classical_comparison": (
            "CNOT resembles a controlled conditional operation, but it acts "
            "on quantum states and can generate entanglement."
        ),

        "mathematical_explanation": (
            "CNOT maps |a,b⟩ to |a, a XOR b⟩."
        ),

        "example": (
            "CNOT|10⟩ = |11⟩ because the control qubit is 1, "
            "so the target qubit flips."
        ),

        "common_misconceptions": [
            "CNOT does not always flip the target.",
            "The control qubit is not changed by the standard CNOT operation."
        ],

        "related_topics": [
            "Entanglement",
            "Bell State",
            "Quantum Circuits"
        ]
    },


    # --------------------------------------------------------
    # GROVER
    # --------------------------------------------------------

    "grover": {
        "title": "Grover's Search Algorithm",
        "category": "Quantum Algorithms",

        "definition": (
            "Grover's algorithm is a quantum search algorithm that "
            "can search an unstructured database quadratically faster "
            "than the best-known classical brute-force approach."
        ),

        "simple_explanation": (
            "For N possible items, a classical search may require about "
            "N checks in the worst case, while Grover's algorithm requires "
            "about √N oracle iterations."
        ),

        "how_it_works": [
            "Prepare a superposition of possible candidates.",
            "Use an oracle to mark the desired state.",
            "Apply a diffusion or amplitude-amplification operation.",
            "Repeat the oracle and diffusion steps.",
            "Measure the system to obtain the marked result with high probability."
        ],

        "key_ideas": [
            "Oracle",
            "Amplitude amplification",
            "Superposition",
            "Interference",
            "Quantum search"
        ],

        "advantages": [
            "Provides quadratic speedup for unstructured search."
        ],

        "benefits": [
            "Useful as a general quantum search technique.",
            "Demonstrates amplitude amplification."
        ],

        "disadvantages": [
            "The speedup is quadratic rather than exponential.",
            "Requires a suitable quantum oracle."
        ],

        "limitations": [
            "The problem must be represented using an oracle.",
            "Practical hardware noise can reduce performance."
        ],

        "real_world_examples": [
            "Search-related quantum algorithms",
            "Combinatorial search research",
            "Optimization research"
        ],

        "applications": [
            "Unstructured search",
            "Optimization",
            "Constraint search",
            "Amplitude amplification"
        ],

        "classical_comparison": (
            "A classical brute-force search requires O(N) queries in the "
            "worst case. Grover's algorithm requires approximately O(√N) "
            "oracle queries."
        ),

        "mathematical_explanation": (
            "The query complexity of Grover's algorithm is approximately "
            "π/4 × √N oracle queries for a single marked item."
        ),

        "example": (
            "If a database contains 1,000,000 possibilities, classical "
            "search may require up to about 1,000,000 checks, while Grover's "
            "algorithm requires on the order of 1,000 oracle iterations."
        ),

        "common_misconceptions": [
            "Grover does not instantly search every item and return all answers.",
            "The algorithm provides a quadratic speedup, not an exponential speedup."
        ],

        "related_topics": [
            "Superposition",
            "Hadamard",
            "Oracle",
            "Amplitude Amplification",
            "Quantum Algorithms"
        ]
    },


    # --------------------------------------------------------
    # SHOR
    # --------------------------------------------------------

    "shor": {
        "title": "Shor's Algorithm",
        "category": "Quantum Algorithms",

        "definition": (
            "Shor's algorithm is a quantum algorithm for integer "
            "factorization and related number-theoretic problems."
        ),

        "simple_explanation": (
            "Shor's algorithm uses quantum period finding to factor "
            "large integers more efficiently than known classical algorithms."
        ),

        "how_it_works": [
            "Choose a suitable integer related to the number being factored.",
            "Use quantum period finding.",
            "Apply the Quantum Fourier Transform.",
            "Extract information about the period.",
            "Use classical mathematics to obtain factors."
        ],

        "key_ideas": [
            "Period finding",
            "Quantum Fourier Transform",
            "Factorization",
            "Cryptography"
        ],

        "advantages": [
            "Provides a major theoretical speedup for integer factorization."
        ],

        "benefits": [
            "Demonstrates the potential impact of quantum computing on cryptography."
        ],

        "disadvantages": [
            "Requires a large fault-tolerant quantum computer for practical large-scale instances."
        ],

        "limitations": [
            "Current hardware is not yet capable of breaking large cryptographic keys at practical scale."
        ],

        "real_world_examples": [
            "Cryptography research",
            "Post-quantum security planning"
        ],

        "applications": [
            "Integer factorization",
            "Cryptography research",
            "Number theory"
        ],

        "classical_comparison": (
            "Known classical factoring algorithms are believed to be "
            "significantly slower than Shor's algorithm for sufficiently large inputs."
        ),

        "mathematical_explanation": (
            "Shor's algorithm reduces factorization to period finding "
            "and uses the Quantum Fourier Transform to estimate that period."
        ),

        "example": (
            "For a small integer such as 15, a quantum implementation can "
            "demonstrate the period-finding approach used for factorization."
        ),

        "common_misconceptions": [
            "Shor's algorithm does not instantly factor every number.",
            "Large-scale cryptographic impact requires fault-tolerant quantum hardware."
        ],

        "related_topics": [
            "Quantum Fourier Transform",
            "Cryptography",
            "Quantum Algorithms"
        ]
    },


    # --------------------------------------------------------
    # TELEPORTATION
    # --------------------------------------------------------

    "quantum teleportation": {
        "title": "Quantum Teleportation",
        "category": "Quantum Communication",

        "definition": (
            "Quantum teleportation is a protocol that transfers the "
            "quantum state of one qubit to another location using "
            "entanglement and classical communication."
        ),

        "simple_explanation": (
            "Quantum teleportation does not transport matter. It transfers "
            "the information describing a quantum state."
        ),

        "how_it_works": [
            "Create an entangled pair of qubits.",
            "Perform a joint measurement involving the state to be teleported.",
            "Send the classical measurement results.",
            "Apply conditional quantum operations to reconstruct the state."
        ],

        "key_ideas": [
            "Entanglement",
            "Bell measurement",
            "Classical communication",
            "Quantum state transfer"
        ],

        "advantages": [
            "Important protocol for quantum networks."
        ],

        "benefits": [
            "Can support long-distance quantum communication research."
        ],

        "disadvantages": [
            "Requires entanglement and classical communication."
        ],

        "limitations": [
            "Does not transmit information faster than light.",
            "The original quantum state is destroyed during the protocol."
        ],

        "real_world_examples": [
            "Quantum communication experiments",
            "Quantum networking research"
        ],

        "applications": [
            "Quantum networks",
            "Quantum communication",
            "Distributed quantum computing"
        ],

        "classical_comparison": (
            "Classical information can be copied, while an unknown quantum "
            "state cannot be perfectly copied because of the no-cloning theorem."
        ),

        "mathematical_explanation": (
            "The protocol uses Bell-state correlations and conditional Pauli "
            "corrections based on two classical measurement bits."
        ),

        "example": (
            "Alice can teleport an unknown qubit state to Bob using an "
            "entangled pair and two classical bits."
        ),

        "common_misconceptions": [
            "Teleportation does not move physical particles instantly.",
            "Classical communication is still required."
        ],

        "related_topics": [
            "Entanglement",
            "Bell State",
            "Quantum Communication"
        ]
    },


    # --------------------------------------------------------
    # BELL STATE
    # --------------------------------------------------------

    "bell state": {
        "title": "Bell State",
        "category": "Quantum Entanglement",

        "definition": (
            "Bell states are four maximally entangled two-qubit quantum states."
        ),

        "simple_explanation": (
            "Bell states are commonly used examples of entangled qubits."
        ),

        "how_it_works": [
            "Start with two qubits.",
            "Apply a Hadamard gate to the first qubit.",
            "Apply CNOT using the first qubit as control.",
            "The resulting state can be entangled."
        ],

        "key_ideas": [
            "Entanglement",
            "Hadamard",
            "CNOT",
            "Two-qubit states"
        ],

        "advantages": [
            "Simple demonstration of quantum entanglement."
        ],

        "benefits": [
            "Useful for teaching and testing quantum hardware."
        ],

        "disadvantages": [
            "Entangled states are sensitive to noise."
        ],

        "limitations": [
            "Real hardware may produce imperfect Bell states."
        ],

        "real_world_examples": [
            "Quantum networking experiments",
            "Quantum teleportation demonstrations"
        ],

        "applications": [
            "Quantum teleportation",
            "Quantum communication",
            "Entanglement experiments"
        ],

        "classical_comparison": (
            "Bell states demonstrate correlations that require a quantum "
            "description of the joint system."
        ),

        "mathematical_explanation": (
            "One Bell state is |Φ+⟩ = (|00⟩ + |11⟩)/√2."
        ),

        "example": (
            "Measuring the |Φ+⟩ Bell state in the computational basis "
            "produces 00 or 11 with equal probability ideally."
        ),

        "common_misconceptions": [
            "Bell states do not allow faster-than-light communication."
        ],

        "related_topics": [
            "Entanglement",
            "Hadamard",
            "CNOT",
            "Quantum Teleportation"
        ]
    },


    # --------------------------------------------------------
    # PHASE
    # --------------------------------------------------------

    "phase": {
        "title": "Quantum Phase",
        "category": "Quantum Fundamentals",

        "definition": (
            "Quantum phase is a property of a quantum state that affects "
            "how probability amplitudes interfere."
        ),

        "simple_explanation": (
            "Two states can have the same measurement probabilities but "
            "different phases, which can later produce different interference."
        ),

        "how_it_works": [
            "Quantum states contain complex amplitudes.",
            "The phase of those amplitudes affects interference.",
            "Quantum gates can change relative phase.",
            "Later operations can convert phase differences into measurable probability differences."
        ],

        "key_ideas": [
            "Relative phase",
            "Interference",
            "Complex amplitudes"
        ],

        "advantages": [
            "Allows quantum algorithms to control interference."
        ],

        "benefits": [
            "Essential for many quantum algorithms."
        ],

        "disadvantages": [
            "Phase information cannot always be directly observed."
        ],

        "limitations": [
            "Phase errors can reduce algorithm performance."
        ],

        "real_world_examples": [
            "Interference experiments",
            "Quantum algorithm circuits"
        ],

        "applications": [
            "Quantum algorithms",
            "Interference",
            "Quantum simulation"
        ],

        "classical_comparison": (
            "Classical probabilities do not have quantum probability amplitudes "
            "with relative phase in the same way."
        ),

        "mathematical_explanation": (
            "A relative phase can be represented as "
            "|ψ⟩ = (|0⟩ + e^(iφ)|1⟩)/√2."
        ),

        "example": (
            "The states (|0⟩ + |1⟩)/√2 and "
            "(|0⟩ - |1⟩)/√2 have the same computational-basis probabilities "
            "before further operations but different relative phases."
        ),

        "common_misconceptions": [
            "Global phase is not generally observable.",
            "Relative phase can affect measurement probabilities after interference."
        ],

        "related_topics": [
            "Interference",
            "Hadamard",
            "Pauli Z"
        ]
    },


    # --------------------------------------------------------
    # INTERFERENCE
    # --------------------------------------------------------

    "interference": {
        "title": "Quantum Interference",
        "category": "Quantum Fundamentals",

        "definition": (
            "Quantum interference is the process by which probability "
            "amplitudes combine constructively or destructively."
        ),

        "simple_explanation": (
            "Quantum algorithms can increase the probability of useful "
            "answers and decrease the probability of unwanted answers."
        ),

        "how_it_works": [
            "Quantum states contain amplitudes.",
            "Operations change these amplitudes.",
            "Amplitudes can reinforce one another.",
            "They can also cancel one another."
        ],

        "key_ideas": [
            "Probability amplitudes",
            "Constructive interference",
            "Destructive interference",
            "Quantum algorithms"
        ],

        "advantages": [
            "Allows quantum algorithms to manipulate outcome probabilities."
        ],

        "benefits": [
            "Central to many quantum speedup mechanisms."
        ],

        "disadvantages": [
            "Requires carefully designed quantum circuits."
        ],

        "limitations": [
            "Noise can destroy the desired interference pattern."
        ],

        "real_world_examples": [
            "Grover's algorithm",
            "Quantum Fourier Transform"
        ],

        "applications": [
            "Quantum algorithms",
            "Quantum simulation",
            "Signal and phase processing"
        ],

        "classical_comparison": (
            "Quantum interference acts on probability amplitudes rather "
            "than directly adding classical probabilities."
        ),

        "mathematical_explanation": (
            "If amplitudes have opposite signs or phases, they can partially "
            "or completely cancel. Matching phases can reinforce amplitudes."
        ),

        "example": (
            "In Grover's algorithm, repeated amplitude amplification increases "
            "the probability of measuring the marked state."
        ),

        "common_misconceptions": [
            "Interference does not mean that quantum probabilities become negative.",
            "It is the amplitudes that can have signs or complex phases."
        ],

        "related_topics": [
            "Superposition",
            "Phase",
            "Grover",
            "Hadamard"
        ]
    }
}


# ============================================================
# KEYWORDS
# ============================================================

KEYWORDS = {

    "quantum computing": [
        "quantum computing",
        "quantum computer",
        "quantum computation",
        "what is quantum computing",
        "what is quantum computer"
    ],

    "qubit": [
        "qubit",
        "quantum bit",
        "quantum bits",
        "what is a qubit"
    ],

    "superposition": [
        "superposition",
        "quantum superposition"
    ],

    "measurement": [
        "measurement",
        "measure",
        "measuring",
        "quantum measurement"
    ],

    "entanglement": [
        "entanglement",
        "quantum entanglement"
    ],

    "hadamard": [
        "hadamard",
        "hadamard gate",
        "h gate"
    ],

    "pauli x": [
        "pauli x",
        "pauli-x",
        "x gate",
        "x gate quantum"
    ],

    "pauli y": [
        "pauli y",
        "pauli-y",
        "y gate",
        "y gate quantum"
    ],

    "pauli z": [
        "pauli z",
        "pauli-z",
        "z gate",
        "z gate quantum"
    ],

    "cnot": [
        "cnot",
        "controlled not",
        "controlled-not",
        "controlled not gate"
    ],

    "grover": [
        "grover",
        "grover algorithm",
        "grover's algorithm",
        "quantum search"
    ],

    "shor": [
        "shor",
        "shor algorithm",
        "shor's algorithm"
    ],

    "quantum teleportation": [
        "quantum teleportation",
        "teleportation"
    ],

    "bell state": [
        "bell state",
        "bell states",
        "bell pair"
    ],

    "phase": [
        "phase",
        "quantum phase",
        "relative phase"
    ],

    "interference": [
        "interference",
        "quantum interference"
    ]
}


# ============================================================
# FIND TOPIC
# ============================================================

def find_topic(question: str):
    """
    Identify the most relevant topic from the question.
    """

    if not question:
        return None

    text = question.lower().strip()

    # Exact topic checks first
    for topic in KNOWLEDGE_BASE:

        if topic in text:
            return topic

    # Keyword checks
    for topic, keywords in KEYWORDS.items():

        for keyword in keywords:

            if keyword in text:
                return topic

    return None


# ============================================================
# GET KNOWLEDGE
# ============================================================

def get_knowledge(topic: str):
    """
    Return knowledge for a topic.
    """

    if not topic:
        return None

    return KNOWLEDGE_BASE.get(topic.lower().strip())


# ============================================================
# SEARCH KNOWLEDGE
# ============================================================

def search_knowledge(question: str):
    """
    Search the knowledge base using a natural-language question.
    """

    topic = find_topic(question)

    if topic is None:
        return None

    return get_knowledge(topic)


# ============================================================
# AVAILABLE TOPICS
# ============================================================

def get_available_topics():
    """
    Return a list of available Quantum Computing topics.
    """

    return [
        knowledge["title"]
        for knowledge in KNOWLEDGE_BASE.values()
    ]


__all__ = [
    "KNOWLEDGE_BASE",
    "KEYWORDS",
    "find_topic",
    "get_knowledge",
    "search_knowledge",
    "get_available_topics",
]