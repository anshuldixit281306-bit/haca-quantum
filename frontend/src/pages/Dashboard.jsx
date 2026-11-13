import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  Cpu,
  FlaskConical,
  GraduationCap,
  PlayCircle,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";import "./Dashboard.css";

import { API_BASE_URL } from "../services/api";

const defaultLectures = [
  {
    id: 1,
    title: "Introduction to Quantum Computing",
    topic: "Quantum Computing Fundamentals",
    description:
      "Learn the basic ideas behind qubits, quantum states and quantum computing.",
    duration: "25 min",
    progress: 100,
    completed: true,
  },
  {
    id: 2,
    title: "Qubits and Quantum States",
    topic: "Qubits",
    description:
      "Understand qubits, measurement and how quantum information is represented.",
    duration: "30 min",
    progress: 65,
    completed: false,
  },
  {
    id: 3,
    title: "Quantum Gates and Circuits",
    topic: "Quantum Circuits",
    description:
      "Explore common quantum gates and learn how quantum circuits are constructed.",
    duration: "35 min",
    progress: 25,
    completed: false,
  },
  {
    id: 4,
    title: "Quantum Algorithms",
    topic: "Algorithms",
    description:
      "Discover the ideas behind important quantum algorithms and their applications.",
    duration: "40 min",
    progress: 0,
    completed: false,
  },
  {
    id: 5,
    title: "Quantum Programming with Qiskit",
    topic: "Qiskit",
    description:
      "Start writing quantum programs and executing circuits with Qiskit.",
    duration: "45 min",
    progress: 0,
    completed: false,
  },
];

const algorithms = [
  {
    id: "grover",
    name: "Grover's Algorithm",
    description: "Quantum search algorithm for unstructured search problems.",
    level: "Intermediate",
    concept: "Quantum Search",
  },
  {
    id: "shor",
    name: "Shor's Algorithm",
    description: "Quantum algorithm for integer factorization.",
    level: "Advanced",
    concept: "Factorization",
  },
  {
    id: "deutsch-jozsa",
    name: "Deutsch-Jozsa Algorithm",
    description: "Introduces quantum advantage using a promise problem.",
    level: "Intermediate",
    concept: "Quantum Advantage",
  },
  {
    id: "bernstein-vazirani",
    name: "Bernstein-Vazirani Algorithm",
    description: "Find a hidden binary string using quantum queries.",
    level: "Intermediate",
    concept: "Oracle Algorithms",
  },
  {
    id: "teleportation",
    name: "Quantum Teleportation",
    description: "Transfer an unknown quantum state using entanglement.",
    level: "Intermediate",
    concept: "Entanglement",
  },
  {
    id: "qft",
    name: "Quantum Fourier Transform",
    description: "Quantum version of the discrete Fourier transform.",
    level: "Advanced",
    concept: "Fourier Transform",
  },
];

const tools = [
  {
    id: "simulator",
    title: "Circuit Simulator",
    description: "Build and execute quantum circuits.",
    icon: FlaskConical,
    route: "/simulator",
  },
  {
    id: "ai-tutor",
    title: "AI Tutor",
    description: "Ask questions and learn quantum concepts.",
    icon: Brain,
    route: "/ai-tutor",
  },
  {
    id: "code-lab",
    title: "Quantum Code Lab",
    description: "Practice quantum programming.",
    icon: Code2,
    route: "/code-lab",
  },
  {
    id: "challenges",
    title: "Challenges",
    description: "Test your quantum programming skills.",
    icon: Trophy,
    route: "/challenges",
  },
];

