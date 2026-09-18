from __future__ import annotations

from abc import ABC, abstractmethod
import json
import re
from typing import Any

from app.core.config import settings

try:
    from openai import OpenAI
except Exception:
    OpenAI = None


# ============================================================
# BASE AI PROVIDER
# ============================================================

class AIProvider(ABC):

    @abstractmethod
    def ask(
        self,
        question: str,
        context: str = "",
        level: str = "beginner",
    ) -> dict[str, Any]:
        pass

    @abstractmethod
    def generate_code(
        self,
        prompt: str,
        language: str = "python",
        context: str = "",
    ) -> dict[str, Any]:
        pass

    @abstractmethod
    def generate_circuit_json(
        self,
        prompt: str,
        num_qubits: int = 2,
        context: str = "",
    ) -> dict[str, Any]:
        pass

    @abstractmethod
    def debug_code(
        self,
        code: str,
    ) -> dict[str, Any]:
        pass

    @abstractmethod
    def optimize_circuit(
        self,
        gates: list[dict[str, Any]],
        num_qubits: int,
    ) -> dict[str, Any]:
        pass

    @abstractmethod
    def predict_circuit(
        self,
        gates: list[dict[str, Any]],
        num_qubits: int,
    ) -> dict[str, Any]:
        pass


# ============================================================
# LOCAL PROVIDER
# ============================================================

