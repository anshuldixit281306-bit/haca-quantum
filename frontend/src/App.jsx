import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import AITutor from "./pages/AITutor";
import CircuitSimulator from "./pages/CircuitSimulator";
import Algorithms from "./pages/Algorithms";
import Learn from "./pages/Learn";
import LecturePlayer from "./pages/LecturePlayer";
import InteractiveLecture from "./pages/InteractiveLecture";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import CodeLab from "./pages/CodeLab";
import Challenges from "./pages/Challenges";
import AlgorithmDetail from "./pages/AlgorithmDetail";
import AdminDashboard from "./pages/AdminDashboard";
import Landing from "./pages/Landing";
import QuantumStudio from "./pages/QuantumStudio";

import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Signup from "./pages/Signup";
import { AdminRoute, ProtectedRoute } from "./components/ProtectedRoute";

function AppLayout() {
  return (
    <div className="app">
      <Sidebar />

      {/* TOP NAVIGATION */}
      <Navbar />

      {/* PAGE CONTENT */}
      <main className="page-content">
        <Routes>
          {/* Dashboard */}
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/studio"
            element={<QuantumStudio />}
          />

          {/* Circuit Simulator */}
          <Route
            path="/simulator"
            element={<CircuitSimulator />}
          />

          {/* AI Tutor */}
          <Route
            path="/ai"
            element={<AITutor />}
          />

          <Route
            path="/ai-tutor"
            element={<AITutor />}
          />

          {/* Quantum Algorithms */}
          <Route
            path="/algorithms"
            element={<Algorithms />}
          />

          <Route
            path="/algorithms/:id"
            element={<AlgorithmDetail />}
          />

          {/* Learning */}
          <Route
            path="/learn"
            element={<Learn />}
          />

          <Route
            path="/learn/:lectureId"
            element={<LecturePlayer />}
          />

          {/* Interactive Visual Lecture player */}
          <Route
            path="/learn/:lectureId/interactive"
            element={<InteractiveLecture />}
          />

          <Route
            path="/learning"
            element={<Learn />}
          />

          {/* Progress */}
          <Route
            path="/progress"
            element={<Progress />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/code-lab"
            element={<CodeLab />}
          />

          <Route
            path="/challenges"
            element={<Challenges />}
          />

          <Route element={<AdminRoute />}>
            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route
              path="/admin/users"
              element={<AdminSection title="Users" />}
            />
            <Route
              path="/admin/courses"
              element={<AdminSection title="Courses" />}
            />
            <Route
              path="/admin/lectures"
              element={<AdminSection title="Lectures" />}
            />
            <Route
              path="/admin/assessments"
              element={<AdminSection title="Assessments" />}
            />
            <Route
              path="/admin/analytics"
              element={<AdminSection title="Analytics" />}
            />
            <Route
              path="/admin/resources"
              element={<AdminSection title="Resources" />}
            />
          </Route>

          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </main>
    </div>
  );
}

function AdminSection({ title }) {
  return (
    <section className="admin-section-placeholder">
      <h1>{title}</h1>
      <p>This admin section is not implemented yet.</p>
    </section>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      {/* Authentication */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Registration />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/registration"
        element={<Registration />}
      />

      {/* Main application */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/*"
          element={<AppLayout />}
        />
      </Route>
    </Routes>
  );
}

export default App;