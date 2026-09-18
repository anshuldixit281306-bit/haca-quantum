/**
 * <CodeVisualizer /> — lecture code panel with concept-aware highlighting.
 *
 * Props:
 *   code           — { language, lines: string[], highlights: { [lineIndex]: [concepts] } }
 *   activeConcept  — current segment concept key; matching lines highlight
 */

import "./visualStyles.css";

export default function CodeVisualizer({ code, activeConcept }) {
  if (!code?.lines?.length) return null;

  const highlights = code.highlights || {};

  return (
    <div className="ql-code" aria-label="Lecture code">
      {code.lines.map((line, index) => {
        const concepts = highlights[index] || [];
        const isActive =
          Boolean(activeConcept) && concepts.includes(activeConcept);

        return (
          <div
            className={`ql-code-line${isActive ? " active" : ""}`}
            key={`${index}-${line}`}
          >
            <span className="ql-code-ln">{index + 1}</span>
            <span>{line || " "}</span>
          </div>
        );
      })}
    </div>
  );
}
