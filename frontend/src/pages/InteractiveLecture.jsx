/**
 * InteractiveLecture — the "Interactive Visual Lecture" player page.
 *
 * WATCH (YouTube left) → SEE (live visualization right) → UNDERSTAND
 * (explanations + flowchart) → INTERACT (Explore panel) → SIMULATE (real
 * Qiskit runs) → PRACTICE (prediction questions).
 *
 * All concept timing comes from GET /api/lectures/{id}/timeline; all
 * quantum data from POST /api/quantum/simulate; all gamification from
 * POST /api/lectures/{id}/interactions.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FlaskConical, Rocket, Sparkles } from "lucide-react";

import {
  extractYoutubeId,
  formatTime,
  useYouTubePlayer,
} from "../components/visuals/useYouTubePlayer";
import { useConceptSimulation } from "../components/visuals/useConceptSimulation";
import ConceptVisualizer from "../components/visuals/ConceptVisualizer";
import AnimatedFlowchart from "../components/visuals/AnimatedFlowchart";
import LectureTimeline from "../components/visuals/LectureTimeline";
import CodeVisualizer from "../components/visuals/CodeVisualizer";
import QuizCard from "../components/visuals/QuizCard";
import LectureQuiz from "../components/visuals/LectureQuiz";
import ExplorePanel from "../components/visuals/ExplorePanel";
import {
  fetchLectureTimeline,
  recordLectureInteraction,
} from "../services/lectureApi";

const YT_PAUSED = 2;

function InteractiveLecture() {
  const { lectureId } = useParams();
  const navigate = useNavigate();

  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showExplore, setShowExplore] = useState(false);
  const [completedIndexes, setCompletedIndexes] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);

  const playingRef = useRef(false);
  const timeRef = useRef(0);
  const watchedRef = useRef(new Set());
  const completedRef = useRef(new Set());
  const exploredRef = useRef(new Set());

  const segments = useMemo(() => timeline?.segments || [], [timeline]);

  const pushToast = useCallback((text) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((previous) => [...previous, { id, text }]);
    setTimeout(() => {
      setToasts((previous) => previous.filter((toast) => toast.id !== id));
    }, 3400);
  }, []);

  // ------------------------------------------------------------
  // Load the visual timeline
  // ------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");
    setTimeline(null);
    setCompletedIndexes([]);
    watchedRef.current = new Set();
    completedRef.current = new Set();
    exploredRef.current = new Set();

    fetchLectureTimeline(lectureId)
      .then((data) => {
        if (!cancelled) setTimeline(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Unable to load lecture.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lectureId, reloadKey]);

  // ------------------------------------------------------------
  // YouTube player + timestamp tracking
  // ------------------------------------------------------------

  const handlePlayerState = useCallback((state) => {
    if (state === YT_PAUSED) {
      setShowExplore(true);
    }
  }, []);

  const player = useYouTubePlayer({
    videoId: extractYoutubeId(timeline?.youtube_url),
    onStateChange: handlePlayerState,
  });

  useEffect(() => {
    playingRef.current = player.playing;
  }, [player.playing]);

  useEffect(() => {
    timeRef.current = player.currentTime;
  }, [player.currentTime]);

  const activeIndex = useMemo(
    () =>
      segments.findIndex(
        (segment) =>
          player.currentTime >= segment.start &&
          player.currentTime < (segment.end || segment.start + 1)
      ),
    [segments, player.currentTime]
  );

  const activeSegment = activeIndex >= 0 ? segments[activeIndex] : null;
  const activeSegmentRef = useRef(activeSegment);
  activeSegmentRef.current = activeSegment;

  const simulation = useConceptSimulation(activeSegment?.simulation);

  // ------------------------------------------------------------
  // Meaningful-progress gamification (never blocks the lecture)
  // ------------------------------------------------------------

  const record = useCallback(
    async (eventType, extra = {}) => {
      try {
        const result = await recordLectureInteraction(lectureId, {
          event_type: eventType,
          concept: extra.concept ?? activeSegmentRef.current?.concept ?? "",
          segment_id: extra.segment_id ?? activeSegmentRef.current?.id ?? null,
          video_time: timeRef.current,
          ...extra,
        });

        if (result?.xp_awarded) {
          pushToast(
            `⭐ +${result.xp_awarded} XP · ${eventType.replaceAll("_", " ")}`
          );
        }
      } catch {
        // XP is best-effort; offline/unauthenticated learners still learn.
      }
    },
    [lectureId, pushToast]
  );

  // Watched: the video is actually playing and reached a new concept.
  useEffect(() => {
    const segment = activeSegment;
    if (!segment || !player.playing) return;

    const key = segment.concept || `${segment.start}`;
    if (watchedRef.current.has(key)) return;

    watchedRef.current.add(key);
    record("lecture_concept_watched", {
      concept: segment.concept,
      segment_id: segment.id ?? null,
    });
  }, [activeSegment, player.playing, record]);

  // Completed: playback genuinely passed the end of a segment window.
  useEffect(() => {
    if (!segments.length) return;

    const current = player.currentTime;

    segments.forEach((segment, index) => {
      const end = segment.end || segment.start + 1;
      const key = segment.concept || `${segment.start}`;

      if (
        completedRef.current.has(key) ||
        current < end - 1.5 ||
        current > end + 45
      ) {
        return;
      }

      completedRef.current.add(key);
      setCompletedIndexes((previous) => [...new Set([...previous, index])]);
      record("concept_completed", {
        concept: segment.concept,
        segment_id: segment.id ?? null,
      });
    });
  }, [player.currentTime, segments, record]);

  // Explored: the learner opened the hands-on panel for this concept.
  useEffect(() => {
    if (!showExplore || !activeSegment) return;

    const key = activeSegment.concept || `${activeSegment.start}`;
    if (exploredRef.current.has(key)) return;

    exploredRef.current.add(key);
    record("visualization_explored", {
      concept: activeSegment.concept,
      segment_id: activeSegment.id ?? null,
    });
  }, [showExplore, activeSegment, record]);

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  if (loading) {
    return (
      <div className="interactive-lecture">
        <div className="il-state-block">
          <div className="loading-spinner" />
          <p className="ql-muted">Loading visual lecture…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="interactive-lecture">
        <div className="il-state-block">
          <span className="ql-badge">⚠ {error}</span>
          <Link className="ql-btn" to="/learn">
            ← Back to Learning Path
          </Link>
        </div>
      </div>
    );
  }

  if (!timeline) return null;

  const videoId = extractYoutubeId(timeline.youtube_url);

  return (
    <div className="interactive-lecture">
      <header className="il-header">
        <Link to="/learn" className="ql-btn">
          <ArrowLeft size={15} /> Learning Path
        </Link>

        <div className="il-header-title">
          <span className="ql-badge">Interactive Visual Lecture</span>
          <h1>{timeline.title}</h1>
        </div>

        <span className="ql-badge ql-mono">
          {formatTime(player.duration || 0)}
        </span>
      </header>

      <main className="il-split">
        {/* LEFT — YouTube lecture */}
        <section className="il-video">
          {player.failed || !videoId ? (
            <div className="il-fallback">
              {videoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={timeline.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <p className="ql-badge">No YouTube video configured</p>
                  <p className="ql-muted">
                    Timed visuals still work — use the flowchart to explore
                    each concept.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div ref={player.hostRef} className="il-player-host" />
          )}

          <div className="il-video-meta ql-pill-row">
            <span className="ql-badge ql-mono">
              ⏱ {formatTime(player.currentTime)}
            </span>
            <span className="ql-badge">
              {player.playing ? "▶ playing" : "⏸ paused"}
            </span>
            {activeSegment ? (
              <span className="ql-badge">
                now: <b>{activeSegment.title}</b>
              </span>
            ) : null}
          </div>

          <div className="il-actions ql-pill-row">
            <button
              type="button"
              className="ql-btn"
              onClick={() => setShowExplore((value) => !value)}
            >
              <FlaskConical size={14} />
              {showExplore ? "Hide Explorer" : "Explore This Concept"}
            </button>

            <button
              type="button"
              className="ql-btn"
              disabled={!activeSegment?.simulation}
              onClick={() => {
                if (activeSegment?.simulation) {
                  navigate("/simulator", {
                    state: {
                      preload: {
                        ...activeSegment.simulation,
                        title: activeSegment.title,
                      },
                    },
                  });
                }
              }}
            >
              <Rocket size={14} /> Try in Simulator →
            </button>
          </div>
        </section>

        {/* RIGHT — live synchronized visualization */}
        <section className="il-panel">
          <div className="il-flow-panel">
            <AnimatedFlowchart
              segments={segments}
              currentIndex={activeIndex}
              completed={new Set(completedIndexes)}
              onSelect={(index) => {
                const segment = segments[index];
                if (segment) player.seekTo(segment.start + 1);
              }}
            />
          </div>

          <ConceptVisualizer
            segment={activeSegment}
            sim={simulation.result}
            loading={simulation.loading}
            error={simulation.error}
            onRetry={() => simulation.run()}
            timelineSource={timeline.source}
          />
        </section>
      </main>

      {/* CODE — synchronized with the active concept */}
      {activeSegment?.code?.lines?.length ? (
        <CodeVisualizer
          code={activeSegment.code}
          activeConcept={activeSegment.concept}
        />
      ) : null}

      {/* INTERACT — pause & explore with real simulations */}
      {showExplore && activeSegment ? (
        <ExplorePanel
          segment={activeSegment}
          onSimulated={() =>
            record("simulation_run", {
              concept: activeSegment.concept,
              segment_id: activeSegment.id ?? null,
            })
          }
        />
      ) : null}

      {/* PRACTICE — quick prediction question */}
      <QuizCard
        question={activeSegment?.question}
        concept={activeSegment?.concept}
        onAnswered={(correct) =>
          record(correct ? "question_correct" : "question_incorrect", {
            concept: activeSegment?.concept,
            segment_id: activeSegment?.id ?? null,
            correct,
          })
        }
      />

      {/* Timestamp strip */}
      <LectureTimeline
        segments={segments}
        currentTime={player.currentTime}
        duration={player.duration}
        onSeek={player.seekTo}
      />

      {/* 5-Question Lecture Gating Quiz */}
      <LectureQuiz
        lectureId={lectureId}
        onQuizPassed={(evalData) => {
          pushToast(`🎉 Lecture Quiz Passed (+${evalData.xp_awarded} XP)! Next lecture unlocked.`);
        }}
      />

      <footer className="ql-pill-row" style={{ justifyContent: "center", padding: "12px 0 30px" }}>
        <span className="ql-badge">
          <Sparkles size={12} /> concepts completed: {completedIndexes.length}/
          {segments.length}
        </span>
      </footer>

      <div className="ql-xp-toast">
        {toasts.map((toast) => (
          <div className="ql-xp-item" key={toast.id}>
            {toast.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default InteractiveLecture;
