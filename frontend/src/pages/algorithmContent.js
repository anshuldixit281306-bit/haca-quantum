const algorithmContent = {
  deutsch: {
    id: "deutsch",
    name: "Deutsch-Jozsa Algorithm",
    category: "Foundations",
    difficulty: "Beginner",
    overview:
      "The Deutsch-Jozsa algorithm determines whether a hidden Boolean function is constant or balanced using quantum computation.",
    intuition:
      "The algorithm uses superposition, an oracle and interference to learn the property of a hidden function.",
    learningObjectives: [
      "Understand quantum parallelism",
      "Understand the oracle",
      "Understand Hadamard gates",
      "Understand quantum interference",
    ],
    steps: [
      {
        title: "Prepare the qubits",
        description:
          "Initialize the input qubits and auxiliary qubit.",
      },
      {
        title: "Create superposition",
        description:
          "Apply Hadamard gates to create a superposition of possible inputs.",
      },
      {
        title: "Apply the oracle",
        description:
          "The oracle encodes information about the hidden function.",
      },
      {
        title: "Apply Hadamard gates",
        description:
          "Interference transforms the phase information into measurable information.",
      },
      {
        title: "Measure",
        description:
          "The measurement tells us whether the function is constant or balanced.",
      },
    ],
    mathematics:
      "The oracle implements U_f|x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩.",
    example:
      "For a constant function, the input register can produce the all-zero state in the ideal algorithm.",
    circuit: [
      "Input     ── H ── Oracle ── H ── Measure",
      "Auxiliary ── H ── Oracle ─────────────",
    ],
    classicalComparison:
      "A deterministic classical approach may require multiple oracle evaluations, while Deutsch-Jozsa uses one oracle query under the problem's promise.",
    applications: [
      "Quantum algorithm education",
      "Quantum parallelism",
      "Phase kickback",
      "Quantum interference",
    ],
    limitations: [
      "The algorithm depends on the constant-or-balanced promise.",
      "The oracle must be implemented as a quantum circuit.",
    ],
    simulatorNote:
      "Try Hadamard gates and basic quantum operations in the QuantumLearn Circuit Simulator.",
  },

  grover: {
    id: "grover",
    name: "Grover's Algorithm",
    category: "Search",
    difficulty: "Intermediate",
    overview:
      "Grover's algorithm searches an unsorted space using amplitude amplification.",
    intuition:
      "The algorithm starts with many possibilities in superposition and repeatedly increases the probability of the desired state.",
    learningObjectives: [
      "Understand quantum search",
      "Understand amplitude amplification",
      "Understand the oracle",
      "Understand the diffusion operator",
    ],
    steps: [
      {
        title: "Create superposition",
        description:
          "Hadamard gates create an approximately equal superposition.",
      },
      {
        title: "Mark the target",
        description:
          "The oracle marks the desired state by changing its phase.",
      },
      {
        title: "Apply diffusion",
        description:
          "The diffusion operator increases the target state's amplitude.",
      },
      {
        title: "Repeat",
        description:
          "Oracle and diffusion operations are repeated.",
      },
      {
        title: "Measure",
        description:
          "The target state has a high probability of being observed.",
      },
    ],
    mathematics:
      "For one marked item among N states, Grover's algorithm requires approximately (π/4)√N oracle queries.",
    example:
      "For 16 possible states, the ideal query complexity is approximately proportional to √16 = 4.",
    circuit: [
      "Initialize ── H ── Oracle ── Diffusion ── Measure",
    ],
    classicalComparison:
      "Classical exhaustive search has O(N) query complexity, while Grover's algorithm provides O(√N) query complexity.",
    applications: [
      "Unstructured search",
      "Combinatorial search",
      "Amplitude amplification",
    ],
    limitations: [
      "The speedup is quadratic.",
      "An efficient oracle is required.",
      "Noise affects practical quantum hardware.",
    ],
    simulatorNote:
      "Experiment with Hadamard gates and controlled operations in the simulator.",
  },

  shor: {
    id: "shor",
    name: "Shor's Algorithm",
    category: "Cryptography",
    difficulty: "Advanced",
    overview:
      "Shor's algorithm is a quantum algorithm for integer factorization.",
    intuition:
      "Shor's algorithm converts factorization into a period-finding problem and uses the Quantum Fourier Transform.",
    learningObjectives: [
      "Understand factorization",
      "Understand modular arithmetic",
      "Understand period finding",
      "Understand QFT",
    ],
    steps: [
      {
        title: "Choose a number",
        description:
          "Select the integer that needs to be factored.",
      },
      {
        title: "Choose a suitable value",
        description:
          "Choose a value relatively prime to the number.",
      },
      {
        title: "Find the period",
        description:
          "Use quantum computation to determine the period of a modular function.",
      },
      {
        title: "Apply QFT",
        description:
          "The Quantum Fourier Transform helps extract period information.",
      },
      {
        title: "Classical processing",
        description:
          "Use classical mathematics to obtain the factors.",
      },
    ],
    mathematics:
      "The algorithm searches for a period r satisfying a^r ≡ 1 (mod N).",
    example:
      "For small composite numbers such as 15, period finding can be used to obtain useful factors.",
    circuit: [
      "Control register ── H ── QFT† ── Measure",
      "Target register  ── Modular exponentiation",
    ],
    classicalComparison:
      "Shor's algorithm provides a polynomial-time quantum approach to integer factorization.",
    applications: [
      "Cryptography research",
      "Quantum computing research",
      "Post-quantum security planning",
    ],
    limitations: [
      "Cryptographically relevant instances require large fault-tolerant quantum computers.",
      "Quantum error correction creates substantial resource requirements.",
    ],
    simulatorNote:
      "The current QuantumLearn simulator is not a full implementation of Shor's algorithm.",
  },

  teleportation: {
    id: "teleportation",
    name: "Quantum Teleportation",
    category: "Communication",
    difficulty: "Intermediate",
    overview:
      "Quantum teleportation transfers an unknown quantum state using entanglement and classical communication.",
    intuition:
      "Teleportation transfers quantum-state information without physically transporting the original particle.",
    learningObjectives: [
      "Understand entanglement",
      "Understand Bell states",
      "Understand measurement",
      "Understand classical communication",
    ],
    steps: [
      {
        title: "Prepare the unknown state",
        description:
          "Alice prepares the quantum state that will be transferred.",
      },
      {
        title: "Create entanglement",
        description:
          "Alice and Bob share an entangled pair.",
      },
      {
        title: "Perform Bell measurement",
        description:
          "Alice performs operations and measures her qubits.",
      },
      {
        title: "Send classical information",
        description:
          "The measurement results are sent to Bob.",
      },
      {
        title: "Apply corrections",
        description:
          "Bob applies X and/or Z corrections.",
      },
    ],
    mathematics:
      "An unknown state can be represented as |ψ⟩ = α|0⟩ + β|1⟩.",
    example:
      "The quantum state is reconstructed on Bob's qubit using entanglement and classical measurement results.",
    circuit: [
      "Alice ── CNOT ── H ── Measure",
      "Bell  ── CNOT ─────── Measure",
      "Bob   ─────────────── X/Z correction",
    ],
    classicalComparison:
      "An unknown quantum state cannot be perfectly copied because of the no-cloning principle.",
    applications: [
      "Quantum communication",
      "Quantum networks",
      "Quantum repeaters",
      "Distributed quantum computing",
    ],
    limitations: [
      "An entangled pair is required.",
      "Classical communication is required.",
      "The original state is destroyed during measurement.",
    ],
    simulatorNote:
      "Study Hadamard, CNOT, measurement and Bell states before teleportation.",
  },

  bernstein: {
    id: "bernstein",
    name: "Bernstein-Vazirani Algorithm",
    category: "Foundations",
    difficulty: "Beginner",
    overview:
      "The Bernstein-Vazirani algorithm finds a hidden binary string using a quantum oracle.",
    intuition:
      "Superposition and phase kickback allow the hidden string to be recovered efficiently.",
    learningObjectives: [
      "Understand hidden-string problems",
      "Understand phase kickback",
      "Understand superposition",
      "Interpret measurement",
    ],
    steps: [
      {
        title: "Prepare the state",
        description:
          "Initialize the input and auxiliary qubits.",
      },
      {
        title: "Create superposition",
        description:
          "Apply Hadamard gates.",
      },
      {
        title: "Apply the oracle",
        description:
          "The oracle encodes the hidden string into phase.",
      },
      {
        title: "Interference",
        description:
          "Apply Hadamard gates again.",
      },
      {
        title: "Measure",
        description:
          "The measurement reveals the hidden string.",
      },
    ],
    mathematics:
      "The oracle computes f_s(x) = s · x mod 2.",
    example:
      "If the hidden string is s = 101, the ideal final measurement returns 101.",
    circuit: [
      "Input   ── H ── Oracle ── H ── Measure",
      "Ancilla ── H ── Oracle",
    ],
    classicalComparison:
      "A classical deterministic strategy needs multiple oracle queries, while the quantum algorithm can recover the hidden string with one oracle query.",
    applications: [
      "Quantum algorithm education",
      "Oracle problems",
      "Phase kickback",
    ],
    limitations: [
      "The oracle must follow the Bernstein-Vazirani problem structure.",
    ],
    simulatorNote:
      "Learn Hadamard gates and phase kickback before studying this algorithm.",
  },

  qft: {
    id: "qft",
    name: "Quantum Fourier Transform",
    category: "Core",
    difficulty: "Advanced",
    overview:
      "The Quantum Fourier Transform is the quantum analogue of the discrete Fourier transform.",
    intuition:
      "QFT transforms quantum amplitudes and phases and helps reveal periodic information.",
    learningObjectives: [
      "Understand Fourier transform concepts",
      "Understand phase",
      "Learn controlled rotations",
      "Understand QFT circuits",
    ],
    steps: [
      {
        title: "Prepare the state",
        description:
          "Start with a quantum register.",
      },
      {
        title: "Apply Hadamard gates",
        description:
          "Create superposition on individual qubits.",
      },
      {
        title: "Apply controlled rotations",
        description:
          "Introduce phase relationships between qubits.",
      },
      {
        title: "Reverse qubit order",
        description:
          "Swap qubits as required by the circuit construction.",
      },
      {
        title: "Use the transformed state",
        description:
          "Use the result inside a larger quantum algorithm.",
      },
    ],
    mathematics:
      "For N = 2^n states, QFT maps |x⟩ to (1/√N) Σ_y exp(2πixy/N)|y⟩.",
    example:
      "QFT can transform periodic quantum information into a form where frequency information becomes easier to identify.",
    circuit: [
      "q0 ── H ── controlled-R ── swap",
      "q1 ───── H ── controlled-R",
      "q2 ───────── H ── controlled-R",
    ],
    classicalComparison:
      "A classical FFT requires O(N log N) operations, while a QFT circuit can be constructed using O(n²) gates for n qubits.",
    applications: [
      "Shor's algorithm",
      "Quantum phase estimation",
      "Period finding",
    ],
    limitations: [
      "Reading the complete transformed state is not generally efficient.",
      "Controlled rotations are challenging on noisy hardware.",
    ],
    simulatorNote:
      "Learn Hadamard, phase and controlled operations before studying QFT.",
  },
};

export default algorithmContent;