class LocalKnowledgeProvider(AIProvider):

    def ask(
        self,
        question: str,
        context: str = "",
        level: str = "beginner",
    ) -> dict[str, Any]:

        q = question.lower().strip()

        if "qubit" in q:
            answer = (
                "A qubit is the basic unit of quantum information. "
                "Unlike a classical bit, it can exist in a superposition "
                "of |0⟩ and |1⟩ until measurement."
            )

        elif "superposition" in q:
            answer = (
                "Superposition means a quantum state can contain "
                "amplitudes for multiple basis states. "
                "The Hadamard gate is commonly used to create it."
            )

        elif "entanglement" in q:
            answer = (
                "Quantum entanglement creates correlations between "
                "qubits. A common example is an H gate followed by CNOT."
            )

        elif "hadamard" in q or q == "h gate":
            answer = (
                "The Hadamard gate transforms |0⟩ into "
                "(|0⟩ + |1⟩)/√2 and |1⟩ into "
                "(|0⟩ - |1⟩)/√2."
            )

        elif "cnot" in q:
            answer = (
                "CNOT is a two-qubit controlled gate. "
                "It flips the target qubit when the control qubit is |1⟩."
            )

        else:
            answer = (
                "I can help explain quantum computing concepts, "
                "circuits, gates, measurements, algorithms and results."
            )

        return {
            "success": True,
            "answer": answer,
            "provider": "local",
            "level": level,
        }

    # --------------------------------------------------------
    # CODE
    # --------------------------------------------------------

    def generate_code(
        self,
        prompt: str,
        language: str = "python",
        context: str = "",
    ) -> dict[str, Any]:

        q = prompt.lower()

        if "bell" in q:
            code = """from qiskit import QuantumCircuit

qc = QuantumCircuit(2, 2)

qc.h(0)
qc.cx(0, 1)

qc.measure([0, 1], [0, 1])

print(qc)
"""

        elif "ghz" in q:
            code = """from qiskit import QuantumCircuit

qc = QuantumCircuit(3, 3)

qc.h(0)
qc.cx(0, 1)
qc.cx(1, 2)

qc.measure([0, 1, 2], [0, 1, 2])

print(qc)
"""

        else:
            code = """from qiskit import QuantumCircuit

qc = QuantumCircuit(1, 1)

qc.h(0)
qc.measure(0, 0)

print(qc)
"""

        return {
            "success": True,
            "code": code,
            "language": language,
            "provider": "local",
        }

    # --------------------------------------------------------
    # CIRCUIT GENERATION
    # --------------------------------------------------------

    def generate_circuit_json(
        self,
        prompt: str,
        num_qubits: int = 2,
        context: str = "",
    ) -> dict[str, Any]:

        q = prompt.lower()

        if "bell" in q:
            gates = [
                {
                    "gate": "H",
                    "qubit": 0,
                    "column": 0,
                },
                {
                    "gate": "CNOT",
                    "control": 0,
                    "target": 1,
                    "column": 1,
                },
            ]

        elif "ghz" in q and num_qubits >= 3:
            gates = [
                {
                    "gate": "H",
                    "qubit": 0,
                    "column": 0,
                },
                {
                    "gate": "CNOT",
                    "control": 0,
                    "target": 1,
                    "column": 1,
                },
                {
                    "gate": "CNOT",
                    "control": 1,
                    "target": 2,
                    "column": 2,
                },
            ]

        elif "swap" in q:
            gates = [
                {
                    "gate": "SWAP",
                    "control": 0,
                    "target": 1,
                    "column": 0,
                }
            ]

        else:
            gates = [
                {
                    "gate": "H",
                    "qubit": 0,
                    "column": 0,
                }
            ]

        return {
            "success": True,
            "num_qubits": num_qubits,
            "gates": gates,
            "provider": "local",
        }

    # --------------------------------------------------------
    # DEBUG
    # --------------------------------------------------------

    def debug_code(
        self,
        code: str,
    ) -> dict[str, Any]:

        errors = []
        warnings = []

        if not code or not code.strip():
            errors.append("Code is empty.")

        if "QuantumCircuit" not in code:
            warnings.append(
                "No QuantumCircuit declaration was detected."
            )

        if "measure" not in code.lower():
            warnings.append(
                "No measurement operation was detected."
            )

        if code.count("(") != code.count(")"):
            errors.append(
                "Parentheses appear to be unbalanced."
            )

        return {
            "success": len(errors) == 0,
            "provider": "local",
            "errors": errors,
            "warnings": warnings,
            "explanation": (
                "The local validator checked the basic "
                "quantum circuit structure."
            ),
        }

    # --------------------------------------------------------
    # OPTIMIZE
    # --------------------------------------------------------

    def optimize_circuit(
        self,
        gates: list[dict[str, Any]],
        num_qubits: int,
    ) -> dict[str, Any]:

        normalized = normalize_gates(gates)

        optimized = []

        for gate in normalized:
            name = gate.get("gate", "").upper()

            if optimized:
                previous = optimized[-1]

                if (
                    name == previous.get("gate")
                    and gate.get("qubit") == previous.get("qubit")
                    and name in {"H", "X", "Y", "Z"}
                ):
                    optimized.pop()
                    continue

            optimized.append(gate)

        removed = len(normalized) - len(optimized)

        return {
            "success": True,
            "provider": "local",
            "original_gates": normalized,
            "optimized_gates": optimized,
            "original_gate_count": len(normalized),
            "optimized_gate_count": len(optimized),
            "gates_removed": removed,
            "reduction_percent": (
                round(
                    removed / len(normalized) * 100,
                    2,
                )
                if normalized
                else 0
            ),
            "explanation": (
                "The optimizer removed adjacent identical "
                "single-qubit gates where possible."
            ),
            "optimizations": (
                ["Cancelled adjacent identical gates"]
                if removed
                else []
            ),
            "warnings": [],
        }

    # --------------------------------------------------------
    # BASIC PREDICT
    # --------------------------------------------------------

    def predict_circuit(
        self,
        gates: list[dict[str, Any]],
        num_qubits: int,
    ) -> dict[str, Any]:

        normalized = normalize_gates(gates)

        if not normalized:
            return {
                "success": False,
                "provider": "local",
                "predicted_outcome": (
                    "No prediction can be made because "
                    "the circuit contains no gates."
                ),
                "expected_states": [],
                "expected_probabilities": {},
                "confidence": "Low",
            }

        if (
            len(normalized) == 1
            and normalized[0]["gate"] == "H"
        ):
            return {
                "success": True,
                "provider": "local",
                "predicted_outcome": (
                    "The H gate creates an approximately "
                    "equal superposition of |0⟩ and |1⟩."
                ),
                "expected_states": ["0", "1"],
                "expected_probabilities": {
                    "0": 0.5,
                    "1": 0.5,
                },
                "confidence": "High",
            }

        if (
            len(normalized) == 1
            and normalized[0]["gate"] == "X"
        ):
            return {
                "success": True,
                "provider": "local",
                "predicted_outcome": (
                    "The X gate flips |0⟩ to |1⟩."
                ),
                "expected_states": ["1"],
                "expected_probabilities": {
                    "1": 1.0,
                },
                "confidence": "High",
            }

        return {
            "success": True,
            "provider": "local",
            "predicted_outcome": (
                "The circuit prediction requires simulation "
                "or a cloud AI interpretation."
            ),
            "expected_states": [],
            "expected_probabilities": {},
            "confidence": "Medium",
        }

    # --------------------------------------------------------
    # LIVE CIRCUIT ANALYSIS
    # --------------------------------------------------------

    def analyze_circuit(
        self,
        num_qubits: int,
        gates: list[dict[str, Any]],
        previous_gates: list[dict[str, Any]] | None = None,
        action: str | None = None,
    ) -> dict[str, Any]:

        normalized = normalize_gates(gates)

        if not normalized:
            return {
                "success": True,
                "provider": "local",
                "answer": (
                    "The circuit is currently empty. "
                    "Add a quantum gate to begin."
                ),
                "analysis": (
                    "No quantum operations have been added yet."
                ),
                "warnings": [],
            }

        latest = normalized[-1]
        gate_name = latest.get("gate", "UNKNOWN")

        explanations = {
            "H": (
                "The Hadamard gate creates a superposition "
                "between the |0⟩ and |1⟩ states."
            ),
            "X": (
                "The Pauli-X gate performs a bit flip. "
                "For |0⟩ it produces |1⟩."
            ),
            "Y": (
                "The Pauli-Y gate changes both the amplitude "
                "and phase of the quantum state."
            ),
            "Z": (
                "The Pauli-Z gate applies a phase flip to |1⟩."
            ),
            "CNOT": (
                "CNOT creates a controlled operation. "
                "The target changes when the control qubit is |1⟩."
            ),
            "CZ": (
                "CZ applies a phase change when both relevant "
                "qubit conditions are satisfied."
            ),
            "SWAP": (
                "SWAP exchanges the quantum states of two qubits."
            ),
            "RX": (
                "RX rotates the qubit state around the X axis."
            ),
            "RY": (
                "RY rotates the qubit state around the Y axis."
            ),
            "RZ": (
                "RZ rotates the qubit state around the Z axis."
            ),
        }

        answer = explanations.get(
            gate_name,
            f"The {gate_name} gate has been added to the circuit."
        )

        return {
            "success": True,
            "provider": "local",
            "answer": answer,
            "analysis": answer,
            "latest_gate": latest,
            "gate_count": len(normalized),
            "warnings": [],
        }

    # --------------------------------------------------------
    # EXPLAIN QUANTUM RESULT
    # --------------------------------------------------------

    def explain_quantum_result(
        self,
        question: str = "",
        result: dict[str, Any] | None = None,
    ) -> dict[str, Any]:

        result = result or {}

        measurement = result.get(
            "measurement",
            {},
        )

        counts = measurement.get(
            "counts",
            {},
        )

        probabilities = measurement.get(
            "probabilities",
            {},
        )

        shots = result.get(
            "shots",
            0,
        )

        most_frequent = measurement.get(
            "most_frequent_state"
        )

        if not most_frequent and counts:
            most_frequent = max(
                counts,
                key=counts.get,
            )

        if not counts:
            answer = (
                "The circuit was simulated, but no measurement "
                "counts were returned."
            )
        else:
            percentage = probabilities.get(
                most_frequent,
                0,
            )

            answer = (
                f"The circuit was simulated using {shots} shots. "
                f"The most frequently observed state was "
                f"|{most_frequent}⟩ with "
                f"{counts.get(most_frequent, 0)} observations "
                f"({percentage * 100:.1f}%). "
                f"This result reflects the actual Quantum Engine "
                f"simulation."
            )

        return {
            "success": True,
            "provider": "local",
            "answer": answer,
            "explanation": answer,
            "key_observations": [
                f"Shots: {shots}",
                f"Most frequent state: {most_frequent}"
                if most_frequent
                else "No dominant state was detected.",
            ],
            "actual_result": result,
        }

    # --------------------------------------------------------
    # PREDICT CONSEQUENCES
    # --------------------------------------------------------

    def predict_circuit_consequences(
        self,
        gates: list[dict[str, Any]],
        num_qubits: int,
        proposed_operation: dict[str, Any] | None = None,
    ) -> dict[str, Any]:

        normalized = normalize_gates(gates)

        proposed = (
            normalize_gates([proposed_operation])[0]
            if proposed_operation
            else None
        )

        if proposed is None:
            return {
                "success": False,
                "provider": "local",
                "answer": (
                    "No proposed operation was supplied."
                ),
                "prediction": "",
                "consequences": [],
                "warnings": [],
            }

        name = proposed.get(
            "gate",
            "UNKNOWN",
        )

        descriptions = {
            "H": "The H gate can introduce superposition.",
            "X": "The X gate can flip the target qubit state.",
            "Y": "The Y gate changes both state amplitude and phase.",
            "Z": "The Z gate changes the phase of the |1⟩ component.",
            "CNOT": (
                "CNOT can create or modify correlations "
                "between two qubits."
            ),
            "CZ": (
                "CZ changes phase relationships between "
                "the involved qubits."
            ),
            "SWAP": (
                "SWAP exchanges the states of the selected qubits."
            ),
            "RX": "RX rotates the state around the X axis.",
            "RY": "RY rotates the state around the Y axis.",
            "RZ": "RZ rotates the state around the Z axis.",
        }

        prediction = descriptions.get(
            name,
            f"The {name} gate will modify the quantum state."
        )

        return {
            "success": True,
            "provider": "local",
            "prediction": prediction,
            "answer": prediction,
            "consequences": [
                prediction
            ],
            "warnings": [],
            "recommended_action": (
                "Run the circuit to observe the actual "
                "measurement distribution."
            ),
            "current_circuit": {
                "num_qubits": num_qubits,
                "gates": normalized,
            },
            "proposed_operation": proposed,
        }


