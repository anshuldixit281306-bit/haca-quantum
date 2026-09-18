import {
  Brain,
  Cpu,
  Home,
  BookOpen,
  BarChart3,
  User,
  FlaskConical,
  Code2,
  Trophy,
  Orbit,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "./BottomNavigation.css";

function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { label: "Home", icon: Home, route: "/dashboard" },
    { label: "Learn", icon: BookOpen, route: "/learn" },
    { label: "Simulator", icon: FlaskConical, route: "/simulator" },
    { label: "Studio", icon: Orbit, route: "/studio" },
    { label: "AI Tutor", icon: Brain, route: "/ai-tutor" },
    { label: "Algorithms", icon: Cpu, route: "/algorithms" },
    { label: "Progress", icon: BarChart3, route: "/progress" },
    { label: "Profile", icon: User, route: "/profile" },
    { label: "Code Lab", icon: Code2, route: "/code-lab" },
    { label: "Challenges", icon: Trophy, route: "/challenges" },
  ];

  const isActive = (route) => {
    if (route === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    if (route === "/algorithms") {
      return location.pathname.startsWith("/algorithms");
    }

    return location.pathname === route;
  };

  return (
    <nav
      className={`ql-dashboard-footer-nav ${isOpen ? "open" : ""}`}
      aria-label="QuantumLearn navigation"
    >
      <button
        type="button"
        className="ql-navigation-menu-button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="quantumlearn-navigation-items"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div
        id="quantumlearn-navigation-items"
        className="ql-dashboard-footer-nav-inner"
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.route);

          return (
            <button
              key={item.route}
              type="button"
              className={`ql-footer-nav-button ${active ? "active" : ""}`}
              onClick={() => {
                navigate(item.route);
                setIsOpen(false);
              }}
              aria-current={active ? "page" : undefined}
            >
              <span className="ql-footer-nav-icon">
                <Icon size={19} strokeWidth={active ? 2.4 : 2} />
              </span>
              <span className="ql-footer-nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavigation;
