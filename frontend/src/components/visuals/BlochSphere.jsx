/**
 * <BlochSphere /> — SVG Bloch sphere driven by REAL simulation data.
 *
 * Props:
 *   coords — { x, y, z } for one qubit (from statevector.bloch_coordinates)
 *   label  — qubit label, e.g. "q0"
 *
 * The state vector eases toward its target with requestAnimationFrame,
 * so applying a gate visibly "moves" the state on the sphere.
 */

import { useSmoothVector } from "./visualPrimitives";
import "./visualStyles.css";

const R = 84;
const CX = 110;
const CY = 112;

function clampCoord(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(-1, Math.min(1, n));
}

export default function BlochSphere({ coords, label = "q0" }) {
  const target = {
    x: clampCoord(coords?.x),
    y: clampCoord(coords?.y),
    z: clampCoord(coords?.z),
  };

  const vector = useSmoothVector(target);

  const tipX = CX + vector.x * R;
  const tipY = CY - vector.z * R;
  // Simple depth cue: +y (towards viewer) renders brighter and thicker.
  const depth = (vector.y + 1) / 2;

  const magnitude = Math.sqrt(
    vector.x * vector.x + vector.y * vector.y + vector.z * vector.z
  );

  return (
    <div className="ql-bloch-wrap">
      <div className="ql-bloch">
        <svg viewBox="0 0 220 240" width="100%" role="img" aria-label={`Bloch sphere for ${label}`}>
          <defs>
            <radialGradient id="ql-bloch-shade" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="rgba(94,234,212,0.28)" />
              <stop offset="70%" stopColor="rgba(11,16,36,0.55)" />
              <stop offset="100%" stopColor="rgba(11,16,36,0.85)" />
            </radialGradient>
          </defs>

          {/* Sphere body */}
          <circle cx={CX} cy={CY} r={R} fill="url(#ql-bloch-shade)" stroke="rgba(94,234,212,0.45)" strokeWidth="1.4" />

          {/* Equator */}
          <ellipse cx={CX} cy={CY} rx={R} ry={R * 0.3} fill="none" stroke="rgba(94,234,212,0.35)" strokeDasharray="4 5" />

          {/* Axes */}
          <line x1={CX} y1={CY - R - 14} x2={CX} y2={CY + R + 14} stroke="rgba(94,234,212,0.35)" />
          <line x1={CX - R - 12} y1={CY} x2={CX + R + 12} y2={CY} stroke="rgba(94,234,212,0.35)" />

          {/* Axis labels */}
          <text x={CX} y={CY - R - 18} textAnchor="middle">|0⟩</text>
          <text x={CX} y={CY + R + 26} textAnchor="middle">|1⟩</text>
          <text x={CX + R + 14} y={CY + 4} textAnchor="start">x</text>

          {/* State vector */}
          <line
            className="ql-bloch-vector"
            x1={CX}
            y1={CY}
            x2={tipX}
            y2={tipY}
            stroke="#5eead4"
            strokeWidth={1.6 + depth * 1.6}
            strokeLinecap="round"
            opacity={0.35 + depth * 0.65}
            style={{ filter: "drop-shadow(0 0 6px rgba(94,234,212,0.8))" }}
          />
          <circle
            className="ql-bloch-vector"
            cx={tipX}
            cy={tipY}
            r="6"
            fill="#5eead4"
            opacity={0.45 + depth * 0.55}
            style={{ filter: "drop-shadow(0 0 8px rgba(94,234,212,0.9))" }}
          />

          <text x={CX} y={228} textAnchor="middle" fill="#a3adcf" fontSize="11">
            {`⟨${label}⟩ |ψ⟩ • |v| = ${magnitude.toFixed(2)}`}
          </text>
        </svg>
      </div>

      <div className="ql-bloch-readout">
        <span><b>x</b> = {vector.x.toFixed(3)}</span>
        <span><b>y</b> = {vector.y.toFixed(3)}</span>
        <span><b>z</b> = {vector.z.toFixed(3)}</span>
        <span className="ql-muted">computed from the real statevector</span>
      </div>
    </div>
  );
}