# ============================================================
# CLOUD PROVIDER
# ============================================================

class CloudAIProvider(AIProvider):

    def __init__(
        self,
        api_key: str | None,
        model: str,
        base_url: str,
        provider_name: str,
    ):

        self.api_key = api_key
        self.model = model
        self.base_url = base_url
        self.provider_name = provider_name

        self._client = None

        if OpenAI is not None and api_key:
            try:
                self._client = OpenAI(
                    api_key=api_key,
                    base_url=base_url,
                    # Fail fast instead of hanging when the
                    # network is unavailable or flaky.
                    timeout=12.0,
                    max_retries=1,
                )
            except Exception:
                self._client = None

    # ========================================================
    # CHAT
    # ========================================================

    def _chat(
        self,
        messages: list[dict[str, str]],
        max_tokens: int = 1800,
        temperature: float = 0.2,
    ) -> str:

        if self._client is None:
            raise RuntimeError(
                f"{self.provider_name} client is not configured."
            )

        response = self._client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )

        if not response.choices:
            raise RuntimeError(
                f"{self.provider_name} returned no choices."
            )

        message = response.choices[0].message

        content = getattr(
            message,
            "content",
            None,
        )

        if not content:
            raise RuntimeError(
                f"{self.provider_name} returned empty content."
            )

        return content.strip()

    # ========================================================
    # JSON EXTRACTION
    # ========================================================

    @staticmethod
    def _extract_json(
        text: str,
    ) -> dict[str, Any]:

        if not text:
            raise ValueError(
                "AI returned empty response."
            )

        cleaned = text.strip()

        cleaned = re.sub(
            r"^```(?:json)?",
            "",
            cleaned,
            flags=re.IGNORECASE,
        )

        cleaned = re.sub(
            r"```$",
            "",
            cleaned,
        ).strip()

        try:
            data = json.loads(cleaned)

            if isinstance(data, dict):
                return data

        except Exception:
            pass

        start = cleaned.find("{")
        end = cleaned.rfind("}")

        if start != -1 and end > start:
            candidate = cleaned[
                start:end + 1
            ]

            try:
                data = json.loads(candidate)

                if isinstance(data, dict):
                    return data

            except Exception:
                pass

        raise ValueError(
            "AI response was not valid JSON."
        )

    # ========================================================
    # ASK
    # ========================================================

    def ask(
        self,
        question: str,
        context: str = "",
        level: str = "beginner",
    ) -> dict[str, Any]:

        messages = [
            {
                "role": "system",
                "content": (
                    "You are QuantumLearn AI Tutor. "
                    "Teach quantum computing clearly and accurately. "
                    f"The student's level is {level}. "
                    "Use simple explanations when appropriate."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Question:\n{question}\n\n"
                    f"Context:\n{context}"
                ),
            },
        ]

        try:
            answer = self._chat(
                messages,
                max_tokens=1800,
                temperature=0.25,
            )

            return {
                "success": True,
                "answer": answer,
                "provider": self.provider_name,
                "level": level,
            }

        except Exception as exc:
            return {
                "success": False,
                "answer": (
                    "The AI Tutor could not generate a response."
                ),
                "provider": self.provider_name,
                "error": str(exc),
                "level": level,
            }

    # ========================================================
    # GENERATE CODE
    # ========================================================

    def generate_code(
        self,
        prompt: str,
        language: str = "python",
        context: str = "",
    ) -> dict[str, Any]:

        messages = [
            {
                "role": "system",
                "content": (
                    "You are a quantum programming expert. "
                    "Generate clean, runnable quantum computing code. "
                    "Return code only."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Language: {language}\n"
                    f"Request: {prompt}\n"
                    f"Context: {context}"
                ),
            },
        ]

        try:
            code = self._chat(
                messages,
                max_tokens=2500,
                temperature=0.15,
            )

            code = re.sub(
                r"^```[a-zA-Z0-9_+-]*",
                "",
                code.strip(),
            )

            code = re.sub(
                r"```$",
                "",
                code.strip(),
            ).strip()

            return {
                "success": True,
                "provider": self.provider_name,
                "code": code,
                "language": language,
            }

        except Exception as exc:
            return {
                "success": False,
                "provider": self.provider_name,
                "code": "",
                "language": language,
                "error": str(exc),
            }

    # ========================================================
    # GENERATE CIRCUIT
    # ========================================================

    def generate_circuit_json(
        self,
        prompt: str,
        num_qubits: int = 2,
        context: str = "",
    ) -> dict[str, Any]:

        messages = [
            {
                "role": "system",
                "content": (
                    "You are a quantum circuit designer. "
                    "Return JSON only. "
                    "Use this exact structure:\n"
                    "{"
                    '"num_qubits":2,'
                    '"gates":['
                    '{"gate":"H","qubit":0,"column":0}'
                    "]}"
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Number of qubits: {num_qubits}\n"
                    f"Request: {prompt}\n"
                    f"Context: {context}"
                ),
            },
        ]

        try:
            text = self._chat(
                messages,
                max_tokens=2200,
                temperature=0.1,
            )

            data = self._extract_json(text)

            gates = normalize_gates(
                data.get("gates", [])
            )

            return {
                "success": True,
                "provider": self.provider_name,
                "num_qubits": data.get(
                    "num_qubits",
                    num_qubits,
                ),
                "gates": gates,
            }

        except Exception as exc:
            return {
                "success": False,
                "provider": self.provider_name,
                "num_qubits": num_qubits,
                "gates": [],
                "error": str(exc),
            }

    # ========================================================
    # DEBUG
    # ========================================================

    def debug_code(
        self,
        code: str,
    ) -> dict[str, Any]:

        messages = [
            {
                "role": "system",
                "content": (
                    "You are a quantum programming debugger. "
                    "Return JSON only:\n"
                    "{"
                    '"errors":[],'
                    '"warnings":[],'
                    '"explanation":"..."'
                    "}"
                ),
            },
            {
                "role": "user",
                "content": code,
            },
        ]

        try:
            text = self._chat(
                messages,
                max_tokens=1800,
                temperature=0.1,
            )

            data = self._extract_json(text)

            return {
                "success": True,
                "provider": self.provider_name,
                "errors": data.get(
                    "errors",
                    [],
                ),
                "warnings": data.get(
                    "warnings",
                    [],
                ),
                "explanation": data.get(
                    "explanation",
                    "",
                ),
            }

        except Exception as exc:
            return {
                "success": False,
                "provider": self.provider_name,
                "errors": [],
                "warnings": [],
                "explanation": "",
                "error": str(exc),
            }

    # ========================================================
    # LIVE CIRCUIT ANALYSIS
    # ========================================================

    def analyze_circuit(
        self,
        num_qubits: int,
        gates: list[dict[str, Any]],
        previous_gates: list[dict[str, Any]] | None = None,
        action: str | None = None,
    ) -> dict[str, Any]:

        normalized = normalize_gates(gates)

        previous = normalize_gates(
            previous_gates or []
        )

        payload = {
            "num_qubits": num_qubits,
            "current_gates": normalized,
            "previous_gates": previous,
            "latest_action": action,
        }

        messages = [
            {
                "role": "system",
                "content": (
                    "You are QuantumLearn Circuit AI. "
                    "Analyze the supplied quantum circuit. "
                    "Explain the latest operation and its conceptual "
                    "effect on the circuit. "
                    "Do not invent simulation results. "
                    "Return JSON only:\n"
                    "{"
                    '"answer":"...",'
                    '"analysis":"...",'
                    '"warnings":[]'
                    "}"
                ),
            },
            {
                "role": "user",
                "content": json.dumps(
                    payload,
                    indent=2,
                ),
            },
        ]

        try:
            text = self._chat(
                messages,
                max_tokens=1800,
                temperature=0.15,
            )

            data = self._extract_json(text)

            answer = (
                data.get("answer")
                or data.get("analysis")
                or ""
            )

            if not answer:
                raise ValueError(
                    "Circuit AI returned no readable analysis."
                )

            return {
                "success": True,
                "provider": self.provider_name,
                "answer": answer,
                "analysis": data.get(
                    "analysis",
                    answer,
                ),
                "warnings": data.get(
                    "warnings",
                    [],
                ),
                "latest_action": action,
                "gates": normalized,
            }

        except Exception as exc:
            # Deterministic fallback keeps Live Guidance usable.
            return LocalKnowledgeProvider().analyze_circuit(
                num_qubits=num_qubits,
                gates=normalized,
                previous_gates=previous,
                action=action,
            ) | {
                "ai_warning": str(exc),
            }

    # ========================================================
    # EXPLAIN ACTUAL QUANTUM RESULT
    # ========================================================

    def explain_quantum_result(
        self,
        question: str = "",
        result: dict[str, Any] | None = None,
    ) -> dict[str, Any]:

        result = result or {}

        measurement = result.get(
            "measurement",
            {},
        )

        counts = measurement.get(
            "counts",
            {},
        )

        probabilities = measurement.get(
            "probabilities",
            {},
        )

        exact_probabilities = (
            result.get(
                "theoretical",
                {},
            ).get(
                "exact_probabilities",
                {},
            )
        )

        shots = result.get(
            "shots",
            0,
        )

        most_frequent = measurement.get(
            "most_frequent_state"
        )

        if not most_frequent and counts:
            most_frequent = max(
                counts,
                key=counts.get,
            )

        payload = {
            "question": question,
            "shots": shots,
            "counts": counts,
            "measured_probabilities": probabilities,
            "exact_probabilities": exact_probabilities,
            "most_frequent_state": most_frequent,
            "circuit": result.get(
                "circuit",
                {},
            ),
            "statevector": result.get(
                "statevector",
                {},
            ),
            "algorithm": result.get(
                "algorithm",
                "Quantum Experiment",
            ),
        }

        messages = [
            {
                "role": "system",
                "content": (
                    "You are QuantumLearn Circuit AI. "
                    "Explain an ACTUAL quantum simulation result. "
                    "The supplied counts, probabilities and shots "
                    "are authoritative and must not be changed. "
                    "Connect the gate sequence to the measured result. "
                    "Explain why the observed states make sense. "
                    "Mention statistical variation when relevant. "
                    "Return JSON only:\n"
                    "{"
                    '"answer":"...",'
                    '"explanation":"...",'
                    '"key_observations":[],'
                    '"quantum_reasoning":"...",'
                    '"learning_points":[]'
                    "}"
                ),
            },
            {
                "role": "user",
                "content": json.dumps(
                    payload,
                    indent=2,
                    default=str,
                ),
            },
        ]

        try:
            text = self._chat(
                messages,
                max_tokens=2800,
                temperature=0.15,
            )

            data = self._extract_json(text)

            answer = (
                data.get("answer")
                or data.get("explanation")
                or data.get("quantum_reasoning")
                or ""
            )

            if not answer:
                raise ValueError(
                    "AI returned no readable explanation."
                )

            return {
                "success": True,
                "provider": self.provider_name,
                "answer": answer,
                "explanation": data.get(
                    "explanation",
                    answer,
                ),
                "key_observations": data.get(
                    "key_observations",
                    [],
                ),
                "quantum_reasoning": data.get(
                    "quantum_reasoning",
                    "",
                ),
                "learning_points": data.get(
                    "learning_points",
                    [],
                ),
                "actual_result": result,
            }

        except Exception as exc:
            # Never lose the actual simulation result.
            fallback = LocalKnowledgeProvider().explain_quantum_result(
                question=question,
                result=result,
            )

            fallback["provider"] = self.provider_name
            fallback["ai_warning"] = str(exc)

            return fallback

    # ========================================================
    # PREDICT CONSEQUENCES
    # ========================================================

    def predict_circuit_consequences(
        self,
        gates: list[dict[str, Any]],
        num_qubits: int,
        proposed_operation: dict[str, Any] | None = None,
    ) -> dict[str, Any]:

        normalized = normalize_gates(gates)

        proposed = (
            normalize_gates(
                [proposed_operation]
            )[0]
            if proposed_operation
            else None
        )

        if proposed is None:
            return {
                "success": False,
                "provider": self.provider_name,
                "answer": (
                    "No proposed operation was supplied."
                ),
                "prediction": "",
                "consequences": [],
                "warnings": [],
            }

        payload = {
            "num_qubits": num_qubits,
            "current_gates": normalized,
            "proposed_operation": proposed,
        }

        messages = [
            {
                "role": "system",
                "content": (
                    "You are QuantumLearn Circuit AI. "
                    "Predict the conceptual consequences of adding "
                    "the proposed gate to the current circuit. "
                    "Use the actual gate sequence. "
                    "Do not invent measurement probabilities. "
                    "Return JSON only:\n"
                    "{"
                    '"prediction":"...",'
                    '"consequences":[],'
                    '"warnings":[],'
                    '"recommended_action":"..."'
                    "}"
                ),
            },
            {
                "role": "user",
                "content": json.dumps(
                    payload,
                    indent=2,
                ),
            },
        ]

        try:
            text = self._chat(
                messages,
                max_tokens=2000,
                temperature=0.15,
            )

            data = self._extract_json(text)

            prediction = (
                data.get("prediction")
                or data.get("answer")
                or ""
            )

            consequences = data.get(
                "consequences",
                [],
            )

            warnings = data.get(
                "warnings",
                [],
            )

            if not prediction:
                raise ValueError(
                    "AI returned no readable prediction."
                )

            return {
                "success": True,
                "provider": self.provider_name,
                "answer": prediction,
                "prediction": prediction,
                "consequences": consequences,
                "warnings": warnings,
                "recommended_action": data.get(
                    "recommended_action",
                    "Run the circuit to verify the result.",
                ),
                "current_circuit": {
                    "num_qubits": num_qubits,
                    "gates": normalized,
                },
                "proposed_operation": proposed,
            }

        except Exception as exc:
            fallback = LocalKnowledgeProvider().predict_circuit_consequences(
                gates=normalized,
                num_qubits=num_qubits,
                proposed_operation=proposed,
            )

            fallback["provider"] = self.provider_name
            fallback["ai_warning"] = str(exc)

            return fallback

    # ========================================================
    # OPTIMIZE CIRCUIT
    # ========================================================

    def optimize_circuit(
        self,
        gates: list[dict[str, Any]],
        num_qubits: int,
    ) -> dict[str, Any]:

        normalized = normalize_gates(gates)

        messages = [
            {
                "role": "system",
                "content": (
                    "You are a quantum circuit optimizer. "
                    "Optimize the supplied circuit while preserving "
                    "its intended behavior. "
                    "Return JSON only:\n"
                    "{"
                    '"optimized_gates":[],'
                    '"optimizations":[],'
                    '"explanation":"...",'
                    '"warnings":[]'
                    "}"
                ),
            },
            {
                "role": "user",
                "content": json.dumps(
                    {
                        "num_qubits": num_qubits,
                        "gates": normalized,
                    },
                    indent=2,
                ),
            },
        ]

        try:
            text = self._chat(
                messages,
                max_tokens=2200,
                temperature=0.1,
            )

            data = self._extract_json(text)

            optimized = normalize_gates(
                data.get(
                    "optimized_gates",
                    normalized,
                )
            )

            removed = (
                len(normalized)
                - len(optimized)
            )

            return {
                "success": True,
                "provider": self.provider_name,
                "original_gates": normalized,
                "optimized_gates": optimized,
                "original_gate_count": len(normalized),
                "optimized_gate_count": len(optimized),
                "gates_removed": removed,
                "reduction_percent": (
                    round(
                        removed / len(normalized) * 100,
                        2,
                    )
                    if normalized
                    else 0
                ),
                "optimizations": data.get(
                    "optimizations",
                    [],
                ),
                "explanation": data.get(
                    "explanation",
                    "",
                ),
                "warnings": data.get(
                    "warnings",
                    [],
                ),
            }

        except Exception as exc:
            fallback = LocalKnowledgeProvider().optimize_circuit(
                gates=normalized,
                num_qubits=num_qubits,
            )

            fallback["provider"] = self.provider_name
            fallback["ai_warning"] = str(exc)

            return fallback

    # ========================================================
    # PREDICT FULL CIRCUIT
    # ========================================================

    def predict_circuit(
        self,
        gates: list[dict[str, Any]],
        num_qubits: int,
    ) -> dict[str, Any]:

        normalized = normalize_gates(gates)

        if not normalized:
            return {
                "success": False,
                "provider": self.provider_name,
                "predicted_outcome": (
                    "No prediction can be made because "
                    "the circuit contains no gates."
                ),
                "expected_states": [],
                "expected_probabilities": {},
                "confidence": "Low",
            }

        try:
            from app.services.quantum_service import (
                simulate_circuit,
            )

            result = simulate_circuit(
                num_qubits=num_qubits,
                gates=normalized,
                shots=1024,
            )

            counts = result.get(
                "counts",
                {},
            )

            probabilities = result.get(
                "probabilities",
                {},
            )

            exact_probabilities = result.get(
                "exact_probabilities",
                {},
            )

            most_frequent = result.get(
                "most_frequent_state"
            )

            shots = result.get(
                "shots",
                1024,
            )

        except Exception as exc:
            return {
                "success": False,
                "provider": self.provider_name,
                "predicted_outcome": (
                    "Quantum simulation failed."
                ),
                "expected_states": [],
                "expected_probabilities": {},
                "confidence": "Low",
                "error": str(exc),
            }

        payload = {
            "num_qubits": num_qubits,
            "gates": normalized,
            "shots": shots,
            "counts": counts,
            "probabilities": probabilities,
            "exact_probabilities": exact_probabilities,
            "most_frequent_state": most_frequent,
        }

        messages = [
            {
                "role": "system",
                "content": (
                    "You are QuantumLearn Circuit AI. "
                    "The Quantum Engine has already simulated the "
                    "circuit. "
                    "Explain the actual result. "
                    "Never change the supplied numerical values. "
                    "Connect the gate sequence, measured states and "
                    "probabilities into one clear explanation. "
                    "Return JSON only:\n"
                    "{"
                    '"predicted_outcome":"...",'
                    '"explanation":"...",'
                    '"key_observations":[],'
                    '"confidence":"High|Medium|Low"'
                    "}"
                ),
            },
            {
                "role": "user",
                "content": json.dumps(
                    payload,
                    indent=2,
                    default=str,
                ),
            },
        ]

        try:
            text = self._chat(
                messages,
                max_tokens=2500,
                temperature=0.15,
            )

            data = self._extract_json(text)

            explanation = (
                data.get("explanation")
                or data.get("predicted_outcome")
                or ""
            )

            predicted_outcome = (
                data.get("predicted_outcome")
                or explanation
            )

            return {
                "success": True,
                "provider": self.provider_name,
                "predicted_outcome": predicted_outcome,
                "explanation": explanation,
                "key_observations": data.get(
                    "key_observations",
                    [],
                ),
                "confidence": data.get(
                    "confidence",
                    "High",
                ),
                "expected_states": list(
                    counts.keys()
                ),
                "expected_probabilities": probabilities,
                "exact_probabilities": exact_probabilities,
                "most_frequent_state": most_frequent,
                "shots": shots,
                "quantum_result": result,
                "gates": normalized,
            }

        except Exception as exc:
            # Simulation is still valid even when AI fails.
            local_result = LocalKnowledgeProvider().predict_circuit(
                gates=normalized,
                num_qubits=num_qubits,
            )

            return {
                "success": True,
                "provider": "quantum_engine",
                "predicted_outcome": (
                    f"The Quantum Engine simulated the circuit "
                    f"using {shots} shots. "
                    f"The most frequent state was "
                    f"|{most_frequent}⟩."
                    if most_frequent
                    else (
                        "The Quantum Engine completed the simulation."
                    )
                ),
                "explanation": (
                    "The numerical simulation completed successfully. "
                    "AI interpretation is temporarily unavailable."
                ),
                "key_observations": [
                    f"Shots: {shots}",
                    f"Most frequent state: {most_frequent}"
                    if most_frequent
                    else "No dominant state.",
                ],
                "confidence": "High",
                "expected_states": list(
                    counts.keys()
                ),
                "expected_probabilities": probabilities,
                "exact_probabilities": exact_probabilities,
                "most_frequent_state": most_frequent,
                "shots": shots,
                "quantum_result": result,
                "gates": normalized,
                "ai_warning": str(exc),
            }


