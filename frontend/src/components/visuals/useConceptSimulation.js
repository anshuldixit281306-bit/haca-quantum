/**
 * useConceptSimulation — runs a segment's simulation preset against the
 * REAL QuantumLearn quantum engine (POST /api/quantum/simulate, Qiskit
 * statevector backend). No fake data: every chart in the lecture player is
 * rendered from this response.
 *
 * The hook auto-runs whenever the preset changes (i.e. when the video
 * reaches a new concept) and exposes run() for the Explore panel.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../../services/api";

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

export async function simulateRequest(payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const headers = { "Content-Type": "application/json" };
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/api/quantum/simulate`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      let message = `Simulation failed (${response.status})`;
      try {
        const error = await response.json();
        if (error.detail) message = String(error.detail);
      } catch {
        // Non-JSON error body
      }
      throw new Error(message);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export function useConceptSimulation(preset) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestRef = useRef(0);

  const presetKey = preset ? JSON.stringify(preset) : "";

  const run = useCallback(
    async (override) => {
      const active = { ...(override || preset || {}) };

      if (!active.num_qubits) {
        return null;
      }

      const request = {
        num_qubits: Math.max(1, Math.min(20, Number(active.num_qubits) || 1)),
        gates: Array.isArray(active.gates) ? active.gates : [],
        shots: Math.max(1, Math.min(100000, Number(active.shots) || 1024)),
        algorithm: active.algorithm || null,
      };

      const requestId = requestRef.current + 1;
      requestRef.current = requestId;

      setLoading(true);
      setError("");

      try {
        const data = await simulateRequest(request);
        if (requestRef.current === requestId) {
          setResult(data);
        }
        return data;
      } catch (err) {
        if (requestRef.current === requestId) {
          setError(
            err?.name === "AbortError"
              ? "Simulation timed out. Try again."
              : err?.message || "Simulation failed."
          );
          setResult(null);
        }
        return null;
      } finally {
        if (requestRef.current === requestId) {
          setLoading(false);
        }
      }
    },
    [presetKey] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    if (preset && preset.num_qubits) {
      run();
    } else {
      setResult(null);
      setError("");
    }
    // run() identity is stable per presetKey
  }, [presetKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return { result, loading, error, run };
}
