/**
 * <ExplorePanel /> — "Pause & Explore" hands-on controls (section 7).
 *
 * Lets the learner tweak gate / qubit / shots and run a REAL simulation
 * through the QuantumLearn quantum engine, then shows the circuit, Bloch
 * sphere, probability chart and measurement histogram for their setup.
 */

import { useState } from "react";
import { simulateRequest } from "./useConceptSimulation";
import {
  ProbabilityChart,
  MeasurementHistogram,
  simulationToProbabilities,
} from "./visualPrimitives";
import QuantumCircuitVisualizer from "./QuantumCircuitVisualizer";
import BlochSphere from "./BlochSphere";
import "./visualStyles.css";

const GATES = ["h", "x", "y", "z", "s", "t"];

export default function ExplorePanel({ segment, onSimulated }) {
  const preset = segment?.simulation || {};
  const presetGates = Array.isArray(preset.gates) ? preset.gates : [];

  const [gate, setGate] = useState(
    (presetGates[0]?.gate || "h").toLowerCase()
  );
  const [qubit, setQubit] = useState(0);
  const [shots, setShots] = useState(preset.shots || 1000);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const numQubits = Math.max(1, Math.min(5, Number(preset.num_qubits) || 1));
  const effectiveQubits = Math.max(numQubits, qubit + 1);

  const run = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await simulateRequest({
        num_qubits: effectiveQubits,
        gates: [{ gate, qubit }],
        shots: Math.max(100, Math.min(20000, Number(shots) || 1000)),
        algorithm: `Lecture explore (${gate.toUpperCase()} on q${qubit})`,
      });

      setResult(data);
      onSimulated?.(data);
    } catch (err) {
      setError(err?.message || "Simulation failed.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ql-panel">
      <p className="ql-panel-title">
        <span className="dot" />
        Explore This Concept — {segment?.title || "custom circuit"}
      </p>

      <div className="ql-explore-grid">
        <div className="ql-explore-controls">
          <div className="ql-explore-field">
            <label htmlFor="ql-explore-gate">Gate</label>
            <select
              id="ql-explore-gate"
              value={gate}
              onChange={(event) => setGate(event.target.value)}
            >
              {GATES.map((option) => (
                <option key={option} value={option}>
                  {option.toUpperCase()}
                  {option === "h" ? " — superposition" : ""}
                  {option === "x" ? " — flip" : ""}
                  {option === "z" ? " — phase flip" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="ql-explore-field">
            <label htmlFor="ql-explore-qubit">Qubit</label>
            <select
              id="ql-explore-qubit"
              value={qubit}
              onChange={(event) => setQubit(Number(event.target.value))}
            >
              {Array.from({ length: Math.max(numQubits, 2) }, (_, index) => (
                <option key={index} value={index}>
                  q{index}
                </option>
              ))}
            </select>
          </div>

          <div className="ql-explore-field">
            <label htmlFor="ql-explore-shots">Shots</label>
            <input
              id="ql-explore-shots"
              type="number"
              min={100}
              max={20000}
              step={100}
              value={shots}
              onChange={(event) => setShots(event.target.value)}
            />
          </div>

          <button
            type="button"
            className="ql-btn ql-btn-primary"
            onClick={run}
            disabled={loading}
          >
            {loading ? "Running…" : "▶ Run Simulation"}
          </button>

          {error ? <span className="ql-muted">⚠ {error}</span> : null}
        </div>

        <div className="ql-explore-results">
          <div className="ql-panel">
            <p className="ql-panel-title">Circuit</p>
            <QuantumCircuitVisualizer
              numQubits={effectiveQubits}
              gates={[{ gate, qubit, column: 0 }]}
              activeColumn={result ? 0 : null}
            />
          </div>

          <div className="ql-panel">
            <p className="ql-panel-title">Bloch sphere</p>
            <BlochSphere
              coords={
                result?.statevector?.bloch_coordinates?.[`q${qubit}`] ||
                result?.bloch_coordinates?.[`q${qubit}`]
              }
              label={`q${qubit}`}
            />
          </div>

          <div className="ql-panel">
            <p className="ql-panel-title">Probabilities</p>
            <ProbabilityChart data={simulationToProbabilities(result, 4)} />
          </div>

          <div className="ql-panel">
            <p className="ql-panel-title">Measurement results</p>
            <MeasurementHistogram counts={result?.counts} />
          </div>
        </div>
      </div>
    </div>
  );
}
