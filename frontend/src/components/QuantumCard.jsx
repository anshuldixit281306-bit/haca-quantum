import {
  ArrowUpRight,
  Atom,
  CircuitBoard,
  Play,
} from "lucide-react";

function QuantumCard({
  type,
  title,
  description,
}) {
  const simulator = type === "simulator";

  return (
    <article
      className={`quantum-card ${
        simulator ? "simulator-card" : "tutor-card"
      }`}
    >
      <div className="card-top">
        <div className="card-icon">
          {simulator ? (
            <CircuitBoard size={21} />
          ) : (
            <Atom size={21} />
          )}
        </div>

        <span>
          {simulator
            ? "QUANTUM SIMULATOR"
            : "INTELLIGENT LEARNING"}
        </span>
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      {simulator ? (
        <div className="circuit-preview">
          <div className="wire">
            <span>q₀</span>
            <b>H</b>
            <i />
            <b>X</b>
            <i />
            <em>M</em>
          </div>

          <div className="wire">
            <span>q₁</span>
            <i />
            <i />
            <b>⊕</b>
            <i />
            <em>M</em>
          </div>
        </div>
      ) : (
        <div className="tutor-preview">
          <div className="tutor-avatar">
            <Atom size={15} />
          </div>

          <div>
            <strong>Quantum AI</strong>
            <span>
              Ask me anything about quantum computing...
            </span>
          </div>
        </div>
      )}

      <button className="card-button">
        {simulator ? "Open simulator" : "Ask AI Tutor"}
        {simulator ? (
          <Play size={14} />
        ) : (
          <ArrowUpRight size={15} />
        )}
      </button>
    </article>
  );
}

export default QuantumCard;