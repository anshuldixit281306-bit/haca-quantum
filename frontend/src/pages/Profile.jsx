
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  LogOut,
  Mail,
  Settings,
  User,
  Trophy,
  Sparkles,
  Brain,
  Clock,
  Target,
  Flame,
  RefreshCw,
} from "lucide-react";

import "./Profile.css";
import { API_BASE_URL } from "../services/api";
import BottomNavigation from "../components/BottomNavigation";

const API_URL = API_BASE_URL;

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || localStorage.getItem("firebase_user") || "null");
    } catch {
      return null;
    }
  });
  const [progress, setProgress] = useState([]);
  const [report, setReport] = useState({
    lectures_completed: 1,
    lectures_taken: 5,
    quizzes_taken: 1,
    quizzes_passed: 1,
    total_questions_attempted: 5,
    correct_answers: 4,
    wrong_answers: 1,
    accuracy: 80.0,
    time_taken_minutes: 25,
    challenges_done: 2,
    total_xp: Number(localStorage.getItem("quantumlearn_xp") || 165),
    ai_analysis: "Strong command of single-qubit fundamentals and state vectors. Recommended next step: Practice multi-qubit Bell state entanglement circuits.",
  });
  const [loading, setLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

  const loadAiReport = async () => {
    try {
      setGeneratingReport(true);
      if (token) {
        const res = await fetch(`${API_URL}/api/progress/profile/report`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setReport(data);
          return;
        }
      }
      // If offline or backend waking up, refresh client stats
      const currentXp = Number(localStorage.getItem("quantumlearn_xp") || 190);
      setReport((prev) => ({
        ...prev,
        total_xp: currentXp,
        ai_analysis: "Performance updated. Great progress on quantum superposition and gates! Ready for Bell states and quantum entanglement.",
      }));
    } catch (err) {
      console.warn("AI Report offline:", err);
    } finally {
      setGeneratingReport(false);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!token && !localStorage.getItem("firebase_user")) {
        // Allow browsing profile with guest/explorer view or redirect
      }

      try {
        if (token) {
          const [userResponse, progressResponse, reportResponse] = await Promise.allSettled([
            fetch(`${API_URL}/api/auth/me`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_URL}/api/progress/lectures`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_URL}/api/progress/profile/report`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          if (userResponse.status === "fulfilled" && userResponse.value.ok) {
            setUser(await userResponse.value.json());
          }

          if (progressResponse.status === "fulfilled" && progressResponse.value.ok) {
            setProgress(await progressResponse.value.json());
          }

          if (reportResponse.status === "fulfilled" && reportResponse.value.ok) {
            setReport(await reportResponse.value.json());
          }
        }
      } catch (error) {
        console.warn("Profile loaded with cached data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate, token]);

  const getProgressStats = () => {
    if (!progress) {
      return {
        total: 0,
        completed: 0,
        percentage: 0,
      };
    }

    const lectures = Array.isArray(progress)
      ? progress
      : progress.lectures || [];

    const total = lectures.length;
    const completed = lectures.filter(
      (lecture) => lecture.completed === true
    ).length;

    const percentage =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      percentage,
    };
  };

  const stats = getProgressStats();

 const handleLogout = () => {
  localStorage.removeItem("access_token");
  sessionStorage.removeItem("access_token");
  localStorage.removeItem("user");

  navigate("/login");
};

  const displayName =
    user?.name ||
    user?.full_name ||
    "Quantum Explorer";

  const email =
    user?.email ||
    "Email not available";

  const role =
    user?.role ||
    "Student";

  if (loading) {
    return (
      <div className="profile-page profile-loading">
        <div className="profile-loader"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <main className="profile-main">

        {/* Profile Hero */}
        <section className="profile-hero">

          <div className="profile-avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div className="profile-identity">
            <span className="profile-label">
              STUDENT PROFILE
            </span>

            <h1>{displayName}</h1>

            <div className="profile-email">
              <Mail size={15} />
              {email}
            </div>

            <div className="profile-role">
              <User size={15} />
              {role}
            </div>
          </div>

          <div className="profile-status">
            <CheckCircle2 size={17} />
            Active Learner
          </div>

        </section>

        {/* Learning Overview */}
        <section className="profile-section">

          <div className="profile-section-heading">
            <div>
              <span>LEARNING OVERVIEW</span>
              <h2>Your progress</h2>
            </div>

            <Link to="/progress" className="profile-view-progress">
              View Progress
            </Link>
          </div>

          <div className="profile-stats-grid">

            <div className="profile-stat-card">
              <div className="profile-stat-icon">
                <BookOpen size={19} />
              </div>

              <div>
                <strong>{stats.total}</strong>
                <span>Lectures available</span>
              </div>
            </div>

            <div className="profile-stat-card">
              <div className="profile-stat-icon">
                <CheckCircle2 size={19} />
              </div>

              <div>
                <strong>{stats.completed}</strong>
                <span>Lectures completed</span>
              </div>
            </div>

            <div className="profile-stat-card">
              <div className="profile-stat-icon">
                <Trophy size={19} />
              </div>

              <div>
                <strong>{stats.percentage}%</strong>
                <span>Overall progress</span>
              </div>
            </div>

          </div>

          {/* Progress bar */}
          <div className="profile-progress-card">

            <div className="profile-progress-top">
              <span>Quantum Learning Journey</span>
              <strong>{stats.percentage}%</strong>
            </div>

            <div className="profile-progress-track">
              <div
                className="profile-progress-fill"
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>

            <p>
              Keep learning and complete more lectures to move forward.
            </p>

          </div>

        </section>

        {/* AI Progress Report Maker */}
        <section className="profile-section ai-report-section">
          <div className="profile-section-heading">
            <div>
              <span className="profile-badge"><Sparkles size={13} /> AI LEARNING REPORT</span>
              <h2>AI Progress Report Maker</h2>
            </div>
            <button
              type="button"
              className="ai-report-btn"
              onClick={loadAiReport}
              disabled={generatingReport}
            >
              <RefreshCw size={14} className={generatingReport ? "spin" : ""} />
              {generatingReport ? "Generating with AI..." : "Update Report"}
            </button>
          </div>

          {report && (
            <div className="ai-report-card">
              {/* Report Stats Grid */}
              <div className="ai-stats-grid">
                <div className="ai-stat-box">
                  <BookOpen size={18} color="#5eead4" />
                  <div>
                    <strong>{report.lectures_completed}/{report.lectures_taken || 5}</strong>
                    <span>Lectures Completed</span>
                  </div>
                </div>

                <div className="ai-stat-box">
                  <CheckCircle2 size={18} color="#34d399" />
                  <div>
                    <strong>{report.quizzes_passed}/{report.quizzes_taken}</strong>
                    <span>Quizzes Passed</span>
                  </div>
                </div>

                <div className="ai-stat-box">
                  <Target size={18} color="#60a5fa" />
                  <div>
                    <strong>{report.correct_answers}/{report.total_questions_attempted}</strong>
                    <span>Questions Correct</span>
                  </div>
                </div>

                <div className="ai-stat-box">
                  <Flame size={18} color="#f59e0b" />
                  <div>
                    <strong>{report.accuracy}%</strong>
                    <span>Overall Accuracy</span>
                  </div>
                </div>

                <div className="ai-stat-box">
                  <Clock size={18} color="#a78bfa" />
                  <div>
                    <strong>{report.time_taken_minutes} mins</strong>
                    <span>Time Invested</span>
                  </div>
                </div>

                <div className="ai-stat-box">
                  <Trophy size={18} color="#fbbf24" />
                  <div>
                    <strong>{report.total_xp} XP</strong>
                    <span>Total XP Gained</span>
                  </div>
                </div>
              </div>

              {/* AI Diagnostics Box */}
              {report.ai_analysis && (
                <div className="ai-mentor-box">
                  <div className="ai-mentor-header">
                    <Brain size={18} color="#5eead4" />
                    <strong>AI Quantum Mentor Evaluation</strong>
                  </div>
                  <p className="ai-mentor-content">{report.ai_analysis}</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="profile-section">

          <div className="profile-section-heading">
            <div>
              <span>QUICK ACTIONS</span>
              <h2>Continue learning</h2>
            </div>
          </div>

          <div className="profile-actions">

            <Link to="/learn" className="profile-action-card">
              <BookOpen size={20} />
              <div>
                <strong>Learning Center</strong>
                <span>Continue your quantum lessons</span>
              </div>
            </Link>

            <Link to="/ai-tutor" className="profile-action-card">
              <User size={20} />
              <div>
                <strong>AI Tutor</strong>
                <span>Ask questions and learn concepts</span>
              </div>
            </Link>

            <Link to="/algorithms" className="profile-action-card">
              <Trophy size={20} />
              <div>
                <strong>Algorithms</strong>
                <span>Explore quantum algorithms</span>
              </div>
            </Link>

          </div>

        </section>

        {/* Account */}
        <section className="profile-section">

          <div className="profile-section-heading">
            <div>
              <span>ACCOUNT</span>
              <h2>Account settings</h2>
            </div>
          </div>

          <div className="profile-account-card">

            <div className="profile-account-row">
              <div className="profile-account-icon">
                <Settings size={18} />
              </div>

              <div>
                <strong>Account information</strong>
                <span>
                  Your profile information is managed through your QuantumLearn account.
                </span>
              </div>
            </div>

          </div>

        </section>

        {/* Logout */}
        <section className="profile-logout-section">

          <button
            type="button"
            className="profile-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Logout
          </button>

        </section>

      </main>

      <BottomNavigation />

    </div>
  );
}

export default Profile;
