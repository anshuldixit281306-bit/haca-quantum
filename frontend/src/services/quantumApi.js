import { API_BASE_URL } from "./api";

async function quantumRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Quantum API error (${response.status})`;

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

export async function simulateCircuit({
  numQubits,
  gates,
  shots = 1024,
  algorithm = null,
}) {
  return quantumRequest("/api/quantum/simulate", {
    method: "POST",
    body: JSON.stringify({
      num_qubits: numQubits,
      gates,
      shots,
      algorithm,
    }),
  });
}

export async function simulateBellState(shots = 1024) {
  return quantumRequest(`/api/quantum/bell-state?shots=${shots}`, {
    method: "POST",
  });
}

export async function simulateSuperposition(shots = 1024) {
  return quantumRequest(`/api/quantum/superposition?shots=${shots}`, {
    method: "POST",
  });
}

export async function simulateGrover(target = "11", shots = 1024) {
  return quantumRequest(
    `/api/quantum/grover?target=${encodeURIComponent(
      target
    )}&shots=${shots}`,
    {
      method: "POST",
    }
  );
}

export async function simulateTeleportation(shots = 1024) {
  return quantumRequest(`/api/quantum/teleportation?shots=${shots}`, {
    method: "POST",
  });
}