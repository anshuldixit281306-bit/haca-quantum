
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock3,
  RefreshCw,
} from "lucide-react";

import "./Progress.css";
import { API_BASE_URL } from "../services/api";
import BottomNavigation from "../components/BottomNavigation";

const API_URL = API_BASE_URL;

const FALLBACK_LECTURES = [
  { id: 1, order_no: 1, topic: "Introduction to Quantum Computing & Qubits", description: "Learn the foundational principles of qubits, superposition, and quantum state vectors.", duration: "12m" },
  { id: 2, order_no: 2, topic: "Quantum Superposition & Hadamard Gate", description: "Explore how quantum gates put qubits into linear combinations of states.", duration: "15m" },
  { id: 3, order_no: 3, topic: "Quantum Measurement & State Collapse", description: "Understand wave function collapse, Born's rule, and measurement outcomes.", duration: "14m" },
  { id: 4, order_no: 4, topic: "Quantum Entanglement & Bell States", description: "Master two-qubit systems, Einstein-Podolsky-Rosen paradox, and Bell pairs.", duration: "18m" },
  { id: 5, order_no: 5, topic: "Quantum Circuits & Real-World Algorithms", description: "Build complete multi-qubit circuits and explore teleportation and Grover search.", duration: "20m" },
];

function Progress() {
  const [lectures, setLectures] = useState(FALLBACK_LECTURES);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    loadProgress();
  }, []);

  async function loadProgress() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

      let lecturesData = FALLBACK_LECTURES;
      try {
        const lecturesResponse = await fetch(`${API_URL}/api/lectures`);
        if (lecturesResponse.ok) {
          lecturesData = await lecturesResponse.json();
        }
      } catch (e) {
        // Use fallback lectures if backend is unreachable
      }

      let progressData = [];
      try {
        const progressResponse = await fetch(`${API_URL}/api/progress/lectures`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (progressResponse.ok) {
          progressData = await progressResponse.json();
        }
      } catch (e) {
        // Fallback progress
      }

      try {
        const attemptsResponse = await fetch(`${API_URL}/api/assessment/attempts`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (attemptsResponse.ok) setAttempts(await attemptsResponse.json());
      } catch (e) {
        // Fallback attempts
      }

      const sortedLectures = [...lecturesData].sort(
        (a, b) => a.order_no - b.order_no
      );

      setLectures(sortedLectures);
      setProgress(Array.isArray(progressData) ? progressData : []);
    } catch (err) {
      console.warn("Progress using offline mode:", err);
      setLectures(FALLBACK_LECTURES);
    } finally {
      setLoading(false);
    }
  }

  const getLectureProgress = useCallback((lectureId) => {
    const item = progress.find(
      (entry) =>
        entry.lecture_id === lectureId ||
        entry.lecture?.id === lectureId
    );

    if (!item) {
      return {
        percentage: 0,
        completed: false,
      };
    }

    return {
      percentage: Number(
        item.completion_percentage || 0
      ),
      completed: Boolean(item.completed),
    };
  }, [progress]);

  const overallProgress = useMemo(() => {
    if (lectures.length === 0) {
      return 0;
    }

    const total = lectures.reduce(
      (sum, lecture) => {
        return (
          sum +
          getLectureProgress(lecture.id).percentage
        );
      },
      0
    );

    return Math.round(
      total / lectures.length
    );
  }, [lectures, getLectureProgress]);

  const completedLectures = useMemo(() => {
    return lectures.filter(
      (lecture) =>
        getLectureProgress(lecture.id).completed
    ).length;
  }, [lectures, getLectureProgress]);

  return (
    <div className="progress-page">
      <main className="progress-content">

        {/* Introduction */}
        <section className="progress-intro">

          <div className="progress-intro-icon">
            <BookOpen size={22} />
          </div>

          <div>
            <p className="progress-label">
              YOUR PROGRESS
            </p>

            <h1>
              Learning Progress
            </h1>

            <p>
              Track your progress through the five
              quantum computing lectures.
            </p>
          </div>

        </section>

        {!loading && attempts.length > 0 && <section className="progress-section"><div className="progress-section-heading"><div><p className="progress-label">ASSESSMENTS</p><h2>Recent attempts</h2></div></div><div className="progress-attempts">{attempts.slice(0, 8).map((attempt) => <article className="progress-attempt" key={attempt.id}><strong>{attempt.percentage}%</strong><span>{attempt.score}/{attempt.total} correct</span><small>{new Date(attempt.created_at).toLocaleString()}</small></article>)}</div></section>}

        {/* Loading */}
        {loading && (
          <div className="progress-state">

            <div className="progress-spinner"></div>

            <p>
              Loading your progress...
            </p>

          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="progress-error">

            <div>
              <strong>
                Unable to load progress
              </strong>

              <p>
                {error}
              </p>
            </div>

            <button
              type="button"
              className="retry-progress-button"
              onClick={loadProgress}
            >
              <RefreshCw size={16} />
              Try again
            </button>

          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (
          <>

            {/* Overall Progress */}
            <section className="overall-progress-card">

              <div className="overall-progress-top">

                <div>
                  <p className="progress-label">
                    OVERALL PROGRESS
                  </p>

                  <h2>
                    {completedLectures} of{" "}
                    {lectures.length} lectures
                    completed
                  </h2>
                </div>

                <div className="overall-percentage">
                  {overallProgress}%
                </div>

              </div>

              <div className="overall-progress-bar">

                <div
                  className="overall-progress-fill"
                  style={{
                    width: `${overallProgress}%`,
                  }}
                ></div>

              </div>

              <p className="overall-progress-text">
                Complete each lecture to build your
                quantum computing foundation.
              </p>

            </section>

            {/* Lecture Progress */}
            <section className="lecture-progress-section">

              <div className="progress-section-heading">

                <div>
                  <p className="progress-label">
                    LECTURES
                  </p>

                  <h2>
                    Your learning path
                  </h2>
                </div>

                <span className="progress-count">
                  {lectures.length} Lectures
                </span>

              </div>

              <div className="progress-lecture-list">

                {lectures.map((lecture) => {

                  const lectureProgress =
                    getLectureProgress(
                      lecture.id
                    );

                  const percentage = Math.min(
                    Math.max(
                      lectureProgress.percentage,
                      0
                    ),
                    100
                  );

                  return (
                    <div
                      className="progress-lecture-card"
                      key={lecture.id}
                    >

                      {/* Number */}
                      <div className="progress-lecture-number">
                        {String(
                          lecture.order_no
                        ).padStart(2, "0")}
                      </div>

                      {/* Main Content */}
                      <div className="progress-lecture-main">

                        <div className="progress-lecture-top">

                          <div>

                            <span className="progress-lecture-tag">
                              Lecture{" "}
                              {lecture.order_no}
                            </span>

                            <h3>
                              {lecture.topic}
                            </h3>

                          </div>

                          <div
                            className={`lecture-completion ${
                              lectureProgress.completed
                                ? "completed"
                                : ""
                            }`}
                          >

                            {lectureProgress.completed ? (
                              <>
                                <CheckCircle2
                                  size={17}
                                />
                                Completed
                              </>
                            ) : (
                              <>
                                <Circle
                                  size={17}
                                />
                                Not completed
                              </>
                            )}

                          </div>

                        </div>

                        <p>
                          {lecture.description}
                        </p>

                        <div className="lecture-progress-info">

                          <span>
                            Progress
                          </span>

                          <strong>
                            {Math.round(
                              percentage
                            )}
                            %
                          </strong>

                        </div>

                        <div className="lecture-progress-bar">

                          <div
                            className="lecture-progress-fill"
                            style={{
                              width: `${percentage}%`,
                            }}
                          ></div>

                        </div>

                      </div>

                      {/* Continue */}
                      <Link
                        to="/learn"
                        className="continue-lecture-button"
                      >
                        {lectureProgress.completed
                          ? "Review"
                          : "Continue"}
                      </Link>

                    </div>
                  );
                })}

              </div>

            </section>

            {/* Learning Tip */}
            <section className="progress-tip">

              <Clock3 size={20} />

              <div>

                <h3>
                  Keep a steady pace
                </h3>

                <p>
                  Try completing one lecture at a
                  time and revisit difficult topics
                  before moving ahead.
                </p>

              </div>

            </section>

          </>
        )}

      </main>

      <BottomNavigation />

    </div>
  );
}

export default Progress;

