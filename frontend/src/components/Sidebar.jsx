import {
  BarChart3,
  BookOpen,
  Bot,
  CircuitBoard,
  Home,
  Settings,
  Sparkles,
  User,
  Code2,
  Trophy,
  Orbit,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const menu = [
  {
    label: "Home",
    icon: Home,
    path: "/dashboard",
  },
  {
    label: "Simulator",
    icon: CircuitBoard,
    path: "/simulator",
  },
  {
    label: "Quantum Studio",
    icon: Orbit,
    path: "/studio",
  },
  {
    label: "AI Tutor",
    icon: Bot,
    path: "/ai",
    badge: "AI",
  },
  {
    label: "Algorithms",
    icon: Sparkles,
    path: "/algorithms",
  },
  {
    label: "Learn",
    icon: BookOpen,
    path: "/learn",
  },
  {
    label: "Progress",
    icon: BarChart3,
    path: "/progress",
  },
  {
    label: "Profile",
    icon: User,
    path: "/profile",
  },
  {
    label: "Code Lab",
    icon: Code2,
    path: "/code-lab",
  },
  {
    label: "Challenges",
    icon: Trophy,
    path: "/challenges",
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  const isActive = (path) => {
    if (path === "/dashboard") {
      return currentPath === "/" || currentPath === "/dashboard";
    }

    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  return (
    <aside className="sidebar">
      {/* BRAND */}
      <div className="logo-area">
        <button
          type="button"
          className="logo-button"
          onClick={() => navigate("/dashboard")}
          aria-label="Go to Dashboard"
        >
          <div className="logo-icon">
            <span>Q</span>
          </div>

          <div className="logo-text">
            <h1>Mac &amp; Quantum</h1>
            <span>Learn quantum, practically.</span>
          </div>
        </button>
      </div>

      {/* NAVIGATION */}
      <div className="menu-title">QUANTUMLEARN</div>

      <nav className="sidebar-menu">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.label}
              type="button"
              className={`sidebar-item ${
                active ? "selected" : ""
              }`}
              onClick={() => navigate(item.path)}
            >
              <span className="sidebar-item-icon">
                <Icon size={18} strokeWidth={active ? 2.2 : 1.9} />
              </span>

              <span className="sidebar-item-label">
                {item.label}
              </span>

              {item.badge && (
                <span className="sidebar-badge">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-spacer" />

      {/* AI STATUS */}
      <div className="ai-status">
        <div className="ai-status-icon">
          <Sparkles size={16} />
        </div>

        <div className="ai-status-content">
          <strong>Quantum AI</strong>
          <span>Ready to help</span>
        </div>

        <span className="ai-status-dot" />
      </div>

      {/* SETTINGS */}
      <button
        type="button"
        className="sidebar-item settings"
        onClick={() => {}}
      >
        <span className="sidebar-item-icon">
          <Settings size={18} strokeWidth={1.9} />
        </span>

        <span className="sidebar-item-label">
          Settings
        </span>
      </button>

      {/* PROFILE */}
      <div className="profile">
        <div className="profile-avatar">
          Q
        </div>

        <div className="profile-text">
          <strong>Quantum Explorer</strong>
          <span>Learning mode</span>
        </div>

        <span className="online" />
      </div>
    </aside>
  );
}

export default Sidebar;