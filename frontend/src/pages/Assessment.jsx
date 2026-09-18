import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_BASE_URL } from "../services/api";
import BottomNavigation from "../components/BottomNavigation";

export default function Assessment() {
  const { courseId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { fetch(`${API_BASE_URL}/api/assessment/course/${courseId}`).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.detail || "Assessment unavailable."); return data; }).then(setQuestions).catch((err) => setError(err.message)); }, [courseId]);
  const submit = async (event) => { event.preventDefault(); try { const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token"); const response = await fetch(`${API_BASE_URL}/api/assessment/submit`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ course_id: Number(courseId), answers: questions.map((question) => ({ question_id: question.id, answer: answers[question.id] || "" })) }) }); const data = await response.json(); if (!response.ok) throw new Error(data.detail || "Assessment submission failed."); setResult(data); } catch (err) { setError(err.message); } };
  return <div style={{ minHeight: "100vh", background: "#f7fbff" }}><header style={{ padding: 24, background: "#fff" }}><Link to="/dashboard">QuantumLearn</Link></header><main style={{ width: "min(800px,92%)", margin: "0 auto", padding: "32px 0" }}><h1>Assessment</h1>{error && <p>{error}</p>}{result ? <section><h2>{result.percentage}%</h2><p>{result.feedback}</p><button type="button" onClick={() => { setResult(null); setAnswers({}); }}>Retry</button></section> : <form onSubmit={submit}>{questions.map((question, index) => <fieldset key={question.id} style={{ margin: "20px 0", padding: 20, background: "#fff", border: "1px solid #dbeafe", borderRadius: 8 }}><legend>{index + 1}. {question.question}</legend>{question.options.map((option) => <label key={option} style={{ display: "block", margin: "8px 0" }}><input type="radio" name={`question-${question.id}`} value={option} checked={answers[question.id] === option} onChange={() => setAnswers((previous) => ({ ...previous, [question.id]: option }))} /> {option}</label>)}</fieldset>)}{questions.length > 0 && <button type="submit">Submit assessment</button>}</form>}</main><BottomNavigation /></div>;
}
