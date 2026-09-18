import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../services/api";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);

  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        const body = await r.json();
        if (!r.ok) throw new Error(body.detail || "Admin analytics unavailable.");
        return body;
      })
      .then(setData)
      .catch((err) => setError(err.message));

    fetchReviews();
  }, []);

  function fetchReviews() {
    fetch(`${API_BASE_URL}/api/reviews`)
      .then((r) => r.json())
      .then(setReviews)
      .catch(() => {});
  }

  function handleDeleteReview(id) {
    if (!window.confirm("Delete this review?")) return;
    fetch(`${API_BASE_URL}/api/reviews/admin/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => setReviews((prev) => prev.filter((r) => r.id !== id)));
  }

  function handleSaveEdit(id) {
    fetch(`${API_BASE_URL}/api/reviews/admin/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editingReview),
    })
      .then((r) => r.json())
      .then((updated) => {
        setReviews((prev) => prev.map((r) => (r.id === id ? updated : r)));
        setEditingReview(null);
      });
  }

  const statKeys = [
    "total_users",
    "lecture_progress_records",
    "assessment_attempts",
    "average_assessment_score",
    "challenge_attempts",
  ];

  return (
    <main className="admin-dashboard">
      <div className="admin-header">
        <Link to="/dashboard" className="admin-back-link">← Back to Learning</Link>
        <h1 className="admin-title">⚙️ Admin Dashboard</h1>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {data && (
        <>
          {/* Stats Grid */}
          <section className="admin-section">
            <h2 className="admin-section-title">Platform Analytics</h2>
            <div className="admin-stats-grid">
              {Object.entries(data)
                .filter(([key]) => statKeys.includes(key))
                .map(([key, value]) => (
                  <div key={key} className="admin-stat-card">
                    <strong className="admin-stat-value">{String(value)}</strong>
                    <p className="admin-stat-label">
                      {key.replaceAll("_", " ")}
                    </p>
                  </div>
                ))}
            </div>
          </section>

          {/* Weak Concepts */}
          <section className="admin-section">
            <h2 className="admin-section-title">Weak Concepts</h2>
            <div className="admin-concepts-list">
              {data.weak_concepts.map((item) => (
                <div key={item.concept} className="admin-concept-row">
                  <span className="admin-concept-name">{item.concept}</span>
                  <div className="admin-concept-bar-bg">
                    <div
                      className="admin-concept-bar-fill"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <span className="admin-concept-score">{item.score}%</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Reviews Management */}
      <section className="admin-section">
        <h2 className="admin-section-title">Reviews Management</h2>
        {reviews.length === 0 && (
          <p className="admin-empty">No reviews yet.</p>
        )}
        <div className="admin-reviews-list">
          {reviews.map((rev) =>
            editingReview?.id === rev.id ? (
              <div key={rev.id} className="admin-review-edit-card">
                <input
                  className="admin-input"
                  value={editingReview.user_name}
                  onChange={(e) =>
                    setEditingReview((p) => ({ ...p, user_name: e.target.value }))
                  }
                  placeholder="Name"
                />
                <input
                  className="admin-input"
                  value={editingReview.user_role}
                  onChange={(e) =>
                    setEditingReview((p) => ({ ...p, user_role: e.target.value }))
                  }
                  placeholder="Role"
                />
                <select
                  className="admin-input"
                  value={editingReview.rating}
                  onChange={(e) =>
                    setEditingReview((p) => ({
                      ...p,
                      rating: Number(e.target.value),
                    }))
                  }
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {"★".repeat(n)}
                    </option>
                  ))}
                </select>
                <textarea
                  className="admin-input admin-textarea"
                  value={editingReview.comment}
                  onChange={(e) =>
                    setEditingReview((p) => ({ ...p, comment: e.target.value }))
                  }
                  placeholder="Review comment"
                />
                <div className="admin-edit-actions">
                  <button
                    className="admin-btn admin-btn-save"
                    onClick={() => handleSaveEdit(rev.id)}
                  >
                    Save
                  </button>
                  <button
                    className="admin-btn admin-btn-cancel"
                    onClick={() => setEditingReview(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div key={rev.id} className="admin-review-card">
                <div className="admin-review-meta">
                  <div className="admin-review-avatar">{rev.initials}</div>
                  <div>
                    <strong className="admin-review-name">{rev.user_name}</strong>
                    <span className="admin-review-role">{rev.user_role}</span>
                  </div>
                  <div className="admin-review-stars">
                    {"★".repeat(rev.rating)}
                    {"☆".repeat(5 - rev.rating)}
                  </div>
                </div>
                <p className="admin-review-comment">{rev.comment}</p>
                <div className="admin-edit-actions">
                  <button
                    className="admin-btn admin-btn-edit"
                    onClick={() => setEditingReview({ ...rev })}
                  >
                    Edit
                  </button>
                  <button
                    className="admin-btn admin-btn-delete"
                    onClick={() => handleDeleteReview(rev.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </section>
    </main>
  );
}