function Dashboard() {
  const navigate = useNavigate();

  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [lectures, setLectures] = useState(defaultLectures);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    completedLectures: 1,
    totalLectures: 5,
    assessmentScore: 0,
    learningStreak: 0,
    overallProgress: 20,
    masteredConcepts: 0,
  });

  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [gamification, setGamification] = useState(() => ({
    xp: Number(localStorage.getItem("quantumlearn_xp") || 120),
    dailyComplete: localStorage.getItem("quantumlearn_daily") === "done",
  }));

  useEffect(() => {
    document.documentElement.setAttribute("data-page", "dashboard");

    document.body.classList.add("quantumlearn-dashboard-page");

    return () => {
      document.body.classList.remove("quantumlearn-dashboard-page");
    };
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);

      const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/progress/lectures`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const lectureRows = Array.isArray(data) ? data : [];
          const completedLectures = lectureRows.filter((item) => item.completed).length;
          const overallProgress = lectureRows.length
            ? Math.round(lectureRows.reduce((sum, item) => sum + Number(item.completion_percentage || 0), 0) / lectureRows.length)
            : 0;

          setDashboardData((previous) => ({
            ...previous,
            completedLectures,
            totalLectures: lectureRows.length || previous.totalLectures,
            overallProgress,
          }));
        }
      } catch (error) {
        console.warn("Dashboard progress API unavailable:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (!token) return;
    fetch(`${API_BASE_URL}/api/recommendations`, { headers: { Authorization: `Bearer ${token}` } }).then((response) => response.ok ? response.json() : null).then((data) => setRecommendations(data?.recommendations || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const loadLectures = async () => {
      const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/lectures`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) return;

        const data = await response.json();

        const apiLectures = extractLectures(data);

        if (apiLectures.length > 0) {
          setLectures(apiLectures);
        }
      } catch (error) {
        console.warn("Lecture API unavailable:", error);
      }
    };

    loadLectures();
  }, []);

  const firstName = useMemo(() => {
    if (!user) return "Explorer";

    return (
      user.first_name ||
      user.firstName ||
      user.name?.split(" ")[0] ||
      user.username ||
      "Explorer"
    );
  }, [user]);

  const continueLecture = useMemo(() => {
    const incomplete = lectures.find(
      (lecture) =>
        !lecture.completed &&
        Number(lecture.progress || 0) > 0
    );

    if (incomplete) return incomplete;

    const nextLecture = lectures.find(
      (lecture) => !lecture.completed
    );

    return nextLecture || lectures[0];
  }, [lectures]);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return [];

    const results = [];

    algorithms.forEach((algorithm) => {
      const searchableText = `
        ${algorithm.name}
        ${algorithm.description}
        ${algorithm.concept}
        ${algorithm.level}
      `.toLowerCase();

      if (searchableText.includes(query)) {
        results.push({
          type: "Algorithm",
          title: algorithm.name,
          subtitle: algorithm.concept,
          icon: Cpu,
          action: () => navigate(`/algorithms/${algorithm.id}`),
        });
      }
    });

    lectures.forEach((lecture) => {
      const searchableText = `
        ${lecture.title}
        ${lecture.topic}
        ${lecture.description}
      `.toLowerCase();

      if (searchableText.includes(query)) {
        results.push({
          type: "Lecture",
          title: lecture.title,
          subtitle: lecture.topic,
          icon: BookOpen,
          action: () => navigate("/learn"),
        });
      }
    });

    const concepts = [
      {
        title: "Superposition",
        subtitle: "Quantum states",
        keywords: "superposition quantum state qubit",
      },
      {
        title: "Entanglement",
        subtitle: "Quantum correlation",
        keywords: "entanglement bell state correlation",
      },
      {
        title: "Quantum Gates",
        subtitle: "Circuit fundamentals",
        keywords: "gates h x y z cnot circuit",
      },
      {
        title: "Qubits",
        subtitle: "Quantum information",
        keywords: "qubit quantum bit state",
      },
      {
        title: "Measurement",
        subtitle: "Quantum measurement",
        keywords: "measurement probability collapse",
      },
    ];

    concepts.forEach((concept) => {
      if (
        `${concept.title} ${concept.subtitle} ${concept.keywords}`
          .toLowerCase()
          .includes(query)
      ) {
        results.push({
          type: "Concept",
          title: concept.title,
          subtitle: concept.subtitle,
          icon: GraduationCap,
          action: () => navigate("/learn"),
        });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery, lectures, navigate]);

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearchQuery(value);
    setShowSearchResults(value.trim().length > 0);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (searchResults.length > 0) {
      searchResults[0].action();
      clearSearch();
    }
  };

  const handleLectureClick = (lecture) => {
    navigate(`/learn/${lecture.id}`);
  };

  const handleContinueLearning = () => {
    if (!continueLecture) {
      navigate("/learn");
      return;
    }

    handleLectureClick(continueLecture);
  };

  const handleAlgorithmClick = (algorithm) => {
    navigate(`/algorithms/${algorithm.id}`);
  };

  const completeDailyQuest = () => {
    if (gamification.dailyComplete) {
      navigate("/studio");
      return;
    }

    const nextXp = gamification.xp + 25;
    localStorage.setItem("quantumlearn_xp", String(nextXp));
    localStorage.setItem("quantumlearn_daily", "done");
    setGamification({ xp: nextXp, dailyComplete: true });
  };

  const completionPercentage =
    dashboardData.totalLectures > 0
      ? Math.round(
          (dashboardData.completedLectures /
            dashboardData.totalLectures) *
            100
        )
      : 0;

  const overallProgress = Math.max(
    0,
    Math.min(
      100,
      Number(
        dashboardData.overallProgress || completionPercentage || 0
      )
    )
  );

  return (
    <div className="dashboard-page">
      <main className="dashboard-main" aria-busy={loading}>
        {/* Header */}
        <section className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">
              <Sparkles size={15} />
              Quantum Learning Workspace
            </p>

            <h1>
              Welcome back,{" "}
              <span>{firstName}</span>
            </h1>

            <p className="dashboard-subtitle">
              Continue your quantum computing journey and strengthen
              your understanding through practice.
            </p>
          </div>

          <div className="dashboard-header-badge">
            <div className="header-badge-icon">
              <GraduationCap size={21} />
            </div>

            <div>
              <strong>Student</strong>
              <span>Quantum Explorer</span>
            </div>
          </div>
        </section>

        {/* Search */}
        <section className="dashboard-search-section">
          <form
            className="dashboard-search"
            onSubmit={handleSearchSubmit}
          >
            <Search size={20} />

            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => {
                if (searchQuery.trim()) {
                  setShowSearchResults(true);
                }
              }}
              placeholder="Search algorithms, lectures, concepts..."
              aria-label="Search QuantumLearn"
            />

            {searchQuery && (
              <button
                type="button"
                className="search-clear-button"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}

            <button
              type="submit"
              className="search-submit-button"
            >
              Search
            </button>

            {showSearchResults && (
              <div className="dashboard-search-results">
                {searchResults.length > 0 ? (
                  searchResults.map((result, index) => {
                    const ResultIcon = result.icon;

                    return (
                      <button
                        key={`${result.type}-${result.title}-${index}`}
                        type="button"
                        className="dashboard-search-result"
                        onClick={() => {
                          result.action();
                          clearSearch();
                        }}
                      >
                        <span className="search-result-icon">
                          <ResultIcon size={17} />
                        </span>

                        <span className="search-result-content">
                          <strong>{result.title}</strong>
                          <small>{result.subtitle}</small>
                        </span>

                        <span className="search-result-type">
                          {result.type}
                        </span>

                        <ChevronRight size={16} />
                      </button>
                    );
                  })
                ) : (
                  <div className="search-empty">
                    <Search size={19} />
                    <span>
                      No matching content found for "{searchQuery}".
                    </span>
                  </div>
                )}
              </div>
            )}
          </form>
        </section>

        {/* Stats */}
        <section className="dashboard-stats-grid">
          <div className="dashboard-stat-card">
            <div className="stat-icon stat-blue">
              <BookOpen size={20} />
            </div>

            <div className="stat-content">
              <span>Lectures Completed</span>
              <strong>
                {dashboardData.completedLectures}
                <small>
                  /{dashboardData.totalLectures}
                </small>
              </strong>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon stat-green">
              <Target size={20} />
            </div>

            <div className="stat-content">
              <span>Overall Progress</span>
              <strong>{overallProgress}%</strong>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon stat-purple">
              <TrendingUp size={20} />
            </div>

            <div className="stat-content">
              <span>Assessment Score</span>
              <strong>
                {dashboardData.assessmentScore || 0}%
              </strong>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon stat-orange">
              <Zap size={20} />
            </div>

            <div className="stat-content">
              <span>Learning Streak</span>
              <strong>
                {dashboardData.learningStreak || 0}
                <small> days</small>
              </strong>
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="gamification-card">
            <div className="gamification-badge">
              <Trophy size={22} />
            </div>
            <div className="gamification-copy">
              <p className="section-label">QUANTUM QUEST</p>
              <h2>Keep your momentum going.</h2>
              <p>Complete today&apos;s experiment to earn XP and move closer to your next badge.</p>
            </div>
            <div className="gamification-progress">
              <strong>{gamification.xp} <small>XP</small></strong>
              <span>Explorer · Level 2</span>
              <div><i style={{ width: `${Math.min((gamification.xp % 250) / 250 * 100, 100)}%` }} /></div>
            </div>
            <button type="button" className="primary-button" onClick={completeDailyQuest}>
              {gamification.dailyComplete ? "Explore again" : "Earn 25 XP"}
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* Continue Learning */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <p className="section-label">YOUR LEARNING</p>
              <h2>Continue Learning</h2>
            </div>

            <button
              type="button"
              className="section-link"
              onClick={() => navigate("/learn")}
            >
              View all
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="continue-learning-card">
            <div className="continue-learning-left">
              <div className="continue-icon">
                <PlayCircle size={28} />
              </div>

              <div className="continue-content">
                <span className="continue-label">
                  {continueLecture?.progress > 0
                    ? "Continue where you left off"
                    : "Start your next lesson"}
                </span>

                <h3>
                  {continueLecture?.title ||
                    "Start learning quantum computing"}
                </h3>

                <p>
                  {continueLecture?.description ||
                    "Explore your next quantum computing lesson."}
                </p>

                <div className="continue-meta">
                  <span>
                    <Clock3 size={15} />
                    {continueLecture?.duration || "30 min"}
                  </span>

                  <span>
                    <BookOpen size={15} />
                    {continueLecture?.topic || "Quantum Computing"}
                  </span>
                </div>
              </div>
            </div>

            <div className="continue-learning-right">
              <div className="progress-ring-simple">
                <strong>
                  {continueLecture?.progress || 0}%
                </strong>
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={handleContinueLearning}
              >
                {continueLecture?.progress > 0
                  ? "Continue"
                  : "Start Lecture"}
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </section>

        {/* Learning Progress */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <p className="section-label">YOUR JOURNEY</p>
              <h2>Learning Progress</h2>
            </div>

            <button
              type="button"
              className="section-link"
              onClick={() => navigate("/progress")}
            >
              Full progress
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="learning-progress-card">
            <div className="progress-card-top">
              <div>
                <span>Overall learning progress</span>
                <strong>{overallProgress}%</strong>
              </div>

              <div className="progress-card-icon">
                <TrendingUp size={22} />
              </div>
            </div>

            <div className="large-progress-bar">
              <div
                className="large-progress-fill"
                style={{
                  width: `${overallProgress}%`,
                }}
              ></div>
            </div>

            <div className="progress-card-bottom">
              <span>
                {dashboardData.completedLectures} of{" "}
                {dashboardData.totalLectures} lectures completed
              </span>

              <span>
                {dashboardData.masteredConcepts || 0} concepts mastered
              </span>
            </div>
          </div>
        </section>

        {/* Lectures */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <p className="section-label">COURSE CONTENT</p>
              <h2>Recent Lectures</h2>
            </div>

            <button
              type="button"
              className="section-link"
              onClick={() => navigate("/learn")}
            >
              All lectures
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="lectures-grid">
            {lectures.slice(0, 5).map((lecture) => (
              <button
                type="button"
                key={lecture.id}
                className="lecture-card"
                onClick={() => handleLectureClick(lecture)}
              >
                <div className="lecture-card-top">
                  <div className="lecture-number">
                    {String(lecture.id).padStart(2, "0")}
                  </div>

                  {lecture.completed ? (
                    <span className="completed-badge">
                      <CheckCircle2 size={14} />
                      Completed
                    </span>
                  ) : (
                    <span className="lecture-progress-label">
                      {lecture.progress || 0}%
                    </span>
                  )}
                </div>

                <div className="lecture-card-content">
                  <span>{lecture.topic}</span>

                  <h3>{lecture.title}</h3>

                  <p>{lecture.description}</p>
                </div>

                <div className="lecture-card-footer">
                  <span>
                    <Clock3 size={14} />
                    {lecture.duration}
                  </span>

                  <span className="lecture-open">
                    Open
                    <ChevronRight size={16} />
                  </span>
                </div>

                <div className="lecture-progress">
                  <div
                    style={{
                      width: `${lecture.progress || 0}%`,
                    }}
                  ></div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Tools */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <p className="section-label">PRACTICE</p>
              <h2>Learning Tools</h2>
            </div>
          </div>

          <div className="tools-grid">
            {tools.map((tool) => {
              const ToolIcon = tool.icon;

              return (
                <button
                  type="button"
                  key={tool.id}
                  className="tool-card"
                  onClick={() => navigate(tool.route)}
                >
                  <div className="tool-icon">
                    <ToolIcon size={22} />
                  </div>

                  <div className="tool-content">
                    <h3>{tool.title}</h3>
                    <p>{tool.description}</p>
                  </div>

                  <ChevronRight
                    className="tool-arrow"
                    size={18}
                  />
                </button>
              );
            })}
          </div>
        </section>

        {/* Algorithms */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <p className="section-label">EXPLORE</p>
              <h2>Quantum Algorithms</h2>
            </div>

            <button
              type="button"
              className="section-link"
              onClick={() => navigate("/algorithms")}
            >
              View all
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="algorithms-grid">
            {algorithms.slice(0, 6).map((algorithm) => (
              <button
                type="button"
                key={algorithm.id}
                className="algorithm-card"
                onClick={() => handleAlgorithmClick(algorithm)}
              >
                <div className="algorithm-card-top">
                  <div className="algorithm-icon">
                    <Cpu size={20} />
                  </div>

                  <span
                    className={`algorithm-level ${algorithm.level
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {algorithm.level}
                  </span>
                </div>

                <h3>{algorithm.name}</h3>

                <p>{algorithm.description}</p>

                <div className="algorithm-card-footer">
                  <span>{algorithm.concept}</span>

                  <span>
                    Learn
                    <ChevronRight size={15} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Personalized Section */}
        <section className="dashboard-section">
          <div className="personalized-card">
            <div className="personalized-icon">
              <Brain size={26} />
            </div>

            <div className="personalized-content">
              <span className="section-label">
                PERSONALIZED LEARNING
              </span>

              <h2>
                Your learning path gets smarter with every activity.
              </h2>

              <p>
                Assessment results, lecture progress, practice
                attempts and simulator activity can be used to
                identify concepts that need more practice and
                recommend what you should learn next.
              </p>

              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/progress")}
              >
                View recommendations
                <ArrowRight size={17} />
              </button>
            </div>

            <div className="personalized-decoration">
              <Target size={75} strokeWidth={1} />
            </div>
          </div>
        </section>

        {recommendations.length > 0 && <section className="dashboard-section">
          <div className="section-heading"><div><p className="section-label">PERSONALIZED</p><h2>Recommended next</h2></div></div>
          <div className="tools-grid">{recommendations.map((item) => <button type="button" className="tool-card" key={`${item.type}-${item.lecture_id}`} onClick={() => navigate(`/learn?lecture=${item.lecture_id}`)}><div className="tool-content"><h3>{item.title}</h3><p>{item.reason}</p></div><ChevronRight size={18} /></button>)}</div>
        </section>}

        {/* Bottom CTA */}
        <section className="dashboard-cta">
          <div>
            <span>READY TO PRACTICE?</span>
            <h2>Build your next quantum circuit.</h2>
            <p>
              Experiment with quantum gates and see how your circuit
              behaves.
            </p>
          </div>

          <button
            type="button"
            className="cta-button"
            onClick={() => navigate("/simulator")}
          >
            Open Simulator
            <ArrowRight size={18} />
          </button>
        </section>
      </main>

      {/* IMPORTANT: ONE reusable global student navigation */}
    </div>
  );
}

function extractLectures(data) {
  if (Array.isArray(data)) {
    return normalizeLectures(data);
  }

  if (Array.isArray(data?.lectures)) {
    return normalizeLectures(data.lectures);
  }

  if (Array.isArray(data?.courses)) {
    const allLectures = data.courses.flatMap(
      (course) => course.lectures || []
    );

    return normalizeLectures(allLectures);
  }

  return [];
}

function normalizeLectures(items) {
  return items.map((item, index) => ({
    id: item.id ?? item.lecture_id ?? index + 1,
    title:
      item.title ??
      item.name ??
      `Lecture ${index + 1}`,
    topic:
      item.topic ??
      item.subject ??
      "Quantum Computing",
    description:
      item.description ??
      "Explore this quantum computing lesson.",
    duration:
      item.duration ??
      item.duration_text ??
      "30 min",
    progress:
      Number(
        item.progress ??
          item.progress_percentage ??
          item.completion_percentage ??
          0
      ) || 0,
    completed:
      Boolean(
        item.completed ??
          item.is_completed ??
          Number(item.progress || 0) >= 100
      ),
  }));
}

export default Dashboard;