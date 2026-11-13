import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Play,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Sparkles,
  Lock,
} from "lucide-react";

import "./Learn.css";
import { API_BASE_URL } from "../services/api";
const API_URL = API_BASE_URL;

// Offline-safe thumbnail fallback (inline SVG, no network needed).
const THUMBNAIL_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='480' height='270'>" +
      "<rect width='100%' height='100%' fill='#0d1126'/>" +
      "<text x='50%' y='46%' fill='#64709a' font-family='monospace' font-size='24' text-anchor='middle'>Offline</text>" +
      "<text x='50%' y='60%' fill='#a3adcf' font-family='monospace' font-size='15' text-anchor='middle'>Video requires internet</text>" +
    "</svg>"
  );

function handleThumbError(event) {
  if (event.currentTarget.getAttribute("data-fallback") !== "1") {
    event.currentTarget.setAttribute("data-fallback", "1");
    event.currentTarget.src = THUMBNAIL_FALLBACK;
  }
}

function Learn() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedLecture, setSelectedLecture] = useState(null);
  const [lectureProgress, setLectureProgress] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchLectures();
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (token) fetch(`${API_URL}/api/progress/lectures`, { headers: { Authorization: `Bearer ${token}` } }).then((response) => response.ok ? response.json() : []).then((items) => setLectureProgress(Object.fromEntries(items.map((item) => [item.lecture_id, item])))).catch(() => {});
  }, []);

