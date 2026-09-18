/**
 * <QuantumCircuitVisualizer /> — animated circuit diagram.
 *
 * Props (all structured data):
 *   numQubits    — number of qubit wires
 *   gates        — [{ gate, qubit?, control?, target?, column }]
 *   activeColumn — column index to highlight (gate-apply animation), or null
 *   measure      — append a measure-all column
 *
 * Used by lecture visuals and the Explore panel; the same gate format is
 * accepted by the backend simulation API.
 */

import "./visualStyles.css";

function gateLabel(gate) {
  const map = { cnot: "CX", cx: "CX", h: "H", measure: "M" };
  return (map[gate?.toLowerCase()] || gate || "?").toUpperCase();
}

export default function QuantumCircuitVisualizer({
  numQubits = 2,
  gates = [],
  activeColumn = null,
  measure = true,
}) {
  const wireRows = Array.from({ length: Math.max(1, numQubits) }, (_, i) => i);

  const contentColumns = gates.reduce(
    (max, gate) => Math.max(max, gate.column ?? 0),
    -1
  );

  const columns = Array.from(
    { length: Math.max(1, contentColumns + 1 + (measure ? 1 : 0)) },
    (_, i) => i
  );

  return (
    <div
      className="ql-circuit"
      style={{ "--ql-cols": Math.max(2, columns.length) }}
    >
      {wireRows.map((row) => (
        <div className="ql-circuit-row" key={row}>
          <span className="ql-circuit-qlabel">q{row}</span>
          <span className="ql-circuit-wire" />

          {columns.map((column) => {
            const gateHere = gates.find(
              (gate) => (gate.column ?? 0) === column
            );

            const isActive = activeColumn === column;

            // Single-qubit gate on this wire
            if (
              gateHere &&
              !["cx", "cnot", "cz", "swap"].includes(
                gateHere.gate?.toLowerCase()
              ) &&
              (gateHere.qubit ?? row) === row
            ) {
              const isMeasure =
                gateHere.gate?.toLowerCase() === "measure" || column > contentColumns;

              return (
                <span className={`ql-circuit-cell${isActive ? " active" : ""}`} key={column}>
                  <span className={`ql-gate${isMeasure ? " meter" : ""}`}>
                    {isMeasure ? "📊" : gateLabel(gateHere.gate)}
                  </span>
                </span>
              );
            }

            // Two-qubit gate pieces
            if (
              gateHere &&
              ["cx", "cnot", "cz"].includes(gateHere.gate?.toLowerCase())
            ) {
              const control = gateHere.control ?? 0;
              const target = gateHere.target ?? 1;

              if (row === control) {
                return (
                  <span className={`ql-circuit-cell${isActive ? " active" : ""}`} key={column}>
                    <span className="ql-cnot-ctrl" />
                  </span>
                );
              }

              if (row === target) {
                return (
                  <span className={`ql-circuit-cell${isActive ? " active" : ""}`} key={column}>
                    <span className="ql-cnot-target" />
                  </span>
                );
              }

              // Vertical connector segment between control and target
              const between =
                (row > control && row < target) ||
                (row > target && row < control);

              if (between) {
                return (
                  <span className="ql-circuit-cell" key={column}>
                    <span className="ql-cnot-seg" />
                  </span>
                );
              }
            }

            // Measure-all tail column
            if (column > contentColumns && measure) {
              return (
                <span className="ql-circuit-cell" key={column}>
                  <span className="ql-gate meter">📊</span>
                </span>
              );
            }

            return <span className="ql-circuit-cell" key={column} />;
          })}
        </div>
      ))}
    </div>
  );
}
