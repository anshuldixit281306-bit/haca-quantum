import { Bell, ChevronDown, LogOut, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    sessionStorage.removeItem("access_token");
    navigate("/login");
  };


  return (
    <header className="navbar">
      {/* =========================
          QUANTUMLEARN BRAND
      ========================== */}
      <div className="navbar-context">
        <div className="context-icon">
          <Sparkles size={16} />
        </div>

        <div className="navbar-brand-text">
          <span>MAC &amp; QUANTUM</span>
          <strong>Learning Workspace</strong>
        </div>
      </div>

      {/* =========================
          NAVBAR ACTIONS
      ========================== */}
      <div className="navbar-actions">
        {/* Notifications */}
        <button
          type="button"
          className="notification-button"
          onClick={() => setNotificationsOpen((open) => !open)}
          aria-label="Notifications"
          title="Notifications"
          aria-expanded={notificationsOpen}
        >
          <Bell size={17} />

          <span className="notification-dot"></span>
        </button>

        {notificationsOpen && (
          <div className="notification-panel" role="dialog" aria-label="Notifications">
            <div className="notification-panel-header">
              <strong>Notifications</strong>
              <span>2 new</span>
            </div>
            <div className="notification-item">
              <span className="notification-item-dot" />
              <div>
                <strong>Welcome to Mac &amp; Quantum</strong>
                <span>Continue your quantum learning journey.</span>
              </div>
            </div>
            <div className="notification-item">
              <span className="notification-item-dot" />
              <div>
                <strong>New challenge available</strong>
                <span>Test your knowledge of quantum gates.</span>
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="navbar-divider"></div>

        {/* Profile */}
        <button
          type="button"
          className="navbar-profile"
          onClick={handleProfileClick}
          aria-label="Open profile"
        >
          <div className="navbar-avatar">Q</div>

          <div className="navbar-user">
            <strong>Quantum Explorer</strong>
            <span>Student</span>
          </div>

          <ChevronDown size={14} />
        </button>

        {/* Logout Button */}
        <button
          type="button"
          className="navbar-logout-btn"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>

      </div>
    </header>
  );
}

export default Navbar;