const FALLBACK_LECTURES = [
  { id: 1, order_no: 1, topic: "Introduction to Quantum Computing & Qubits", description: "Learn the foundational principles of qubits, superposition, and quantum state vectors.", duration: "12m", youtube_url: "https://www.youtube.com/watch?v=JhHMJCUmq28" },
  { id: 2, order_no: 2, topic: "Quantum Superposition & Hadamard Gate", description: "Explore how quantum gates put qubits into linear combinations of states.", duration: "15m", youtube_url: "https://www.youtube.com/watch?v=JhHMJCUmq28" },
  { id: 3, order_no: 3, topic: "Quantum Measurement & State Collapse", description: "Understand wave function collapse, Born's rule, and measurement outcomes.", duration: "14m", youtube_url: "https://www.youtube.com/watch?v=JhHMJCUmq28" },
  { id: 4, order_no: 4, topic: "Quantum Entanglement & Bell States", description: "Master two-qubit systems, Einstein-Podolsky-Rosen paradox, and Bell pairs.", duration: "18m", youtube_url: "https://www.youtube.com/watch?v=JhHMJCUmq28" },
  { id: 5, order_no: 5, topic: "Quantum Circuits & Real-World Algorithms", description: "Build complete multi-qubit circuits and explore teleportation and Grover search.", duration: "20m", youtube_url: "https://www.youtube.com/watch?v=JhHMJCUmq28" },
];

  async function fetchLectures() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/lectures`);

      if (response.ok) {
        const data = await response.json();
        const sortedLectures = [...data].sort((a, b) => a.order_no - b.order_no);
        setLectures(sortedLectures);
      } else {
        setLectures(FALLBACK_LECTURES);
      }
    } catch (err) {
      console.warn("Using offline lectures:", err);
      setLectures(FALLBACK_LECTURES);
      setError("");
    } finally {
      setLoading(false);
    }
  }

  const getYoutubeId = (url) => {
    if (!url) return "";

    try {
      const parsedUrl = new URL(url);

      if (parsedUrl.hostname.includes("youtu.be")) {
        return parsedUrl.pathname.substring(1);
      }

      return parsedUrl.searchParams.get("v") || "";
    } catch {
      return "";
    }
  };

  const openLecture = (lecture) => {
    navigate(`/learn/${lecture.id}`);
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (token) fetch(`${API_URL}/api/progress/lecture/${lecture.id}?completion_percentage=${Math.max(1, lectureProgress[lecture.id]?.completion_percentage || 1)}&completed=false`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
  };

  const closeLecture = () => {
    setSelectedLecture(null);
    if (selectedLecture) {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      if (token) fetch(`${API_URL}/api/progress/lecture/${selectedLecture.id}?completion_percentage=100&completed=true`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
      setLectureProgress((previous) => ({ ...previous, [selectedLecture.id]: { completion_percentage: 100, completed: true } }));
    }
  };

  return (
    <div className="learn-page">
      {/* Header */}
      <header className="learn-header">
        <div className="learn-header-inner">
          <Link to="/dashboard" className="learn-back">
            <ArrowLeft size={18} />
            Dashboard
          </Link>

          <Link to="/dashboard" className="learn-logo">
            QuantumLearn
          </Link>

          <div className="learn-header-spacer"></div>
        </div>
      </header>

      {/* Main */}
      <main className="learn-content">
        <section className="learn-intro">
          <div className="learn-intro-icon">
            <BookOpen size={22} />
          </div>

          <div>
            <p className="learn-label">LEARNING PATH</p>
            <h1>Learn Quantum Computing</h1>
            <p>
              Follow these five lectures in order to build a basic
              understanding of quantum computing.
            </p>
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="learn-state">
            <div className="loading-spinner"></div>
            <p>Loading lectures...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="learn-error">
            <AlertCircle size={20} />
            <div>
              <strong>Unable to load lectures</strong>
              <p>{error}</p>
            </div>

            <button
              type="button"
              className="retry-button"
              onClick={fetchLectures}
            >
              Try again
            </button>
          </div>
        )}

        {/* Lectures */}
        {!loading && !error && (
          <section className="lectures-section">
            <div className="lectures-heading">
              <div>
                <p className="learn-label">COURSE LECTURES</p>
                <h2>Five lectures to get started</h2>
              </div>

              <span className="lecture-count">
                {lectures.length} Lectures
              </span>
            </div>

            <div className="lectures-list">
              {lectures.map((lecture, index) => {
                const youtubeId = getYoutubeId(
                  lecture.youtube_url
                );

                // Lecture gating: Lecture 1 is always unlocked.
                // Subsequent lectures require previous lecture's quiz to be passed (or completed).
                const isUnlocked = index === 0 || (() => {
                  const prev = lectures[index - 1];
                  if (!prev) return true;
                  const prevProg = lectureProgress[prev.id];
                  return Boolean(prevProg?.completed || prevProg?.quiz_passed);
                })();

                return (
                  <article
                    className={`lecture-card ${!isUnlocked ? "lecture-card--locked" : ""}`}
                    key={lecture.id}
                  >
                    <div className="lecture-number">
                      {String(lecture.order_no).padStart(2, "0")}
                    </div>

                    <div className="lecture-thumbnail">
                      {lecture.thumbnail_url ? (
                        <img
                          src={lecture.thumbnail_url}
                          alt={lecture.title}
                          onError={handleThumbError}
                        />
                      ) : youtubeId ? (
                        <img
                          src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                          alt={lecture.title}
                          onError={handleThumbError}
                        />
                      ) : (
                        <div className="thumbnail-placeholder">
                          <BookOpen size={30} />
                        </div>
                      )}

                      {isUnlocked ? (
                        <button
                          type="button"
                          className="thumbnail-play"
                          onClick={() => openLecture(lecture)}
                          aria-label={`Watch ${lecture.title}`}
                        >
                          <Play size={19} fill="currentColor" />
                        </button>
                      ) : (
                        <div className="thumbnail-play thumbnail-locked" title="Locked — Pass previous lecture quiz with ≥3/5 to unlock">
                          <Lock size={18} />
                        </div>
                      )}
                    </div>

                    <div className="lecture-info">
                      <div className="lecture-top">
                        <span className="lecture-tag">
                          Lecture {lecture.order_no}
                        </span>

                        {lecture.duration && (
                          <span className="lecture-duration">
                            <Clock3 size={14} />
                            {lecture.duration}
                          </span>
                        )}
                      </div>

                      <h3>{lecture.topic}</h3>

                      <p>{lecture.description}</p>

                      {isUnlocked ? (
                        <>
                          <button
                            type="button"
                            className="watch-button interactive-button"
                            onClick={() =>
                              navigate(`/learn/${lecture.id}/interactive`)
                            }
                          >
                            <Sparkles size={16} />
                            Interactive Visual Lecture & Quiz
                          </button>

                          <button
                            type="button"
                            className="watch-button"
                            onClick={() => openLecture(lecture)}
                          >
                            Watch lecture
                            <ArrowRight size={17} />
                          </button>
                        </>
                      ) : (
                        <div className="locked-banner">
                          <Lock size={15} />
                          <span>Locked: Complete Lecture {lecture.order_no - 1} Quiz (≥3/5 correct) to unlock</span>
                        </div>
                      )}
                    </div>

                    <div className="lecture-status">
                      {isUnlocked ? (
                        <>
                          <CheckCircle2 size={18} color={lectureProgress[lecture.id]?.completed || lectureProgress[lecture.id]?.quiz_passed ? "#34d399" : "#94a3b8"} />
                          <span>
                            {lectureProgress[lecture.id]?.completed || lectureProgress[lecture.id]?.quiz_passed
                              ? "Completed & Quiz Passed"
                              : lectureProgress[lecture.id]?.completion_percentage
                              ? `${lectureProgress[lecture.id].completion_percentage}% complete`
                              : "Unlocked — Not started"}
                          </span>
                        </>
                      ) : (
                        <>
                          <Lock size={16} color="#94a3b8" />
                          <span>Locked</span>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* YouTube Modal */}
      {selectedLecture && (
        <div
          className="video-overlay"
          onClick={closeLecture}
          role="presentation"
        >
          <div
            className="video-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={selectedLecture.title}
          >
            <div className="video-modal-header">
              <div>
                <span>
                  Lecture {selectedLecture.order_no}
                </span>

                <h2>{selectedLecture.topic}</h2>
              </div>

              <button
                type="button"
                className="close-video"
                onClick={closeLecture}
                aria-label="Close video"
              >
                ×
              </button>
            </div>

            <div className="video-container">
              {getYoutubeId(selectedLecture.youtube_url) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYoutubeId(
                    selectedLecture.youtube_url
                  )}`}
                  title={selectedLecture.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="video-unavailable">
                  <AlertCircle size={28} />
                  <p>Video is currently unavailable.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Learn;