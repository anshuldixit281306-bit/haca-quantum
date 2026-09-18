/**
 * <QuantumStateVisualizer /> — the pictorial heart of the lecture player.
 *
 * Maps a segment's `visualization` key to an interactive, animated visual
 * built from REAL simulation data (`sim` = POST /api/quantum/simulate
 * response). Every prop is structured data — nothing lecture-specific is
 * hard-coded here.
 */

import {
  ProbabilityChart,
  MeasurementHistogram,
  AmplitudeChart,
  simulationToProbabilities,
} from "./visualPrimitives";
import QuantumCircuitVisualizer from "./QuantumCircuitVisualizer";
import BlochSphere from "./BlochSphere";
import WaveInterference from "./WaveInterference";
import "./visualStyles.css";

function gateChip(label) {
  return <span className="ql-gate">{label}</span>;
}

/** |0⟩ → [H] → |+⟩ animated flow row. */
function GateFlow({ from, gate, to, note }) {
  return (
    <div className="ql-viz-box">
      <span className="ql-qubit-chip">{from}</span>
      <span className="ql-stage-arrow">→</span>
      {gateChip(gate)}
      <span className="ql-stage-arrow">→</span>
      <span className="ql-qubit-chip" style={{ animationDelay: "0.6s" }}>
        {to}
      </span>
      {note ? <span className="ql-muted">{note}</span> : null}
    </div>
  );
}

function QubitVisual({ sim }) {
  const amps = sim?.statevector?.amplitudes || [];

  return (
    <div style={{ width: "100%" }}>
      <div className="ql-viz-box">
        <span className="ql-qubit-chip">
          <b>0</b>
          <small>bit</small>
        </span>
        <span className="ql-stage-arrow">→</span>
        <span className="ql-qubit-chip">
          <b>|0⟩</b>
          <small>qubit</small>
        </span>
        <span className="ql-qubit-chip" style={{ animationDelay: "1.2s" }}>
          <b>|1⟩</b>
          <small>superposed</small>
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
        <span className="ql-formula">|ψ⟩ = α|0⟩ + β|1⟩</span>
      </div>
      {amps.length ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <AmplitudeChart
            amplitudes={amps.slice(0, 2)}
            caption="Real statevector amplitudes from the Qiskit simulator."
          />
        </div>
      ) : null}
    </div>
  );
}

function SuperpositionVisual({ sim }) {
  const probs = simulationToProbabilities(sim, 4);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
        <span className="ql-formula">|ψ⟩ = α|0⟩ + β|1⟩ , P(x) = |α|²</span>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <ProbabilityChart
          data={probs}
          caption="Probabilities computed from the real statevector — no fake numbers."
        />
      </div>
      <WaveInterference probabilities={probs} amplitudes={sim?.statevector?.amplitudes} />
    </div>
  );
}

function HadamardVisual({ sim }) {
  const probs = simulationToProbabilities(sim, 2);

  return (
    <div style={{ width: "100%" }}>
      <GateFlow
        from="|0⟩"
        gate="H"
        to="|+⟩"
        note="H|0⟩ = (|0⟩ + |1⟩)/√2"
      />
      <QuantumCircuitVisualizer
        numQubits={sim?.num_qubits || 1}
        gates={sim?.gate_sequence?.map((g, i) => ({ ...g, column: i })) || []}
        activeColumn={sim?.gate_sequence?.length ? sim.gate_sequence.length - 1 : null}
      />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <ProbabilityChart
          data={probs}
          caption="After H, both outcomes are equally likely — measured on the real simulator."
        />
      </div>
    </div>
  );
}

function MeasurementVisual({ sim }) {
  const probs = simulationToProbabilities(sim, 2);
  const collapsed = sim?.most_frequent_state;

  return (
    <div style={{ width: "100%" }}>
      <div className="ql-viz-box">
        <span className="ql-qubit-chip">
          <b>|ψ⟩</b>
          <small>α|0⟩+β|1⟩</small>
        </span>
        <span className="ql-stage-arrow">→</span>
        {gateChip("M")}
        <span className="ql-stage-arrow">→</span>
        <span className="ql-qubit-chip" style={{ animationDelay: "0.5s" }}>
          <b>{collapsed ? `|${collapsed}⟩` : "|?⟩"}</b>
          <small>collapsed</small>
        </span>
      </div>
      <MeasurementHistogram
        counts={sim?.counts}
        highlight={collapsed}
        caption={`Real measurement shots (${sim?.shots ?? "—"}). The state collapsed to |${collapsed ?? "?"}⟩ this run.`}
      />
      {probs.length ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
          <ProbabilityChart data={probs} />
        </div>
      ) : null}
    </div>
  );
}

