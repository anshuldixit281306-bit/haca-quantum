/**
 * API helpers for the Interactive Visual Lecture system.
 *
 * Endpoints (backend/app/routes/lectures.py):
 *   GET  /api/lectures/{id}/timeline      — timestamped concept segments
 *   POST /api/lectures/{id}/interactions  — meaningful learning events (XP)
 *
 * Quantum simulations reuse the existing engine endpoint
 * (POST /api/quantum/simulate) through services/quantumApi.js.
 */

import { API_BASE_URL } from "./api";

function getAuthToken() {
  try {
    return (
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token") ||
      null
    );
  } catch {
    return null;
  }
}

export async function fetchLectureTimeline(lectureId) {
  const response = await fetch(
    `${API_BASE_URL}/api/lectures/${lectureId}/timeline`
  );

  if (!response.ok) {
    let message = "Unable to load the visual timeline.";
    try {
      const error = await response.json();
      message = error.detail || message;
    } catch {
      // Ignore invalid JSON
    }
    throw new Error(message);
  }

  return response.json();
}

/**
 * Record a meaningful learning interaction (watched / explored /
 * simulated / quiz / completed). Silently returns null when the learner
 * is not authenticated — the lecture player itself never blocks.
 */
export async function recordLectureInteraction(lectureId, payload) {
  const token = getAuthToken();

  if (!token) return null;

  const response = await fetch(
    `${API_BASE_URL}/api/lectures/${lectureId}/interactions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(`Interaction failed (${response.status})`);
  }

  return response.json();
}
