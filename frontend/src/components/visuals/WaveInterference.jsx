/**
 * <WaveInterference /> — pictorial wave view of a single-qubit state.
 *
 * Shows the |0⟩ and |1⟩ amplitude waves and their superposed resultant,
 * computed from REAL statevector amplitudes when available
 * (otherwise from the provided probabilities).
 */

import "./visualStyles.css";

function wavePath(amplitude, phase, yCenter, width, samples = 96) {
  const points = [];
  for (let i = 0; i <= samples; i += 1) {
    const x = (i / samples) * width;
    const y =
      yCenter -
      amplitude * 34 * Math.sin((i / samples) * Math.PI * 4 + phase);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M ${points.join(" L ")}`;
}

export default function WaveInterference({ amplitudes, probabilities }) {
  const width = 360;
  const height = 190;

  let a0 = probabilities?.[0]?.value ?? 0.5;
  let a1 = probabilities?.[1]?.value ?? 0;

  if (amplitudes?.length) {
    const mag0 = Math.abs(amplitudes[0]?.real ?? 0);
    const mag1 = Math.abs(amplitudes[1]?.real ?? 0);
    if (mag0 || mag1) {
      a0 = mag0;
      a1 = mag1;
    }
  }

  const scale = Math.max(a0, a1) || 1;

  return (
    <div className="ql-viz-box" style={{ flexDirection: "column", gap: 8 }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ maxWidth: 430 }}
        role="img"
        aria-label="Wave interference of the qubit state"
      >
        {/* |0> wave */}
        <path
          d={wavePath(a0 / scale, 0, 55, width)}
          fill="none"
          stroke="#5eead4"
          strokeWidth="2.4"
          opacity="0.9"
          strokeDasharray="6 4"
          style={{ animation: "ql-dash-flow 1.6s linear infinite" }}
        />
        {/* |1> wave */}
        <path
          d={wavePath(a1 / scale, Math.PI / 2, 55, width)}
          fill="none"
          stroke="#34d399"
          strokeWidth="2.4"
          opacity="0.9"
          strokeDasharray="6 4"
          style={{ animation: "ql-dash-flow 1.6s linear infinite reverse" }}
        />
        {/* Resultant */}
        <path
          d={wavePath(
            Math.sqrt(a0 * a0 + a1 * a1) / scale,
            Math.atan2(a1, a0),
            140,
            width
          )}
          fill="none"
          stroke="#a7f3d0"
          strokeWidth="3.2"
          style={{ filter: "drop-shadow(0 0 6px rgba(94,234,212,0.8))" }}
        />

        <text x="8" y="20" fill="#a3adcf" fontSize="11">|0⟩ wave (α)</text>
        <text x="8" y="98" fill="#34d399" fontSize="11">|1⟩ wave (β)</text>
        <text x="8" y="182" fill="#a7f3d0" fontSize="11">resultant |ψ⟩</text>
      </svg>

      <span className="ql-formula">
        |ψ⟩ = {(a0).toFixed(2)}|0⟩ {(a1 >= 0 ? "+" : "−")} {Math.abs(a1).toFixed(2)}|1⟩
      </span>
      <span className="ql-muted">
        amplitudes read from the real statevector — the waves add up to the
        state you measure
      </span>
    </div>
  );
}
