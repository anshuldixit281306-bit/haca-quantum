import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Lightbulb,
  Play,
  Target,
} from "lucide-react";

import algorithmContent from "./algorithmContent";
import "./AlgorithmDetail.css";

function AlgorithmDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const algorithm = algorithmContent[id];

  if (!algorithm) {
    return (
      <main className="algorithm-detail-page">
        <div className="algorithm-detail-not-found">
          <BookOpen size={32} />
          <h1>Algorithm not found</h1>
          <p>The requested learning material is not available.</p>
          <button type="button" onClick={() => navigate("/algorithms")}>
            Back to Algorithms
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="algorithm-detail-page">
      <header className="algorithm-detail-header">
        <div className="algorithm-detail-header-inner">
          <Link to="/algorithms" className="algorithm-detail-back">
            <ArrowLeft size={17} />
            Algorithms
          </Link>

          <Link to="/dashboard" className="algorithm-detail-logo">
            QuantumLearn
          </Link>

          <span className="algorithm-detail-level">
            {algorithm.difficulty}
          </span>
        </div>
      </header>

      <div className="algorithm-detail-container">
        <section className="algorithm-detail-hero">
          <div className="algorithm-detail-kicker">
            {algorithm.category} · LEARNING MODULE
          </div>

          <h1>{algorithm.name}</h1>

          <p>{algorithm.overview}</p>

          <div className="algorithm-detail-actions">
            <Link to="/simulator" className="detail-primary-button">
              <Play size={16} />
              Try in Simulator
            </Link>

            <button
              type="button"
              className="detail-secondary-button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <BookOpen size={16} />
              Study Material
            </button>
          </div>
        </section>

        <section className="algorithm-detail-grid">
          <article className="detail-main-column">
            <section className="detail-card">
              <div className="detail-card-heading">
                <div className="detail-heading-icon">
                  <Lightbulb size={19} />
                </div>

                <div>
                  <span>START HERE</span>
                  <h2>Understand the idea</h2>
                </div>
              </div>

              <p className="detail-intuition">{algorithm.intuition}</p>
            </section>

            <section className="detail-card">
              <div className="detail-card-heading">
                <div className="detail-heading-icon">
                  <Target size={19} />
                </div>

                <div>
                  <span>LEARNING OBJECTIVES</span>
                  <h2>What you will learn</h2>
                </div>
              </div>

              <div className="learning-objectives">
                {algorithm.learningObjectives.map((objective) => (
                  <div key={objective} className="objective-item">
                    <CheckCircle2 size={17} />
                    <span>{objective}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="detail-card">
              <div className="detail-card-heading">
                <div className="detail-heading-icon">
                  <ArrowRight size={19} />
                </div>

                <div>
                  <span>STEP BY STEP</span>
                  <h2>How the algorithm works</h2>
                </div>
              </div>

              <div className="algorithm-steps">
                {algorithm.steps.map((step, index) => (
                  <div className="algorithm-step" key={step.title}>
                    <div className="step-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="step-content">
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="detail-card">
              <div className="detail-card-heading">
                <div className="detail-heading-icon">
                  <Code2 size={19} />
                </div>

                <div>
                  <span>QUANTUM CIRCUIT</span>
                  <h2>Circuit idea</h2>
                </div>
              </div>

              <div className="circuit-learning-box">
                {algorithm.circuit.map((line) => (
                  <code key={line}>{line}</code>
                ))}
              </div>

              <p className="detail-note">
                This circuit representation is an educational view of the
                algorithm's main operations. Complex algorithms may require
                additional gates and registers in a complete implementation.
              </p>
            </section>

            <section className="detail-card">
              <div className="detail-card-heading">
                <div className="detail-heading-icon">
                  <BookOpen size={19} />
                </div>

                <div>
                  <span>MATHEMATICAL VIEW</span>
                  <h2>Core mathematics</h2>
                </div>
              </div>

              <p>{algorithm.mathematics}</p>
            </section>

            <section className="detail-card">
              <div className="detail-card-heading">
                <div className="detail-heading-icon">
                  <Lightbulb size={19} />
                </div>

                <div>
                  <span>EXAMPLE</span>
                  <h2>Worked intuition</h2>
                </div>
              </div>

              <p>{algorithm.example}</p>
            </section>

            <section className="detail-card">
              <div className="detail-card-heading">
                <div className="detail-heading-icon">
                  <Target size={19} />
                </div>

                <div>
                  <span>CLASSICAL VS QUANTUM</span>
                  <h2>Why it matters</h2>
                </div>
              </div>

              <p>{algorithm.classicalComparison}</p>
            </section>
          </article>

          <aside className="detail-side-column">
            <section className="detail-side-card">
              <span className="side-card-label">APPLICATIONS</span>

              <div className="side-list">
                {algorithm.applications.map((item) => (
                  <div key={item}>
                    <CheckCircle2 size={15} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="detail-side-card">
              <span className="side-card-label">LIMITATIONS</span>

              <div className="side-list limitation-list">
                {algorithm.limitations.map((item) => (
                  <div key={item}>
                    <span className="limitation-dot" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="detail-side-card simulator-side-card">
              <span className="side-card-label">QUANTUMLEARN LAB</span>

              <h3>Ready to experiment?</h3>

              <p>{algorithm.simulatorNote}</p>

              <Link to="/simulator">
                Open Circuit Simulator
                <ArrowRight size={15} />
              </Link>
            </section>
          </aside>
        </section>
      </div>

      <nav className="algorithm-detail-navigation">
        <Link to="/dashboard">Home</Link>
        <Link to="/learn">Learn</Link>
        <Link to="/ai-tutor">AI Tutor</Link>
        <Link to="/simulator">Simulator</Link>
        <Link to="/progress">Progress</Link>
      </nav>
    </main>
  );
}

export default AlgorithmDetail;