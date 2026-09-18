/**
 * <AnimatedFlowchart /> — vertical lesson flowchart.
 *
 * Props:
 *   segments    — timeline segments [{ title, concept, start, end }]
 *   currentIndex— index of the active segment (highlighted + pulsing)
 *   completed   — Set of completed segment indices (checkmarks)
 *   onSelect    — (index) => jump to that timestamp / open visual
 *
 * START node at the top; completed connectors turn green; upcoming nodes
 * are dimmed but still clickable (graceful exploration).
 */

import "./visualStyles.css";

export default function AnimatedFlowchart({
  segments = [],
  currentIndex = -1,
  completed,
  onSelect,
}) {
  const done = completed instanceof Set ? completed : new Set();

  return (
    <div className="ql-flow" role="list">
      <div className="ql-flow-node upcoming" role="listitem" style={{ cursor: "default" }}>
        <span className="ql-flow-check">▶</span>
        <span className="ql-flow-title">START</span>
      </div>

      {segments.map((segment, index) => {
        const state =
          index === currentIndex
            ? "active"
            : done.has(index)
              ? "done"
              : "upcoming";

        return (
          <div style={{ display: "contents" }} key={`${segment.concept}-${index}`}>
            <span className={`ql-flow-connector${done.has(index) ? " done" : ""}`} />

            <button
              type="button"
              className={`ql-flow-node ${state}`}
              role="listitem"
              onClick={() => onSelect?.(index)}
              title={`${segment.title} — jump to this concept`}
            >
              <span className="ql-flow-check">
                {done.has(index) ? "✓" : index === currentIndex ? "◉" : index + 1}
              </span>
              <span className="ql-flow-title">{segment.title}</span>
              <span className="ql-flow-time">
                {Math.floor(segment.start / 60)}:
                {String(segment.start % 60).padStart(2, "0")}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