# ============================================================
# GROQ PROVIDER
# ============================================================

class GroqProvider(CloudAIProvider):

    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        base_url: str | None = None,
    ):

        super().__init__(
            api_key=api_key
            or getattr(
                settings,
                "GROQ_API_KEY",
                None,
            ),

            model=model
            or getattr(
                settings,
                "GROQ_MODEL",
                None,
            )
            or "openai/gpt-oss-120b",

            base_url=base_url
            or getattr(
                settings,
                "GROQ_BASE_URL",
                None,
            )
            or "https://api.groq.com/openai/v1",

            provider_name="groq",
        )


# ============================================================
# NVIDIA / DEEPSEEK PROVIDER
# ============================================================

class NvidiaNIMProvider(CloudAIProvider):

    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        base_url: str | None = None,
        fallback: AIProvider | None = None,
    ):

        super().__init__(
            api_key=api_key
            or getattr(
                settings,
                "NVIDIA_API_KEY",
                None,
            ),

            model=model
            or getattr(
                settings,
                "NVIDIA_MODEL",
                None,
            )
            or "deepseek-ai/deepseek-v4-flash-0731",

            base_url=base_url
            or getattr(
                settings,
                "NVIDIA_BASE_URL",
                None,
            )
            or "https://integrate.api.nvidia.com/v1",

            provider_name="deepseek",
        )

        self.fallback = (
            fallback
            or LocalKnowledgeProvider()
        )


