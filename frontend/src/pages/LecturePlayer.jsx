import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  CircleHelp,
  Code2,
  ExternalLink,
  FlaskConical,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { fetchLectureTimeline, recordLectureInteraction } from "../services/lectureApi";
import { simulateCircuit } from "../services/quantumApi";
import { extractYoutubeId, formatTime, useYouTubePlayer } from "../components/visuals/useYouTubePlayer";
import QuantumCircuitVisualizer from "../components/visuals/QuantumCircuitVisualizer";
import {
  MeasurementHistogram,
  ProbabilityChart,
  simulationToProbabilities,
} from "../components/visuals/visualPrimitives";
import "./LecturePlayer.css";

const DEFAULT_SEGMENTS = [
  { start: 0, end: 60, concept: "qubit", visualization: "qubit", title: "What is a Qubit?", explanation: "A qubit is the fundamental unit of quantum information.", simulation: { num_qubits: 1, gates: [], shots: 1024 } },
  { start: 60, end: 150, concept: "superposition", visualization: "superposition", title: "Superposition", explanation: "A qubit can be a linear combination of |0⟩ and |1⟩.", simulation: { num_qubits: 1, gates: [{ gate: "H", qubit: 0, column: 0 }], shots: 1024 } },
  { start: 150, end: 240, concept: "hadamard", visualization: "hadamard", title: "Hadamard Gate", explanation: "The H gate transforms |0⟩ into an equal superposition.", simulation: { num_qubits: 1, gates: [{ gate: "H", qubit: 0, column: 0 }], shots: 1024 } },
  { start: 240, end: 330, concept: "measurement", visualization: "measurement", title: "Measurement", explanation: "Measurement turns a quantum state into a classical outcome.", simulation: { num_qubits: 1, gates: [{ gate: "H", qubit: 0, column: 0 }, { gate: "measure", qubit: 0, column: 1 }], shots: 1024 } },
  { start: 330, end: 420, concept: "probability", visualization: "probability", title: "Probability", explanation: "The squared amplitudes determine how often each result appears.", simulation: { num_qubits: 1, gates: [{ gate: "H", qubit: 0, column: 0 }], shots: 1024 } },
];

function BlochSphere({ coordinates }) {
  const point = coordinates?.q0;
  if (!point) {
    return <div className="lecture-empty">Bloch-sphere coordinates become available after a simulation.</div>;
  }
  const x = 50 + Math.max(-1, Math.min(1, point.x)) * 30;
  const y = 50 - Math.max(-1, Math.min(1, point.z)) * 30;
  return (
    <div className="bloch-wrap" role="img" aria-label="Qubit Bloch sphere">
      <div className="bloch-sphere">
        <span className="bloch-axis bloch-x" />
        <span className="bloch-axis bloch-z" />
        <span className="bloch-equator" />
        <span className="bloch-point" style={{ left: `${x}%`, top: `${y}%` }} />
        <b className="bloch-label top">|0⟩</b>
        <b className="bloch-label bottom">|1⟩</b>
      </div>
      <span className="lecture-muted">x {point.x.toFixed(2)} · y {point.y.toFixed(2)} · z {point.z.toFixed(2)}</span>
    </div>
  );
}

function ConceptVisualizer({ segment, simulation, onRun }) {
  const type = segment?.visualization || segment?.concept;
  const gates = segment?.simulation?.gates || [];
  const probabilities = simulationToProbabilities(simulation);

  return (
    <div className="lecture-visual-stage">
      <div className="lecture-stage-orbit" />
      {type === "qubit" && (
        <div className="qubit-card">
          <div className="qubit-orb"><span className="qubit-dot" /></div>
          <div><strong>Qubit state</strong><span>|ψ⟩ = α|0⟩ + β|1⟩</span></div>
        </div>
      )}
      {(type === "superposition" || type === "probability") && (
        <div className="visual-stack">
          <div className="formula">|ψ⟩ = α|0⟩ + β|1⟩</div>
          <ProbabilityChart data={probabilities} caption={simulation ? "Measured from the live Qiskit simulation." : "Run the simulation to see measured probabilities."} />
        </div>
      )}
      {(type === "hadamard" || type === "circuit" || type === "entanglement") && (
        <div className="visual-stack">
          <QuantumCircuitVisualizer numQubits={segment?.simulation?.num_qubits || 1} gates={gates} activeColumn={gates.length ? gates.length - 1 : null} />
          <div className="gate-flow"><span>|0⟩</span><ChevronRight size={17} /><b>H</b><ChevronRight size={17} /><span>|+⟩</span></div>
        </div>
      )}
      {type === "measurement" && (
        <div className="visual-stack">
          <div className="collapse-visual"><span className="state-wave">|ψ⟩</span><ChevronRight size={22} /><span className="measure-box">M</span><ChevronRight size={22} /><span className="state-result">{simulation?.most_frequent_state ? `|${simulation.most_frequent_state}⟩` : "|0⟩ / |1⟩"}</span></div>
          <MeasurementHistogram counts={simulation?.counts} caption="Each shot samples one classical outcome." />
        </div>
      )}
      {!["qubit", "superposition", "probability", "hadamard", "circuit", "entanglement", "measurement"].includes(type) && (
        <div className="visual-stack"><Sparkles size={42} /><p>Interactive explanation</p><span className="lecture-muted">This concept is ready to explore.</span></div>
      )}
      {!simulation && segment?.simulation && <button type="button" className="lecture-inline-action" onClick={onRun}><Play size={14} /> Run live simulation</button>}
    </div>
  );
}

