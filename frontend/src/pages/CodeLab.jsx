import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";import { API_BASE_URL } from "../services/api";
import "./CodeLab.css";

const examples = {
  "Bell state": "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2, 2)\nqc.h(0)\nqc.cx(0, 1)\nqc.measure([0, 1], [0, 1])",
  Superposition: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(1, 1)\nqc.h(0)\nqc.measure(0, 0)",
  "Bit flip": "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(1, 1)\nqc.x(0)\nqc.measure(0, 0)",
};

export default function CodeLab() {
  const [code, setCode] = useState(examples["Bell state"]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("Explain this code and its execution result.");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const run = async () => {
    setRunning(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/quantum/execute-code`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ code }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.error || "Code execution failed.");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const askCodeLabAI = async () => {
    setAiLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/code-lab/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: "python",
          question: aiQuestion,
          execution: result || {},
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Code Lab AI failed.");
      setAiAnswer(data.answer || data.explanation || data.message || "No explanation was returned.");
    } catch (err) {
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const counts = result?.counts || {};
  const maxCount = Math.max(...Object.values(counts).map(Number), 1);
  const visualGates = useMemo(() => {
    const matches = [...code.matchAll(/\.(h|x|y|z|cx|cz|swap|rx|ry|rz|measure)\s*\(([^)]*)\)/gi)];
    return matches.map((match, index) => ({
      name: match[1].toUpperCase(),
      target: match[2].replace(/\s+/g, ""),
      index,
    }));
  }, [code]);

  return <div className="simple-tool-page"><header className="simple-tool-header"><Link to="/dashboard">Mac &amp; Quantum</Link><span>Code Lab / sandbox</span></header><main className="simple-tool-main"><div className="tool-hero"><div><span className="tool-kicker">EXPERIMENT 01 · PYTHON + QISKIT</span><h1>Build. Run. <em>Understand.</em></h1><p>Write a circuit, execute it safely, and inspect the measurement distribution.</p></div><div className="tool-orb">ψ</div></div><div className="example-list"><span className="example-label">Try an example</span>{Object.keys(examples).map((name) => <button type="button" key={name} onClick={() => setCode(examples[name])}>{name}</button>)}</div><section className="circuit-visual-card"><div className="circuit-visual-heading"><div><span className="tool-kicker">CIRCUIT FLOW</span><h2>State preparation</h2></div><span>{visualGates.length} operations</span></div><div className="visual-wire"><span>q₀</span><div className="wire-line" />{(visualGates.length ? visualGates : [{ name: "·", target: "ready", index: 0 }]).map((gate) => <div className={`visual-gate ${gate.name === "·" ? "placeholder" : ""}`} key={`${gate.name}-${gate.index}`} style={{ "--gate-index": gate.index }}><b>{gate.name}</b><small>{gate.target}</small></div>)}<div className="wire-line" /><span className="wire-end">|ψ⟩</span></div><p className="visual-caption">Each operation becomes a live node. Run the experiment to connect the circuit to its measured state.</p></section><section className="lab-workspace"><div className="editor-panel"><div className="panel-heading"><span>quantum_experiment.py</span><span className="status-dot">● Ready</span></div><textarea className="code-editor" value={code} onChange={(event) => setCode(event.target.value)} spellCheck="false" /><div className="tool-actions"><button type="button" className="run-button" onClick={run} disabled={running}>{running ? "Running..." : "Run experiment"}</button><button type="button" onClick={() => { setCode(""); setResult(null); setAiAnswer(""); setError(""); }}>Clear</button></div></div><aside className="inspector-panel"><span className="tool-kicker">LIVE INSPECTOR</span><h2>Measurement</h2>{result?.success && Object.keys(counts).length > 0 ? <div className="count-chart">{Object.entries(counts).map(([state, count]) => <div className="count-row" key={state}><span>|{state}⟩</span><div><i style={{ width: `${(Number(count) / maxCount) * 100}%` }} /></div><strong>{count}</strong></div>)}</div> : <div className="inspector-empty"><span>ψ</span><p>Run your circuit to reveal the probability distribution.</p></div>}{result?.circuit_diagram && <pre className="circuit-preview">{result.circuit_diagram}</pre>}</aside></section>{error && <div className="tool-error">{error}</div>}{result && <section className={`execution-result ${result.success ? "is-success" : "is-failed"}`}><div><strong>{result.success ? "Execution succeeded" : "Execution failed"}</strong><span>Exit status: {result.return_code ?? (result.success ? 0 : 1)}</span></div>{result.stdout && <pre className="tool-output">{result.stdout}</pre>}{result.stderr && <pre className="tool-error">{result.stderr}</pre>}{result.error && <p className="tool-error">{result.error}</p>}</section>}<section className="code-lab-ai"><div><span className="tool-kicker">QUANTUM MENTOR</span><h2>Ask about your experiment</h2></div><textarea value={aiQuestion} onChange={(event) => setAiQuestion(event.target.value)} /><button type="button" onClick={askCodeLabAI} disabled={aiLoading}>{aiLoading ? "Thinking..." : "Ask AI"}</button>{aiAnswer && <div className="tool-success markdown-answer"><ReactMarkdown>{aiAnswer}</ReactMarkdown></div>}</section></main></div>;
}
