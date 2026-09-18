import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, RotateCcw, Award, ArrowRight, HelpCircle, Sparkles } from "lucide-react";
import { API_BASE_URL } from "../../services/api";
import "./LectureQuiz.css";

export default function LectureQuiz({ lectureId, onQuizPassed }) {
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

  const loadQuiz = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setResult(null);
      setSelectedAnswers({});

      const res = await fetch(`${API_BASE_URL}/api/lectures/${lectureId}/quiz`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error("Unable to load lecture quiz questions.");
      }

      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err.message || "Failed to load quiz.");
    } finally {
      setLoading(false);
    }
  }, [lectureId, token]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  const handleSelect = (qIndex, option) => {
    if (result) return; // Prevent change after submit
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: option,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(selectedAnswers).length < questions.length) {
      alert("Please answer all 5 questions before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        answers: questions.map((q, idx) => ({
          question: q.question,
          selected: selectedAnswers[idx] || "",
          correct: q.correct || "",
        })),
      };

      const res = await fetch(`${API_BASE_URL}/api/lectures/${lectureId}/quiz/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.detail || "Quiz evaluation failed.");
      }

      const evalData = await res.json();
      setResult(evalData);

      if (evalData.passed && onQuizPassed) {
        onQuizPassed(evalData);
      }
    } catch (err) {
      alert(err.message || "Error submitting quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="lecture-quiz-section">
        <div className="lq-loading">
          <div className="loading-spinner" />
          <p>Generating 5 lecture questions...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="lecture-quiz-section">
        <div className="lq-error">
          <p>{error}</p>
          <button type="button" className="lq-retry-btn" onClick={loadQuiz}>
            <RotateCcw size={15} /> Try Loading Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="lecture-quiz-section" id="lecture-quiz">
      <div className="lq-header">
        <div className="lq-title-group">
          <span className="lq-badge"><Sparkles size={13} /> GATING QUIZ</span>
          <h2>Lecture Mastery Quiz</h2>
          <p className="lq-subtitle">
            Answer at least <strong>3 out of 5</strong> questions correctly to complete this lecture and unlock the next one.
          </p>
        </div>
        <button
          type="button"
          className="lq-refresh-btn"
          onClick={loadQuiz}
          title="Generate fresh random questions"
        >
          <RotateCcw size={14} /> New Questions
        </button>
      </div>

      {result && (
        <div className={`lq-result-banner ${result.passed ? "lq-result-pass" : "lq-result-fail"}`}>
          <div className="lq-result-icon">
            {result.passed ? <CheckCircle2 size={32} color="#10b981" /> : <XCircle size={32} color="#f87171" />}
          </div>
          <div className="lq-result-text">
            <h3>{result.passed ? "🎉 Quiz Passed!" : "⚠️ Needs Improvement"}</h3>
            <p>{result.message}</p>
            <div className="lq-result-stats">
              <span>Score: <strong>{result.correct}/{result.total}</strong> ({result.percentage}%)</span>
              {result.passed && <span className="lq-xp-badge">+{result.xp_awarded} XP Earned</span>}
            </div>
          </div>
          {!result.passed && (
            <button type="button" className="lq-btn lq-btn-retry" onClick={loadQuiz}>
              <RotateCcw size={15} /> Retake with New Questions
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="lq-questions-list">
        {questions.map((q, idx) => {
          const isSelected = (opt) => selectedAnswers[idx] === opt;
          const isCorrectOption = (opt) =>
            result && (opt === q.correct || opt[0]?.toUpperCase() === q.correct[0]?.toUpperCase());
          const isWrongSelection = (opt) =>
            result && isSelected(opt) && !isCorrectOption(opt);

          return (
            <div className="lq-question-card" key={idx}>
              <div className="lq-q-header">
                <span className="lq-q-number">Question {idx + 1} of {questions.length}</span>
                {result && (
                  <span className={`lq-status-badge ${selectedAnswers[idx] === q.correct ? "pass" : "fail"}`}>
                    {selectedAnswers[idx] === q.correct ? "Correct" : "Incorrect"}
                  </span>
                )}
              </div>

              <h4 className="lq-question-text">{q.question}</h4>

              <div className="lq-options-grid">
                {q.options.map((opt, oIdx) => {
                  let optClass = "lq-option-btn";
                  if (isSelected(opt)) optClass += " selected";
                  if (result) {
                    if (isCorrectOption(opt)) optClass += " correct";
                    if (isWrongSelection(opt)) optClass += " wrong";
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      className={optClass}
                      onClick={() => handleSelect(idx, opt)}
                      disabled={Boolean(result)}
                    >
                      <span className="lq-radio-dot" />
                      <span className="lq-opt-label">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {result && q.explanation && (
                <div className="lq-explanation">
                  <HelpCircle size={14} />
                  <span><strong>Explanation:</strong> {q.explanation}</span>
                </div>
              )}
            </div>
          );
        })}

        {!result && (
          <div className="lq-footer-actions">
            <button
              type="submit"
              className="lq-submit-btn"
              disabled={submitting || Object.keys(selectedAnswers).length < questions.length}
            >
              {submitting ? "Evaluating..." : `Submit Quiz (${Object.keys(selectedAnswers).length}/${questions.length} Answered)`}
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