function LectureTimeline({ segments, activeIndex, onSelect }) {
  return (
    <ol className="lecture-timeline">
      {segments.map((segment, index) => (
        <li key={segment.id || `${segment.concept}-${segment.start}`} className={`${index === activeIndex ? "active" : ""} ${index < activeIndex ? "complete" : ""}`}>
          <button type="button" onClick={() => onSelect(index)} aria-current={index === activeIndex ? "step" : undefined}>
            <span className="timeline-node">{index < activeIndex ? <Check size={13} /> : index + 1}</span>
            <span><strong>{segment.title}</strong><small>{formatTime(segment.start)} · {segment.concept}</small></span>
          </button>
        </li>
      ))}
    </ol>
  );
}

function CodeVisualizer({ code, activeConcept }) {
  if (!code?.lines?.length) return null;
  const highlights = code.highlights || {};
  return (
    <div className="lecture-code">
      <div className="lecture-panel-heading"><Code2 size={15} /> {code.language || "code"} <span>{activeConcept}</span></div>
      <pre>{code.lines.map((line, index) => <code className={highlights[index + 1]?.includes(activeConcept) ? "highlight" : ""} key={`${index}-${line}`}><i>{String(index + 1).padStart(2, "0")}</i>{line}</code>)}</pre>
    </div>
  );
}

