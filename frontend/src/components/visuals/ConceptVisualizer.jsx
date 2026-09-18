/**
 * <ConceptVisualizer /> — panel chrome + dispatcher for the current
 * concept's visualization. Syncs to the YouTube timestamp via `segment`.
 *
 * Props:
 *   segment        — active timeline segment (or null)
 *   sim            — real simulation response for the segment preset
 *   loading/error  — simulation state
 *   onRetry        — re-run the simulation
 *   timelineSource — "curated" | "default" (badge)
 */

import QuantumStateVisualizer from "./QuantumStateVisualizer";
import { formatTime } from "./useYouTubePlayer";
import "./visualStyles.css";

export default function ConceptVisualizer({
  segment,
  sim,
  loading,
  error,
  onRetry,
  timelineSource,
}) {
  if (!segment) {
    return (
      <div className="ql-visual-stage">
        <div className="qlv-state">
          <span className="ql-badge">⏸ Waiting for the video…</span>
          <p className="ql-muted">
            Press play — the visuals will sync to the lecture automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ql-visual-stage">
      <span className="ql-badge ql-live-badge">
        <span className="dot" /> LIVE • synced to video
      </span>
      <span className="ql-badge ql-source-badge">
        {timelineSource === "curated" ? "curated timeline" : "default timeline"}
      </span>

      <div style={{ padding: "30px 18px 18px", position: "relative", zIndex: 1 }}>
        <div
          className="ql-pill-row"
          style={{ justifyContent: "space-between", marginBottom: 6 }}
        >
          <span className="ql-badge">
            concept: <b>{segment.concept}</b>
          </span>
          <span className="ql-muted ql-mono">
            {formatTime(segment.start)} – {formatTime(segment.end)}
          </span>
        </div>

        <h3 style={{ margin: "0 0 12px", fontSize: 17, color: "var(--q-ink, #e9f6ff)" }}>
          {segment.title}
        </h3>

        <QuantumStateVisualizer
          type={segment.visualization}
          segment={segment}
          sim={sim}
          loading={loading}
          error={error}
          onRetry={onRetry}
        />

        {segment.explanation ? (
          <p className="ql-viz-caption" style={{ marginTop: 14 }}>
            {segment.explanation}
          </p>
        ) : null}
      </div>
    </div>
  );
}