# ============================================================
# HELPERS
# ============================================================

def normalize_gates(
    gates: list[dict[str, Any]] | None,
) -> list[dict[str, Any]]:

    normalized = []

    for index, raw in enumerate(gates or []):

        if not isinstance(raw, dict):
            continue

        gate_name = (
            raw.get("gate")
            or raw.get("type")
            or raw.get("name")
            or raw.get("operation")
        )

        if not gate_name:
            continue

        gate = {
            "gate": str(
                gate_name
            ).upper().strip()
        }

        if raw.get("qubit") is not None:
            try:
                gate["qubit"] = int(
                    raw["qubit"]
                )
            except Exception:
                gate["qubit"] = raw["qubit"]

        elif raw.get("wire") is not None:
            try:
                gate["qubit"] = int(
                    raw["wire"]
                )
            except Exception:
                gate["qubit"] = raw["wire"]

        if raw.get("control") is not None:
            try:
                gate["control"] = int(
                    raw["control"]
                )
            except Exception:
                gate["control"] = raw["control"]

        if raw.get("target") is not None:
            try:
                gate["target"] = int(
                    raw["target"]
                )
            except Exception:
                gate["target"] = raw["target"]

        if raw.get("column") is not None:
            try:
                gate["column"] = int(
                    raw["column"]
                )
            except Exception:
                gate["column"] = raw["column"]
        else:
            gate["column"] = index

        parameter = (
            raw.get("parameter")
            if raw.get("parameter") is not None
            else raw.get("angle")
        )

        if parameter is not None:
            gate["parameter"] = parameter

        normalized.append(gate)

    return normalized