export default function LecturePlayer() {
  const { lectureId } = useParams();
  const navigate = useNavigate();
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [simulation, setSimulation] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [exploring, setExploring] = useState(false);
  const [questionAnswer, setQuestionAnswer] = useState(null);
  const seenRef = useRef(new Set());
  const segments = timeline?.segments?.length ? timeline.segments : DEFAULT_SEGMENTS;
  const videoId = extractYoutubeId(timeline?.youtube_url);
  const player = useYouTubePlayer({ videoId });
  const {
    hostRef,
    failed,
    playing,
    currentTime,
    duration,
    play,
    pause,
    seekTo,
  } = player;
  const currentIndex = useMemo(() => {
    const index = segments.findIndex((segment) => currentTime >= segment.start && currentTime < segment.end);
    return index < 0 ? activeIndex : index;
  }, [activeIndex, currentTime, segments]);
  const activeSegment = segments[currentIndex] || segments[0];

  useEffect(() => {
    let cancelled = false;
    fetchLectureTimeline(lectureId)
      .then((data) => { if (!cancelled) setTimeline(data); })
      .catch((requestError) => { if (!cancelled) setError(requestError.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [lectureId]);

  useEffect(() => {
    const segment = segments[currentIndex];
    if (!segment || seenRef.current.has(segment.id || segment.concept)) return;
    seenRef.current.add(segment.id || segment.concept);
    recordLectureInteraction(Number(lectureId), { event_type: "lecture_concept_watched", concept: segment.concept, segment_id: segment.id, video_time: currentTime }).catch(() => {});
  }, [currentIndex, currentTime, lectureId, segments]);

  const runSimulation = async () => {
    if (!activeSegment?.simulation || simulating) return;
    setSimulating(true);
    try {
      const result = await simulateCircuit({
        numQubits: activeSegment.simulation.num_qubits || 1,
        gates: activeSegment.simulation.gates || [],
        shots: activeSegment.simulation.shots || 1024,
        algorithm: activeSegment.simulation.algorithm || null,
      });
      setSimulation(result);
      recordLectureInteraction(Number(lectureId), { event_type: "simulation_run", concept: activeSegment.concept, segment_id: activeSegment.id, video_time: currentTime }).catch(() => {});
    } catch (simulationError) {
      setError(simulationError.message);
    } finally {
      setSimulating(false);
    }
  };

  const selectSegment = (index) => {
    setActiveIndex(index);
    setSimulation(null);
    setQuestionAnswer(null);
    seekTo(segments[index].start);
    recordLectureInteraction(Number(lectureId), { event_type: "visualization_explored", concept: segments[index].concept, segment_id: segments[index].id, video_time: segments[index].start }).catch(() => {});
  };

  const answerQuestion = (index) => {
    if (!activeSegment.question || questionAnswer !== null) return;
    const correct = index === activeSegment.question.answer_index;
    setQuestionAnswer(index);
    recordLectureInteraction(Number(lectureId), { event_type: correct ? "question_correct" : "question_incorrect", concept: activeSegment.concept, segment_id: activeSegment.id, video_time: currentTime, correct }).catch(() => {});
  };

  if (loading) return <div className="lecture-page lecture-state"><Loader2 className="spin" /><p>Loading your visual lecture...</p></div>;
  if (error && !timeline) return <div className="lecture-page lecture-state"><CircleHelp size={30} /><p>{error}</p><Link className="lecture-button" to="/learn">Back to Learning Path</Link></div>;

  return (
    <div className="lecture-page">
      <header className="lecture-header">
        <button type="button" className="lecture-back" onClick={() => navigate("/learn")}><ArrowLeft size={17} /> Learning Path</button>
        <div><span className="lecture-eyebrow">INTERACTIVE VISUAL LECTURE</span><h1>{timeline?.topic || timeline?.title || "Quantum lecture"}</h1></div>
        <span className="lecture-live"><span /> LIVE SYNC</span>
      </header>
      {error && <div className="lecture-alert">{error}</div>}
      <main className="lecture-main">
        <section className="lecture-video-column">
          <div className="lecture-video-card">
            <div className="lecture-video-host" ref={hostRef}>
              {failed && videoId && <iframe src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`} title={timeline?.title || "YouTube lecture"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />}
              {!videoId && <div className="lecture-unavailable">This lecture does not have a valid YouTube video.</div>}
            </div>
            <div className="lecture-player-bar">
              <button type="button" className="player-play" onClick={playing ? pause : play} aria-label={playing ? "Pause lecture" : "Play lecture"}>{playing ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}</button>
              <span className="player-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
              <input type="range" min="0" max={duration || 1} value={Math.min(currentTime, duration || 1)} onChange={(event) => seekTo(Number(event.target.value))} aria-label="Lecture timeline" />
              <button type="button" className="player-reset" onClick={() => seekTo(activeSegment?.start || 0)}><RotateCcw size={15} /> Concept</button>
            </div>
          </div>
          <div className="lecture-explore-card">
            <div><span className="lecture-eyebrow">CURRENT CONCEPT</span><h2>{activeSegment?.title}</h2><p>{activeSegment?.explanation}</p></div>
            <button type="button" className="lecture-button primary" onClick={() => { setExploring(true); recordLectureInteraction(Number(lectureId), { event_type: "visualization_explored", concept: activeSegment.concept, segment_id: activeSegment.id, video_time: currentTime }).catch(() => {}); }}><FlaskConical size={16} /> Explore this concept</button>
          </div>
          {activeSegment?.question && <div className="lecture-question"><div className="lecture-panel-heading"><CircleHelp size={16} /> Quick practice</div><h3>{activeSegment.question.prompt}</h3><div className="question-options">{activeSegment.question.options?.map((option, index) => <button type="button" key={option} className={questionAnswer === index ? (index === activeSegment.question.answer_index ? "correct" : "incorrect") : ""} onClick={() => answerQuestion(index)}>{String.fromCharCode(65 + index)}. {option}</button>)}</div>{questionAnswer !== null && <p className="question-feedback">{questionAnswer === activeSegment.question.answer_index ? "Correct — the visual shows why this transformation creates the new state." : activeSegment.question.explanation}</p>}</div>}
        </section>
        <aside className="lecture-sidebar">
          <div className="lecture-panel timeline-panel"><div className="lecture-panel-heading"><Sparkles size={15} /> Visual timeline <span>{formatTime(currentTime)}</span></div><LectureTimeline segments={segments} activeIndex={currentIndex} onSelect={selectSegment} /></div>
          <div className="lecture-panel concept-panel"><div className="lecture-panel-heading"><span className="heading-dot" /> {activeSegment?.concept}</div><ConceptVisualizer segment={activeSegment} simulation={simulation} onRun={runSimulation} /><div className="concept-actions"><button type="button" className="lecture-button primary" onClick={runSimulation} disabled={simulating || !activeSegment?.simulation}>{simulating ? <Loader2 className="spin" size={15} /> : <Play size={15} />} {simulating ? "Simulating..." : "Run simulation"}</button><Link className="lecture-button" to={`/simulator?lecture=${lectureId}&concept=${activeSegment?.concept || ""}`}><ExternalLink size={15} /> Try in Simulator</Link></div></div>
        </aside>
      </main>
      {(exploring || simulation) && <section className="lecture-results"><div className="lecture-results-head"><div><span className="lecture-eyebrow">EXPLORE LAB</span><h2>{activeSegment?.title} · live results</h2></div><button type="button" className="lecture-close" onClick={() => setExploring(false)}>Close</button></div><div className="lecture-results-grid"><div className="lecture-panel"><div className="lecture-panel-heading">Measurement distribution</div><MeasurementHistogram counts={simulation?.counts} /><ProbabilityChart data={simulationToProbabilities(simulation)} /></div><div className="lecture-panel"><div className="lecture-panel-heading">Qubit state</div><BlochSphere coordinates={simulation?.bloch_coordinates} /><div className="lecture-result-meta"><span>{simulation?.backend || "Awaiting simulation"}</span><span>{simulation?.shots ? `${simulation.shots} shots` : "Run to inspect"}</span></div></div></div><CodeVisualizer code={activeSegment?.code} activeConcept={activeSegment?.concept} /></section>}
    </div>
  );
}