function EntanglementVisual({ sim }) {
  const probs = simulationToProbabilities(sim, 4);

  return (
    <div style={{ width: "100%" }}>
      <div className="ql-viz-box">
        <span className="ql-qubit-chip">
          <b>q0</b>
          <small>H</small>
        </span>
        <span className="ql-ent-link" />
        <span className="ql-qubit-chip" style={{ animationDelay: "0.8s" }}>
          <b>q1</b>
          <small>CX</small>
        </span>
      </div>
      <p className="ql-viz-caption" style={{ textAlign: "center" }}>
        The dashed link is the entanglement: measuring one qubit instantly
        tells you the other. Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2.
      </p>
      <QuantumCircuitVisualizer
        numQubits={sim?.num_qubits || 2}
        gates={sim?.gate_sequence?.map((g, i) => ({ ...g, column: i })) || []}
        activeColumn={sim?.gate_sequence?.length ? sim.gate_sequence.length - 1 : null}
      />
      {probs.length ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ProbabilityChart
            data={probs}
            caption="Only |00⟩ and |11⟩ occur — perfect correlation from real shots."
          />
        </div>
      ) : null}
    </div>
  );
}

function CnotVisual({ sim }) {
  return (
    <div style={{ width: "100%" }}>
      <div className="ql-viz-box">
        <span className="ql-qubit-chip">
          <b>•</b>
          <small>control q0</small>
        </span>
        <span className="ql-stage-arrow">→</span>
        <span className="ql-qubit-chip">
          <b>⊕</b>
          <small>target q1</small>
        </span>
      </div>
      <p className="ql-viz-caption" style={{ textAlign: "center" }}>
        CNOT flips the target only when the control is |1⟩ — the classic
        two-qubit gate that builds entanglement.
      </p>
      <QuantumCircuitVisualizer
        numQubits={sim?.num_qubits || 2}
        gates={sim?.gate_sequence?.map((g, i) => ({ ...g, column: i })) || []}
        activeColumn={sim?.gate_sequence?.length ? sim.gate_sequence.length - 1 : null}
      />
    </div>
  );
}

const GATE_NOTES = {
  H: "Hadamard — creates superposition",
  X: "Pauli-X — quantum NOT, flips |0⟩ ↔ |1⟩",
  Y: "Pauli-Y — flip with phase",
  Z: "Pauli-Z — phase flip on |1⟩",
  S: "S gate — quarter turn phase",
  T: "T gate — eighth turn phase",
  CX: "CNOT — controlled flip",
};

function GatesVisual({ sim }) {
  const sequence = sim?.gate_sequence || [];

  return (
    <div style={{ width: "100%" }}>
      <div className="ql-pill-row" style={{ justifyContent: "center", marginBottom: 12 }}>
        {Object.keys(GATE_NOTES).map((gate, index) => (
          <span
            key={gate}
            className="ql-badge"
            title={GATE_NOTES[gate]}
            style={{ animation: "ql-pop 0.4s ease-out both", animationDelay: `${index * 90}ms` }}
          >
            {gate}
          </span>
        ))}
      </div>
      {sequence.length ? (
        <QuantumCircuitVisualizer
          numQubits={sim?.num_qubits || 2}
          gates={sequence.map((g, i) => ({ ...g, column: i }))}
        />
      ) : (
        <p className="ql-muted" style={{ textAlign: "center" }}>
          Run the simulation to see this gate applied to the circuit.
        </p>
      )}
    </div>
  );
}

function BlochVisual({ sim }) {
  const bloch =
    sim?.statevector?.bloch_coordinates?.q0 ||
    sim?.bloch_coordinates?.q0;

  return (
    <div style={{ width: "100%" }}>
      <BlochSphere coords={bloch} label="q0" />
      <p className="ql-viz-caption" style={{ textAlign: "center" }}>
        |0⟩ is the north pole, |1⟩ the south pole — superpositions live
        around the equator. Coordinates come from the real statevector.
      </p>
    </div>
  );
}

function ExplanationVisual({ segment }) {
  return (
    <div className="ql-viz-box" style={{ flexDirection: "column", gap: 14 }}>
      <span className="ql-formula">{segment?.title || "Concept"}</span>
      <p className="ql-viz-caption" style={{ maxWidth: 460, textAlign: "center" }}>
        {segment?.explanation ||
          "This concept is explained in the video. Run the simulation below to explore it hands-on."}
      </p>
    </div>
  );
}

const VISUALS = {
  qubit: QubitVisual,
  superposition: SuperpositionVisual,
  hadamard: HadamardVisual,
  measurement: MeasurementVisual,
  entanglement: EntanglementVisual,
  bell: EntanglementVisual,
  cnot: CnotVisual,
  cx: CnotVisual,
  gates: GatesVisual,
  bloch: BlochVisual,
  states: QubitVisual,
  statevector: QubitVisual,
  wave: SuperpositionVisual,
  probability: SuperpositionVisual,
  histogram: MeasurementVisual,
};

export default function QuantumStateVisualizer({
  type,
  segment,
  sim,
  loading,
  error,
  onRetry,
}) {
  const Visual = VISUALS[type] || ExplanationVisual;

  if (loading) {
    return (
      <div className="ql-viz-box" style={{ flexDirection: "column", gap: 12 }}>
        <div className="loading-spinner" />
        <span className="ql-muted">Simulating on the Qiskit backend…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ql-viz-box" style={{ flexDirection: "column", gap: 12 }}>
        <span className="ql-muted">⚠ {error}</span>
        <button type="button" className="ql-btn" onClick={onRetry}>
          Retry simulation
        </button>
      </div>
    );
  }

  return (
    <div className="ql-concept-anim" key={`${type}-${segment?.concept}`}>
      <Visual segment={segment} sim={sim} />
    </div>
  );
}
