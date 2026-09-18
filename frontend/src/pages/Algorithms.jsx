import {
  ArrowRight,
  Search,
  Shield,
  Zap,
  BrainCircuit,
  Code2,
  Clock3,
  Atom,
  Sparkles,
  Target,
  Layers3,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import "./Algorithms.css";

const algorithms = [
  {
    id: "grover",
    name: "Grover's Algorithm",
    category: "Search",
    difficulty: "Intermediate",
    level: "02",
    icon: Search,
    color: "purple",
    time: "O(√N)",
    description:
      "Search an unsorted space with a quadratic quantum speedup using amplitude amplification.",
    concepts: ["Oracle", "Amplitude Amplification", "Superposition"],
  },
  {
    id: "shor",
    name: "Shor's Algorithm",
    category: "Cryptography",
    difficulty: "Advanced",
    level: "04",
    icon: Shield,
    color: "blue",
    time: "Polynomial",
    description:
      "Factor large integers efficiently and understand why quantum computing challenges classical cryptography.",
    concepts: ["QFT", "Period Finding", "Modular Arithmetic"],
  },
  {
    id: "deutsch",
    name: "Deutsch-Jozsa",
    category: "Foundations",
    difficulty: "Beginner",
    level: "01",
    icon: Atom,
    color: "cyan",
    time: "O(1)",
    description:
      "Discover quantum parallelism through one of the foundational algorithms in quantum computing.",
    concepts: ["Superposition", "Oracle", "Hadamard Gate"],
  },
  {
    id: "teleportation",
    name: "Quantum Teleportation",
    category: "Communication",
    difficulty: "Intermediate",
    level: "03",
    icon: Zap,
    color: "orange",
    time: "3 Qubits",
    description:
      "Transfer an unknown quantum state using entanglement, measurement and classical communication.",
    concepts: ["Entanglement", "Bell State", "Measurement"],
  },
  {
    id: "bernstein",
    name: "Bernstein-Vazirani",
    category: "Foundations",
    difficulty: "Beginner",
    level: "01",
    icon: BrainCircuit,
    color: "green",
    time: "O(1)",
    description:
      "Identify a hidden binary string with a single oracle query and explore phase kickback.",
    concepts: ["Oracle", "Superposition", "Phase Kickback"],
  },
  {
    id: "qft",
    name: "Quantum Fourier Transform",
    category: "Core",
    difficulty: "Advanced",
    level: "04",
    icon: Code2,
    color: "pink",
    time: "O(log²N)",
    description:
      "Explore the quantum analogue of the Fourier transform and its role in advanced algorithms.",
    concepts: ["Phase", "Hadamard", "Controlled Rotations"],
  },
];

const categories = [
  "All",
  "Foundations",
  "Search",
  "Communication",
  "Cryptography",
  "Core",
];

function Algorithms() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");

  const filteredAlgorithms = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return algorithms.filter((algorithm) => {
      const matchesCategory =
        category === "All" || algorithm.category === category;

      const matchesSearch =
        !query ||
        algorithm.name.toLowerCase().includes(query) ||
        algorithm.description.toLowerCase().includes(query) ||
        algorithm.category.toLowerCase().includes(query) ||
        algorithm.concepts.some((concept) =>
          concept.toLowerCase().includes(query)
        );

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, category]);

  return (
    <main className="algorithms-page algorithms-pro">
      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="algorithms-hero-pro">
        <div className="algorithms-hero-content">
          <div className="algorithms-kicker">
            <Sparkles size={13} />
            QUANTUM ALGORITHM EXPLORER
          </div>

          <h1>
            Think in
            <span> quantum.</span>
          </h1>

          <p>
            Explore the algorithms that define quantum computing. Learn the
            intuition, understand the mathematics, and experiment with quantum
            circuits.
          </p>

          <div className="algorithm-hero-actions">
            <button
              type="button"
              className="algorithm-primary-action"
              onClick={() => {
                setCategory("Foundations");
                setSearchTerm("");
                window.scrollTo({
                  top: 650,
                  behavior: "smooth",
                });
              }}
            >
              <Target size={15} />
              Start with Foundations
              <ArrowRight size={14} />
            </button>

            <div className="algorithm-hero-meta">
              <span>
                <Layers3 size={13} />
                {algorithms.length} algorithms
              </span>

              <span>
                <BookProgressIcon />
                Study at your own pace
              </span>
            </div>
          </div>
        </div>

        <div className="algorithm-hero-visual">
          <div className="algorithm-orbit orbit-a" />
          <div className="algorithm-orbit orbit-b" />
          <div className="algorithm-orbit orbit-c" />

          <div className="algorithm-hero-core">
            <Atom size={45} strokeWidth={1.2} />
            <span />
          </div>

          <div className="algorithm-floating-node node-a">
            <Search size={13} />
          </div>

          <div className="algorithm-floating-node node-b">
            <Zap size={13} />
          </div>

          <div className="algorithm-floating-node node-c">
            <Code2 size={13} />
          </div>
        </div>
      </section>

      {/* =====================================================
          LEARNING OVERVIEW
          ===================================================== */}

      <section className="algorithm-overview">
        <div className="algorithm-overview-card">
          <div className="overview-icon purple">
            <Layers3 size={17} />
          </div>

          <div>
            <span>ALGORITHM LIBRARY</span>
            <strong>{algorithms.length}</strong>
          </div>
        </div>

        <div className="algorithm-overview-card">
          <div className="overview-icon cyan">
            <BookOpenIcon />
          </div>

          <div>
            <span>STUDY MATERIAL</span>
            <strong>{algorithms.length}</strong>
          </div>
        </div>

        <div className="algorithm-overview-card">
          <div className="overview-icon orange">
            <Target size={17} />
          </div>

          <div>
            <span>LEARNING LEVELS</span>
            <strong>4</strong>
          </div>
        </div>

        <div className="algorithm-overview-card">
          <div className="overview-icon blue">
            <Zap size={17} />
          </div>

          <div>
            <span>SIMULATOR</span>
            <strong>Ready</strong>
          </div>
        </div>
      </section>

      {/* =====================================================
          TOOLBAR
          ===================================================== */}

      <section className="algorithm-explorer-header">
        <div>
          <div className="explorer-kicker">
            <Atom size={12} />
            EXPLORE
          </div>

          <h2>Quantum algorithm library</h2>

          <p>
            Choose an algorithm and dive into its quantum intuition, steps,
            mathematics and applications.
          </p>
        </div>

        <div className="algorithm-result-count">
          <strong>{filteredAlgorithms.length}</strong>

          <span>
            {filteredAlgorithms.length === 1
              ? "algorithm"
              : "algorithms"}{" "}
            found
          </span>
        </div>
      </section>

      <section className="algorithm-toolbar-pro">
        <div className="algorithm-search-pro">
          <Search size={16} />

          <input
            type="text"
            placeholder="Search algorithms, concepts, categories..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          {searchTerm && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="category-filter-pro">
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* =====================================================
          FEATURED ALGORITHM
          ===================================================== */}

      {category === "All" && !searchTerm && (
        <section className="featured-algorithm">
          <div className="featured-content">
            <div className="featured-badge">
              <Sparkles size={12} />
              RECOMMENDED START
            </div>

            <div className="featured-title-row">
              <div className="featured-icon">
                <Atom size={23} />
              </div>

              <div>
                <span>FOUNDATIONS · BEGINNER</span>
                <h3>Deutsch-Jozsa Algorithm</h3>
              </div>
            </div>

            <p>
              Start here to understand how quantum parallelism, superposition
              and interference work together inside a quantum algorithm.
            </p>

            <div className="featured-tags">
              <span>Superposition</span>
              <span>Oracle</span>
              <span>Hadamard Gate</span>
            </div>

            <Link
              to="/algorithms/deutsch"
              className="featured-button"
            >
              Study Algorithm
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="featured-visual">
            <div className="featured-grid">
              {Array.from({ length: 36 }).map((_, index) => (
                <span key={index} />
              ))}
            </div>

            <div className="featured-circuit-line line-one" />
            <div className="featured-circuit-line line-two" />

            <div className="featured-gate gate-one">H</div>
            <div className="featured-gate gate-two">H</div>
            <div className="featured-gate gate-three">⊕</div>
            <div className="featured-gate gate-four">H</div>
          </div>
        </section>
      )}

      {/* =====================================================
          ALGORITHM GRID
          ===================================================== */}

      <section className="algorithms-section-pro">
        <div className="algorithm-grid-pro">
          {filteredAlgorithms.map((algorithm) => {
            const Icon = algorithm.icon;

            return (
              <article
                className={`algorithm-card-pro ${algorithm.color}`}
                key={algorithm.id}
              >
                <div className="algorithm-card-glow" />

                <div className="algorithm-card-header">
                  <div className="algorithm-card-number">
                    {algorithm.level}
                  </div>

                  <div className="algorithm-icon-pro">
                    <Icon size={20} />
                  </div>

                  <span className="difficulty-pro">
                    {algorithm.difficulty}
                  </span>
                </div>

                <div className="algorithm-card-content-pro">
                  <div className="algorithm-category-pro">
                    {algorithm.category}
                  </div>

                  <h3>{algorithm.name}</h3>

                  <p>{algorithm.description}</p>
                </div>

                <div className="concept-tags-pro">
                  {algorithm.concepts.map((concept) => (
                    <span key={concept}>{concept}</span>
                  ))}
                </div>

                <div className="algorithm-study-info">
                  <CheckCircle2 size={14} />

                  <span>
                    Complete study material available
                  </span>
                </div>

                <div className="algorithm-card-footer-pro">
                  <div className="complexity-pro">
                    <ClockIcon />
                    <span>{algorithm.time}</span>
                  </div>

                  <Link
                    to={`/algorithms/${algorithm.id}`}
                    className="learn-button-pro"
                  >
                    Study
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {filteredAlgorithms.length === 0 && (
          <div className="algorithm-empty-pro">
            <div className="empty-icon">
              <Search size={24} />
            </div>

            <strong>No algorithms found</strong>

            <span>
              Try another search term or select a different category.
            </span>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setCategory("All");
              }}
            >
              Reset explorer
            </button>
          </div>
        )}
      </section>

      {/* =====================================================
          LEARNING PATH
          ===================================================== */}

      <section className="algorithm-learning-path">
        <div className="learning-path-heading">
          <div>
            <div className="explorer-kicker">
              <Target size={12} />
              RECOMMENDED PATH
            </div>

            <h2>Your quantum journey</h2>

            <p>
              Master the fundamentals first, then progress toward advanced
              quantum algorithms.
            </p>
          </div>
        </div>

        <div className="learning-path-track">
          <div className="path-line" />

          <div className="path-step current">
            <div className="path-node">
              <CheckCircle2 size={16} />
            </div>

            <span>01</span>
            <strong>Foundations</strong>
            <small>Qubits & gates</small>
          </div>

          <div className="path-step">
            <div className="path-node">
              <Atom size={16} />
            </div>

            <span>02</span>
            <strong>Core Algorithms</strong>
            <small>Search & transforms</small>
          </div>

          <div className="path-step">
            <div className="path-node">
              <Zap size={16} />
            </div>

            <span>03</span>
            <strong>Applications</strong>
            <small>Communication</small>
          </div>

          <div className="path-step">
            <div className="path-node">
              <Shield size={16} />
            </div>

            <span>04</span>
            <strong>Advanced</strong>
            <small>Cryptography</small>
          </div>
        </div>
      </section>

      {/* =====================================================
          BOTTOM CTA
          ===================================================== */}

      <section className="algorithm-banner-pro">
        <div className="banner-orb">
          <Atom size={22} />
        </div>

        <div className="banner-content">
          <span>QUANTUM LEARNING LAB</span>

          <strong>Ready to experiment?</strong>

          <p>
            Take what you learn here and build it inside the QuantumLearn
            Circuit Simulator.
          </p>
        </div>

        <Link to="/simulator" className="algorithm-banner-button">
          Open Simulator
          <ArrowRight size={15} />
        </Link>
      </section>
    </main>
  );
}

/* =========================================================
   SMALL REUSABLE ICON COMPONENTS
   ========================================================= */

function BookProgressIcon() {
  return (
    <CheckCircle2
      size={13}
      aria-hidden="true"
    />
  );
}

function BookOpenIcon() {
  return (
    <Layers3
      size={17}
      aria-hidden="true"
    />
  );
}

function ClockIcon() {
  return (
    <span className="algorithm-clock-icon">
      <Clock3 size={13} />
    </span>
  );
}

export default Algorithms;

