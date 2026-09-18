import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
import { API_BASE_URL } from "../services/api";
import "./Challenges.css";

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [selected, setSelected] = useState(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { fetch(`${API_BASE_URL}/api/challenges`).then((response) => response.json()).then(setChallenges).catch(() => setError("Challenges could not be loaded.")); }, []);
  const selectChallenge = (challenge) => { setSelected(challenge); setCode(challenge.starter_code || ""); setResult(null); };
  const submit = async () => {
    if (!selected) return;
    try {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/challenges/${selected.id}/submit`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ code }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Challenge submission failed.");
      setResult(data);
    } catch (err) { setError(err.message); }
  };
  return <div className="simple-tool-page"><header className="simple-tool-header"><Link to="/dashboard">QuantumLearn</Link><span>Challenges</span></header><main className="simple-tool-main"><h1>Quantum Challenges</h1><p>Practice quantum programming with persisted attempts.</p>{error && <div className="tool-error">{error}</div>}<div className="challenge-layout"><div className="challenge-list">{challenges.map((challenge) => <button type="button" key={challenge.id} onClick={() => selectChallenge(challenge)}><strong>{challenge.title}</strong><small>{challenge.difficulty} · {challenge.category}</small></button>)}</div>{selected && <section className="challenge-editor"><h2>{selected.title}</h2><p>{selected.description}</p><textarea className="code-editor" value={code} onChange={(event) => setCode(event.target.value)} spellCheck="false" /><button type="button" onClick={submit}>Submit attempt</button>{result && <div className={result.passed ? "tool-success" : "tool-error"}>{result.passed ? "Passed" : "Needs another attempt"}<pre className="tool-output">{JSON.stringify(result.result, null, 2)}</pre></div>}</section>}</div></main><BottomNavigation /></div>;
}
