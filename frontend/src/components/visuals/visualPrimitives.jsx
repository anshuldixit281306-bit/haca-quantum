/**
 * Reusable, data-driven visual primitives for the Interactive Visual
 * Lecture system. Every component accepts structured props (no hard-coded
 * lecture content) and renders real simulation data when provided.
 */

import { useEffect, useRef, useState } from "react";

/** Animated horizontal probability bars. data: [{ label, value, count? }] */
export function ProbabilityChart({ data, caption }) {
  if (!data?.length) {
    return (
      <div className="ql-viz-box">
        <span className="ql-muted">
          Run the simulation to load real probability data.
        </span>
      </div>
    );
  }

  return (
    <div className="ql-prob-chart" role="img" aria-label="Probability chart">
      {data.map((item) => (
        <div className="ql-prob-row" key={item.label}>
          <span className="ql-prob-label">{item.label}</span>
          <span className="ql-prob-track">
            <span
              className="ql-prob-fill"
              style={{ width: `${Math.min(100, Math.max(0, item.value * 100))}%` }}
            />
          </span>
          <span className="ql-prob-value">
            {item.count != null
              ? `${item.count} shots`
              : `${(item.value * 100).toFixed(1)}%`}
          </span>
        </div>
      ))}
      {caption ? <p className="ql-viz-caption">{caption}</p> : null}
    </div>
  );
}

/** Animated measurement histogram from real counts: { "00": 512, ... } */
export function MeasurementHistogram({ counts, highlight, caption }) {
  const entries = Object.entries(counts || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  if (!entries.length) {
    return (
      <div className="ql-viz-box">
        <span className="ql-muted">
          No measurement data yet — run the simulation to collect shots.
        </span>
      </div>
    );
  }

  const max = entries.reduce((m, [, value]) => Math.max(m, value), 1);

  return (
    <div style={{ width: "100%" }}>
      <div className="ql-viz-box" style={{ alignItems: "flex-end" }}>
        <div className="ql-hist">
          {entries.map(([label, count], index) => (
            <div
              className={`ql-hist-col${highlight === label ? " hl" : ""}`}
              key={label}
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <span className="ql-hist-count">{count}</span>
              <span
                className="ql-hist-bar"
                style={{ height: `${Math.max(4, (count / max) * 118)}px` }}
              />
              <span className="ql-hist-label">|{label}⟩</span>
            </div>
          ))}
        </div>
      </div>
      {caption ? <p className="ql-viz-caption">{caption}</p> : null}
    </div>
  );
}

/** Animated real/imaginary statevector amplitudes. */
export function AmplitudeChart({ amplitudes, caption }) {
  if (!amplitudes?.length) {
    return (
      <div className="ql-viz-box">
        <span className="ql-muted">Run the simulation to inspect amplitudes.</span>
      </div>
    );
  }

  return (
    <div className="ql-amp-chart" role="img" aria-label="Statevector amplitudes">
      {amplitudes.map((amplitude) => {
        const magnitude = Math.min(1, Math.abs(amplitude.magnitude ?? 0));
        return (
          <div className="ql-amp-row" key={amplitude.basis_state || amplitude.state}>
            <span className="ql-prob-label">{amplitude.basis_state || ket(amplitude.state)}</span>
            <span className="ql-amp-track">
              <span className="ql-amp-real" style={{ width: `${magnitude * 100}%` }} />
            </span>
            <span className="ql-prob-value">{formatAmplitude(amplitude)}</span>
          </div>
        );
      })}
      {caption ? <p className="ql-viz-caption">{caption}</p> : null}
    </div>
  );
}

/** ket() → "|01⟩" */
export function ket(label) {
  return `|${label}⟩`;
}

/**
 * Normalize a simulation response into probability-bar data.
 * `sim` is the JSON returned by POST /api/quantum/simulate.
 */
export function simulationToProbabilities(sim, maxStates = 8) {
  if (!sim?.probabilities) return [];

  return Object.entries(sim.probabilities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxStates)
    .map(([state, value]) => ({
      label: ket(state),
      value,
      count: sim.counts?.[state],
    }));
}

/** Small floating stat chip used across visuals. */
export function StatChip({ label, value }) {
  if (value == null) return null;
  return (
    <span className="ql-badge">
      {label} <b>{value}</b>
    </span>
  );
}

/** Format a complex amplitude pair (real, imaginary) into a compact string. */
export function formatAmplitude(amplitude) {
  if (!amplitude) return "?";
  const real = amplitude.real ?? 0;
  const imaginary = amplitude.imaginary ?? 0;

  if (Math.abs(imaginary) < 1e-9) {
    return `${real.toFixed(2)}`;
  }

  const sign = imaginary < 0 ? "−" : "+";
  return `${real.toFixed(2)} ${sign} ${Math.abs(imaginary).toFixed(2)}i`;
}

/**
 * Tiny rAF lerp hook used to smooth animated vectors (Bloch sphere).
 * Returns a vector that eases toward `target` every frame.
 */
export function useSmoothVector(target, { speed = 0.14 } = {}) {
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);
  const rafRef = useRef(null);
  const targetRef = useRef(target);
  targetRef.current = target;

  useEffect(() => {
    const step = () => {
      const current = valueRef.current;
      const goal = targetRef.current;
      const next = {
        x: current.x + (goal.x - current.x) * speed,
        y: current.y + (goal.y - current.y) * speed,
        z: current.z + (goal.z - current.z) * speed,
      };

      valueRef.current = next;
      setValue(next);

      const distance =
        Math.abs(next.x - goal.x) +
        Math.abs(next.y - goal.y) +
        Math.abs(next.z - goal.z);

      rafRef.current = distance > 0.0008 ? requestAnimationFrame(step) : null;
    };

    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(step);
    }

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [speed, target.x, target.y, target.z]);

  return value;
}