# ============================================================
# PROVIDER FACTORY
# ============================================================

def get_ai_provider() -> AIProvider:

    provider_name = (
        getattr(
            settings,
            "AI_PROVIDER",
            None,
        )
        or "auto"
    ).lower().strip()

    # --------------------------------------------------------
    # OFFLINE / LOCAL MODE — NEVER contact external services
    # --------------------------------------------------------
    # When AI_PROVIDER=local (or "offline") the app uses the
    # built-in LocalKnowledgeProvider regardless of any API
    # keys that may still be present in the environment.
    if provider_name in {
        "local",
        "offline",
    }:
        return LocalKnowledgeProvider()

    # --------------------------------------------------------
    # GROQ — PRIMARY
    # --------------------------------------------------------

    groq_key = getattr(
        settings,
        "GROQ_API_KEY",
        None,
    )

    if provider_name in {
        "groq",
        "auto",
        "cloud",
    } and groq_key:

        return GroqProvider(
            api_key=groq_key,
            model=getattr(
                settings,
                "GROQ_MODEL",
                None,
            ),
            base_url=getattr(
                settings,
                "GROQ_BASE_URL",
                None,
            ),
        )

    # --------------------------------------------------------
    # NVIDIA / DEEPSEEK — SECONDARY
    # --------------------------------------------------------

    nvidia_key = getattr(
        settings,
        "NVIDIA_API_KEY",
        None,
    )

    if provider_name in {
        "nvidia",
        "deepseek",
    } and nvidia_key:

        return NvidiaNIMProvider(
            api_key=nvidia_key,
            model=getattr(
                settings,
                "NVIDIA_MODEL",
                None,
            ),
            base_url=getattr(
                settings,
                "NVIDIA_BASE_URL",
                None,
            ),
        )

    # --------------------------------------------------------
    # LOCAL FALLBACK
    # --------------------------------------------------------

    return LocalKnowledgeProvider()


__all__ = [
    "AIProvider",
    "LocalKnowledgeProvider",
    "CloudAIProvider",
    "GroqProvider",
    "NvidiaNIMProvider",
    "get_ai_provider",
]