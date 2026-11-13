import { useEffect, useState, useRef } from "react";
import { API_BASE_URL } from "../../services/api";
import "./ReviewsMarquee.css";

const AVATAR_COLORS = [
  ["#5eead4", "#0f766e"],
  ["#5eead4", "#0a4a45"],
  ["#34d399", "#4a1575"],
  ["#f59e0b", "#7a4f00"],
  ["#34d399", "#0f5a3a"],
  ["#f87171", "#6b1d1d"],
];

function StarRating({ rating }) {
  return (
    <div className="rm-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? "rm-star rm-star--filled" : "rm-star rm-star--empty"}>
          ★
        </span>
      ))}
    </div>
  );
}

function ReviewCard({ review, index }) {
  const [bg, text] = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const [expanded, setExpanded] = useState(false);
  const isLong = review.comment.length > 120;
  const displayText = expanded || !isLong
    ? review.comment
    : review.comment.slice(0, 120) + "…";

  return (
    <div className="rm-card">
      <div className="rm-card-header">
        <div className="rm-avatar" style={{ background: `linear-gradient(135deg, ${bg}, ${text})` }}>
          {review.initials}
        </div>
        <div>
          <div className="rm-name">{review.user_name}</div>
          <div className="rm-role">{review.user_role}</div>
        </div>
      </div>

      <StarRating rating={review.rating} />

      <p className="rm-comment">{displayText}</p>

      {isLong && (
        <button className="rm-read-more" onClick={() => setExpanded((e) => !e)}>
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

const SEED_REVIEWS = [
  { id: 1, user_name: "Aditya Sharma", user_role: "Quantum Computing Researcher", rating: 5, comment: "The 3D Bloch sphere and visual circuit simulations helped me understand Bell states much faster than traditional textbooks!", initials: "AS" },
  { id: 2, user_name: "Dr. Elena Rostova", user_role: "Physics Professor", rating: 5, comment: "Outstanding educational tool. My students loved the interactive lecture checkpoints and live quantum gate experiments.", initials: "ER" },
  { id: 3, user_name: "Michael Chen", user_role: "Full-stack Developer", rating: 5, comment: "Transitioning from classical computing to quantum was intimidating until I used QuantumStudio. The state vector visualization is brilliant.", initials: "MC" },
  { id: 4, user_name: "Priya Patel", user_role: "MSc Quantum Technology", rating: 5, comment: "The 5-question lecture gating quiz system keeps you accountable and ensures you actually master concepts before progressing.", initials: "PP" },
];

export default function ReviewsMarquee() {
  const [reviews, setReviews] = useState(SEED_REVIEWS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ user_name: "", user_role: "", rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Only fetch if on localhost or API is HTTPS to avoid browser loopback CORS blocks
    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    const isLocalApi = API_BASE_URL.includes("localhost") || API_BASE_URL.includes("127.0.0.1");
    if (isHttps && isLocalApi) return;

    fetch(`${API_BASE_URL}/api/reviews`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => Array.isArray(data) && data.length > 0 && setReviews(data))
      .catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.user_name.trim() || !form.comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews((prev) => [newReview, ...prev]);
        setSubmitted(true);
        setShowForm(false);
        setForm({ user_name: "", user_role: "", rating: 5, comment: "" });
        setTimeout(() => setSubmitted(false), 4000);
      }
    } catch {}
    setSubmitting(false);
  }

  // duplicate reviews for seamless marquee if few reviews
  const displayReviews = reviews.length > 0
    ? reviews.length < 4
      ? [...reviews, ...reviews, ...reviews]
      : reviews
    : [];

  return (
    <section className="reviews-section" id="reviews">
      <div className="reviews-header">
        <div>
          <p className="reviews-eyebrow">Testimonials</p>
          <h2 className="reviews-heading">What Learners Say</h2>
        </div>
        <button
          className="reviews-add-btn"
          onClick={() => setShowForm((s) => !s)}
        >
          {showForm ? "✕ Cancel" : "+ Write a Review"}
        </button>
      </div>

      {submitted && (
        <div className="reviews-success">
          ✅ Your review was submitted! Thank you for your feedback.
        </div>
      )}

      {showForm && (
        <form className="reviews-form" onSubmit={handleSubmit}>
          <div className="reviews-form-row">
            <input
              className="reviews-input"
              placeholder="Your Name *"
              value={form.user_name}
              onChange={(e) => setForm((p) => ({ ...p, user_name: e.target.value }))}
              required
            />
            <input
              className="reviews-input"
              placeholder="Your Role (e.g. CS Student)"
              value={form.user_role}
              onChange={(e) => setForm((p) => ({ ...p, user_role: e.target.value }))}
            />
          </div>

          <div className="reviews-rating-select">
            <span className="reviews-rating-label">Rating:</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={`reviews-star-btn ${n <= form.rating ? "active" : ""}`}
                onClick={() => setForm((p) => ({ ...p, rating: n }))}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            className="reviews-input reviews-textarea"
            placeholder="Share your experience with QuantumLearn... *"
            value={form.comment}
            onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
            required
            rows={4}
          />

          <button className="reviews-submit-btn" type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </form>
      )}

      {displayReviews.length > 0 ? (
        <div className="rm-track-wrapper">
          <div className="rm-track">
            <div className="rm-group">
              {displayReviews.map((rev, i) => (
                <ReviewCard key={`g1-${rev.id}-${i}`} review={rev} index={i} />
              ))}
            </div>
            <div className="rm-group" aria-hidden="true">
              {displayReviews.map((rev, i) => (
                <ReviewCard key={`g2-${rev.id}-${i}`} review={rev} index={i} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="reviews-empty">
          Be the first to share your experience! Click "Write a Review" above.
        </p>
      )}
    </section>
  );
}
