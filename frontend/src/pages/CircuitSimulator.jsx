import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Code2,
  Cpu,
  Eraser,
  Gauge,
  GitBranch,
  Lightbulb,
  Loader2,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  Trash2,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

import "./CircuitSimulator.css";

import { API_BASE_URL } from "../services/api";
import { simulateCircuit } from "../services/quantumApi";
import BottomNavigation from "../components/BottomNavigation";

const INITIAL_QUBITS = 2;
const INITIAL_COLUMNS = 8;
const MAX_QUBITS = 20;
const MAX_COLUMNS = 20;

const MULTI_GATES = new Set(["CNOT", "CZ", "SWAP"]);

const SINGLE_GATES = [
  {
    id: "H",
    label: "H",
    name: "Hadamard",
    description: "Creates superposition",
  },
  {
    id: "X",
    label: "X",
    name: "Pauli-X",
    description: "Bit flip",
  },
  {
    id: "Y",
    label: "Y",
    name: "Pauli-Y",
    description: "Y-axis rotation",
  },
  {
    id: "Z",
    label: "Z",
    name: "Pauli-Z",
    description: "Phase flip",
  },
  {
    id: "S",
    label: "S",
    name: "S Gate",
    description: "90° phase",
  },
  {
    id: "T",
    label: "T",
    name: "T Gate",
    description: "45° phase",
  },
  {
    id: "RX",
    label: "Rx",
    name: "Rotation X",
    description: "X-axis rotation",
  },
  {
    id: "RY",
    label: "Ry",
    name: "Rotation Y",
    description: "Y-axis rotation",
  },
  {
    id: "RZ",
    label: "Rz",
    name: "Rotation Z",
    description: "Z-axis rotation",
  },
];

const GATES = [
  ...SINGLE_GATES,
  {
    id: "CNOT",
    label: "CX",
    name: "Controlled-X",
    description: "Entangles two qubits",
    multi: true,
  },
  {
    id: "CZ",
    label: "CZ",
    name: "Controlled-Z",
    description: "Controlled phase",
    multi: true,
  },
  {
    id: "SWAP",
    label: "⇄",
    name: "SWAP",
    description: "Swaps two qubits",
    multi: true,
  },
];

const CIRCUIT_PRESETS = [
  {
    id: "bell-state",
    name: "Bell state",
    description: "Superposition and entanglement",
    qubits: 2,
    columns: 2,
    operations: [
      { gate: "H", qubit: 0, column: 0 },
      { gate: "CNOT", control: 0, target: 1, column: 1 },
    ],
  },
  {
    id: "superposition",
    name: "Superposition",
    description: "Put both qubits into superposition",
    qubits: 2,
    columns: 1,
    operations: [
      { gate: "H", qubit: 0, column: 0 },
      { gate: "H", qubit: 1, column: 0 },
    ],
  },
  {
    id: "bit-flip",
    name: "Bit flip",
    description: "Flip the first qubit",
    qubits: 1,
    columns: 1,
    operations: [{ gate: "X", qubit: 0, column: 0 }],
  },
];

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const normalizeGateName = (gate) =>
  String(gate || "")
    .trim()
    .toUpperCase();

const isMultiGate = (gate) => MULTI_GATES.has(normalizeGateName(gate));

const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max);

const safeNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const createSingleGate = (gate, qubit, column) => ({
  id: makeId(),
  gate: normalizeGateName(gate),
  qubit,
  column,
});

const createMultiGate = (gate, control, target, column) => ({
  id: makeId(),
  gate: normalizeGateName(gate),
  control,
  target,
  qubit: control,
  column,
});

const normalizeOperation = (operation, index = 0) => {
  if (!operation) return null;

  const gate = normalizeGateName(
    operation.gate || operation.name || operation.type
  );

  const column = clamp(
    safeNumber(operation.column, 0),
    0,
    MAX_COLUMNS - 1
  );

  if (isMultiGate(gate)) {
    const control = safeNumber(
      operation.control ?? operation.qubit ?? operation.qubits?.[0],
      0
    );

    const target = safeNumber(
      operation.target ?? operation.qubits?.[1],
      control === 0 ? 1 : 0
    );

    if (control === target) return null;

    return {
      id: operation.id || `generated-${index}-${makeId()}`,
      gate,
      control,
      target,
      qubit: control,
      column,
    };
  }

  return {
    id: operation.id || `generated-${index}-${makeId()}`,
    gate,
    qubit: safeNumber(operation.qubit, 0),
    column,
  };
};

function CircuitSimulator() {
  const [qubits, setQubits] = useState(INITIAL_QUBITS);
  const [columnCount, setColumnCount] = useState(INITIAL_COLUMNS);
  const [operations, setOperations] = useState([]);
  const [selectedCircuit, setSelectedCircuit] = useState("");

  const [selectedGate, setSelectedGate] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [draggedGate, setDraggedGate] = useState(null);
  const [pendingControl, setPendingControl] = useState(null);

  const [simulationResult, setSimulationResult] = useState(null);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [error, setError] = useState("");

  const [prompt, setPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState("");
  const [aiResult, setAiResult] = useState("");

  const [liveAIResult, setLiveAIResult] = useState("");
  const [liveAILoading, setLiveAILoading] = useState(false);

  const [showResultDetails, setShowResultDetails] = useState(true);

  const liveAITimerRef = useRef(null);
  const aiAbortRef = useRef(null);

  // ------------------------------------------------------------
  // "Try in Simulator" handoff from the Interactive Visual Lecture
  // ------------------------------------------------------------

  const location = useLocation();
  const preload = location.state?.preload;
  const [preloadTitle, setPreloadTitle] = useState("");

  useEffect(() => {
    if (!preload || !Array.isArray(preload.gates)) return undefined;

    const numQubits = Math.max(
      1,
      Math.min(MAX_QUBITS, Number(preload.num_qubits) || 1)
    );

    const normalized = preload.gates
      .map((operation, index) => normalizeOperation(operation, index))
      .filter(Boolean)
      .filter((operation) =>
        isMultiGate(operation.gate)
          ? operation.control < numQubits &&
            operation.target < numQubits &&
            operation.control !== operation.target
          : operation.qubit < numQubits
      );

    setQubits(numQubits);
    setOperations(normalized);
    setSimulationResult(null);
    setSelectedGate(null);
    setPendingControl(null);
    setSelectedCircuit("");
    setPreloadTitle(preload.title || "");

    // Consume the history entry so refresh/back won't re-apply the preload.
    window.history.replaceState({}, "");

    let cancelled = false;

    // Auto-run so the learner immediately sees real simulation results.
    const runPreloaded = async () => {
      if (!normalized.length) return;

      try {
        setSimulationLoading(true);
        setError("");

        const gatesForApi = normalized.map((operation) =>
          isMultiGate(operation.gate)
            ? {
                gate: operation.gate === "CNOT" ? "CX" : operation.gate,
                control: operation.control,
                target: operation.target,
                column: operation.column,
              }
            : {
                gate: operation.gate,
                qubit: operation.qubit,
                column: operation.column,
              }
        );

        const result = await simulateCircuit({
          numQubits,
          gates: gatesForApi,
        });

        if (!cancelled) setSimulationResult(result);
      } catch (simulationError) {
        if (!cancelled) {
          setError(
            simulationError?.message ||
              "Unable to simulate the preloaded circuit."
          );
        }
      } finally {
        if (!cancelled) setSimulationLoading(false);
      }
    };

    runPreloaded();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preload]);

  const gates = useMemo(() => operations, [operations]);

  const circuitJson = useMemo(() => {
    const uniqueMulti = new Set();

    const normalized = [];

    for (const operation of gates) {
      if (!operation) continue;

      const gate = normalizeGateName(operation.gate);

      if (isMultiGate(gate)) {
        const control = safeNumber(operation.control);
        const target = safeNumber(operation.target);

        if (control === target) continue;

        const pairKey = `${gate}-${Math.min(
          control,
          target
        )}-${Math.max(control, target)}-${operation.column}`;

        if (uniqueMulti.has(pairKey)) continue;

        uniqueMulti.add(pairKey);

        normalized.push({
          gate: gate === "CNOT" ? "CX" : gate,
          control,
          target,
          column: operation.column,
        });
      } else {
        normalized.push({
          gate,
          qubit: safeNumber(operation.qubit),
          column: operation.column,
        });
      }
    }

    return {
      num_qubits: qubits,
      gates: normalized,
    };
  }, [gates, qubits]);

  const warnings = useMemo(() => {
    const result = [];

    if (!gates.length) {
      result.push({
        type: "info",
        message:
          "Circuit is empty. Add quantum gates before running the simulation.",
      });

      return result;
    }

    if (qubits < 1 || qubits > MAX_QUBITS) {
      result.push({
        type: "error",
        message: `Number of qubits must be between 1 and ${MAX_QUBITS}.`,
      });
    }

    if (columnCount < 1 || columnCount > MAX_COLUMNS) {
      result.push({
        type: "error",
        message: `Number of columns must be between 1 and ${MAX_COLUMNS}.`,
      });
    }

    const occupied = new Set();

    for (const operation of gates) {
      if (!operation) continue;

      const gate = normalizeGateName(operation.gate);

      if (isMultiGate(gate)) {
        const control = safeNumber(operation.control, -1);
        const target = safeNumber(operation.target, -1);

        if (
          control < 0 ||
          target < 0 ||
          control >= qubits ||
          target >= qubits ||
          control === target
        ) {
          result.push({
            type: "error",
            message: `${gate} has an invalid control/target qubit.`,
          });
        }

        if (operation.column >= columnCount) {
          result.push({
            type: "error",
            message: `${gate} is outside the current circuit columns.`,
          });
        }

        const key = `${gate}-${Math.min(
          control,
          target
        )}-${Math.max(control, target)}-${operation.column}`;

        if (occupied.has(key)) {
          result.push({
            type: "warning",
            message: `Duplicate ${gate} operation detected.`,
          });
        }

        occupied.add(key);
      } else {
        const qubit = safeNumber(operation.qubit, -1);

        if (qubit < 0 || qubit >= qubits) {
          result.push({
            type: "error",
            message: `${gate} is placed on an invalid qubit.`,
          });
        }

        if (operation.column >= columnCount) {
          result.push({
            type: "error",
            message: `${gate} is outside the current circuit columns.`,
          });
        }

        const key = `${qubit}-${operation.column}`;

        if (occupied.has(key)) {
          result.push({
            type: "warning",
            message: `Multiple operations are occupying the same qubit and column.`,
          });
        }

        occupied.add(key);
      }
    }

    for (let q = 0; q < qubits; q += 1) {
      const rowOps = gates
        .filter((operation) => {
          if (!operation) return false;

          if (isMultiGate(operation.gate)) {
            return (
              operation.control === q ||
              operation.target === q
            );
          }

          return operation.qubit === q;
        })
        .sort((a, b) => a.column - b.column);

      for (let i = 0; i < rowOps.length - 1; i += 1) {
        const first = normalizeGateName(rowOps[i].gate);
        const second = normalizeGateName(rowOps[i + 1].gate);

        if (
          rowOps[i].column + 1 === rowOps[i + 1].column &&
          ["H", "X", "Y", "Z"].includes(first) &&
          first === second
        ) {
          result.push({
            type: "warning",
            message: `${first} followed immediately by ${second} may cancel each other.`,
          });
        }
      }
    }

    const hasEntanglementGate = gates.some((operation) =>
      isMultiGate(operation?.gate)
    );

    if (hasEntanglementGate) {
      result.push({
        type: "success",
        message:
          "Entangling operation detected. This circuit can demonstrate multi-qubit behaviour.",
      });
    }

    return result;
  }, [gates, qubits, columnCount]);

  const getGateDefinition = useCallback((gateName) => {
    return GATES.find(
      (gate) => normalizeGateName(gate.id) === normalizeGateName(gateName)
    );
  }, []);

  const getAIGates = useCallback(
    (sourceGates = gates) =>
      sourceGates.map((operation) => {
        if (isMultiGate(operation.gate)) {
          return {
            gate: normalizeGateName(operation.gate),
            control: operation.control,
            target: operation.target,
            column: operation.column,
          };
        }

        return {
          gate: normalizeGateName(operation.gate),
          qubit: operation.qubit,
          column: operation.column,
        };
      }),
    [gates]
  );

  const getCircuitDescription = useCallback(
    (sourceGates = gates) => {
      if (!sourceGates.length) {
        return "The circuit is currently empty.";
      }

      return sourceGates
        .map((operation) => {
          const definition = getGateDefinition(operation.gate);
          const label = definition?.name || operation.gate;

          if (isMultiGate(operation.gate)) {
            return `${label} between q${operation.control} and q${operation.target} at column ${operation.column}`;
          }

          return `${label} on q${operation.qubit} at column ${operation.column}`;
        })
        .join(", ");
    },
    [gates, getGateDefinition]
  );

  const requestLiveAI = useCallback(
    async (nextQubits, nextOperations) => {
      if (liveAITimerRef.current) {
        clearTimeout(liveAITimerRef.current);
      }

      liveAITimerRef.current = setTimeout(async () => {
        try {
          if (aiAbortRef.current) {
            aiAbortRef.current.abort();
          }

          const controller = new AbortController();
          aiAbortRef.current = controller;

          setLiveAILoading(true);

          const response = await fetch(
            `${API_BASE_URL}/api/ai/circuit/analyze`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              signal: controller.signal,
              body: JSON.stringify({
                num_qubits: nextQubits,
                gates: getAIGates(nextOperations),
                question:
                  "Analyze this quantum circuit and provide short, beginner-friendly guidance. Mention what the circuit is doing, any structural issue, and one improvement if useful.",
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data?.detail || "AI guidance request failed."
            );
          }

          const text =
            data?.answer ||
            data?.explanation ||
            data?.message ||
            data?.response ||
            data?.analysis ||
            data?.text ||
            "";

          if (text) {
            setLiveAIResult(cleanAIOutput(text));
          } else {
            setLiveAIResult(
              "AI guidance is available, but no explanation was returned."
            );
          }
        } catch (requestError) {
          if (requestError?.name === "AbortError") return;

          setLiveAIResult(
            getLocalAIGuidance(nextQubits, nextOperations)
          );
        } finally {
          setLiveAILoading(false);
        }
      }, 450);
    },
    [getAIGates]
  );

  const getLocalAIGuidance = (
    currentQubits,
    currentOperations
  ) => {
    if (!currentOperations.length) {
      return "Start by adding a gate such as H to create superposition.";
    }

    const hasH = currentOperations.some(
      (operation) => normalizeGateName(operation.gate) === "H"
    );

    const hasEntanglement = currentOperations.some((operation) =>
      isMultiGate(operation.gate)
    );

    if (hasEntanglement) {
      return "Your circuit contains a multi-qubit gate. This is useful for demonstrating entanglement and correlations between qubits.";
    }

    if (hasH) {
      return "The Hadamard gate creates superposition. Try combining it with a CNOT to explore a Bell state.";
    }

    return `You currently have ${currentOperations.length} gate${
      currentOperations.length === 1 ? "" : "s"
    } on ${currentQubits} qubits. Run the circuit to observe the measurement distribution.`;
  };

  useEffect(() => {
    requestLiveAI(qubits, gates);

    return () => {
      if (liveAITimerRef.current) {
        clearTimeout(liveAITimerRef.current);
      }
    };
  }, [qubits, gates, requestLiveAI]);

  const placeGate = useCallback(
    (gateName, qubit, column) => {
      const gate = normalizeGateName(gateName);

      if (qubit < 0 || qubit >= qubits) return;
      if (column < 0 || column >= columnCount) return;

      if (isMultiGate(gate)) {
        if (!pendingControl) {
          setPendingControl({
            gate,
            qubit,
            column,
          });

          setSelectedGate(gate);
          return;
        }

        if (
          pendingControl.gate === gate &&
          pendingControl.column === column &&
          pendingControl.qubit !== qubit
        ) {
          const newOperation = createMultiGate(
            gate,
            pendingControl.qubit,
            qubit,
            column
          );

          setOperations((previous) => [
            ...previous,
            newOperation,
          ]);

          setPendingControl(null);
          setSelectedGate(null);

          return;
        }

        setPendingControl(null);
        setSelectedGate(null);

        return;
      }

      const existing = operations.find(
        (operation) =>
          !isMultiGate(operation.gate) &&
          operation.qubit === qubit &&
          operation.column === column
      );

      if (existing) {
        setOperations((previous) =>
          previous.filter(
            (operation) => operation.id !== existing.id
          )
        );

        return;
      }

      const newOperation = createSingleGate(
        gate,
        qubit,
        column
      );

      setOperations((previous) => [
        ...previous,
        newOperation,
      ]);

      setSelectedGate(null);
    },
    [pendingControl, qubits, columnCount, operations]
  );

  const handleCellClick = (qubit, column) => {
    if (selectedGate) {
      placeGate(selectedGate, qubit, column);
    }
  };

  const handleDragStart = (event, gate) => {
    setDraggedGate(gate.id);
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("text/plain", gate.id);
  };

  const handleDragOver = (event, qubit, column) => {
    event.preventDefault();

    setDragOver({
      qubit,
      column,
    });
  };

  const handleDrop = (event, qubit, column) => {
    event.preventDefault();

    const gateId =
      event.dataTransfer.getData("text/plain") ||
      draggedGate;

    if (gateId) {
      placeGate(gateId, qubit, column);
    }

    setDragOver(null);
    setDraggedGate(null);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const clearCircuit = () => {
    setOperations([]);
    setSimulationResult(null);
    setSelectedGate(null);
    setPendingControl(null);
    setAiResult("");
    setLiveAIResult("");
    setError("");
  };

  const resetCircuit = () => {
    setQubits(INITIAL_QUBITS);
    setColumnCount(INITIAL_COLUMNS);
    setOperations([]);
    setSimulationResult(null);
    setSelectedGate(null);
    setPendingControl(null);
    setAiResult("");
    setLiveAIResult("");
    setError("");
    setSelectedCircuit("");
  };

  const selectCircuit = (event) => {
    const preset = CIRCUIT_PRESETS.find(
      (circuit) => circuit.id === event.target.value
    );

    setSelectedCircuit(event.target.value);

    if (!preset) return;

    setQubits(preset.qubits);
    setColumnCount(preset.columns);
    setOperations(
      preset.operations.map((operation, index) =>
        normalizeOperation(operation, index)
      )
    );
    setSimulationResult(null);
    setSelectedGate(null);
    setPendingControl(null);
    setError("");
  };

  const addQubit = () => {
    setQubits((previous) =>
      clamp(previous + 1, 1, MAX_QUBITS)
    );
  };

  const removeQubit = () => {
    setQubits((previous) => {
      const next = clamp(previous - 1, 1, MAX_QUBITS);

      setOperations((current) =>
        current.filter((operation) => {
          if (isMultiGate(operation.gate)) {
            return (
              operation.control < next &&
              operation.target < next
            );
          }

          return operation.qubit < next;
        })
      );

      return next;
    });
  };

  const addColumn = () => {
    setColumnCount((previous) =>
      clamp(previous + 1, 1, MAX_COLUMNS)
    );
  };

  const removeColumn = () => {
    setColumnCount((previous) => {
      const next = clamp(
        previous - 1,
        1,
        MAX_COLUMNS
      );

      setOperations((current) =>
        current.filter(
          (operation) => operation.column < next
        )
      );

      return next;
    });
  };

  const runCircuit = async () => {
    setError("");

    const hasErrors = warnings.some(
      (warning) => warning.type === "error"
    );

    if (hasErrors) {
      setError(
        "Please fix the circuit validation errors before running the simulation."
      );
      return;
    }

    if (!gates.length) {
      setError(
        "Add at least one gate before running the circuit."
      );
      return;
    }

    try {
      setSimulationLoading(true);

      const gatesForApi = circuitJson.gates;

      const result = await simulateCircuit({
        numQubits: qubits,
        gates: gatesForApi,
      });

      setSimulationResult(result);
    } catch (simulationError) {
      setError(
        simulationError?.message ||
          "Unable to simulate the circuit."
      );
    } finally {
      setSimulationLoading(false);
    }
  };

  const aiRequest = async (endpoint, body) => {
    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.detail ||
          data?.message ||
          "AI request failed."
      );
    }

    return data;
  };

  const extractAIText = (data) => {
    if (!data) return "";

    return (
      data.answer ||
      data.explanation ||
      data.message ||
      data.response ||
      data.predicted_outcome ||
      data.prediction ||
      data.optimization ||
      data.analysis ||
      data.text ||
      ""
    );
  };

  const cleanAIOutput = (text) => {
    if (!text) return "";

    let cleaned = String(text);

    cleaned = cleaned.replace(
      /```(?:json|text)?/gi,
      ""
    );

    cleaned = cleaned.replace(
      /CIRCUIT DATA[\s\S]*$/i,
      ""
    );

    cleaned = cleaned.replace(
      /Circuit JSON[\s\S]*$/i,
      ""
    );

    cleaned = cleaned.replace(
      /svgCopy[\s\S]*$/i,
      ""
    );

    cleaned = cleaned.trim();

    try {
      const parsed = JSON.parse(cleaned);

      if (typeof parsed === "object") {
        return (
          parsed.answer ||
          parsed.explanation ||
          parsed.message ||
          parsed.analysis ||
          parsed.text ||
          cleaned
        );
      }
    } catch {
      // Normal text response.
    }

    return cleaned;
  };

  const generateCircuit = async () => {
    if (!prompt.trim()) {
      setError(
        "Describe the circuit you want the AI to generate."
      );
      return;
    }

    try {
      setError("");
      setAiLoading(true);
      setAiMode("generate");
      setAiResult("");

      const data = await aiRequest(
        "/api/ai/generate-circuit",
        {
          prompt: prompt.trim(),
          num_qubits: qubits,
          current_gates: getAIGates(),
        }
      );

      const text = extractAIText(data);

      if (data?.gates || data?.circuit) {
        const generated =
          data.gates ||
          data.circuit?.gates ||
          [];

        loadGeneratedCircuit(generated);
      }

      setAiResult(
        cleanAIOutput(text) ||
          "AI generated the requested circuit."
      );
    } catch (requestError) {
      setAiResult(
        "The AI circuit generator is currently unavailable."
      );
      setError(requestError?.message || "");
    } finally {
      setAiLoading(false);
      setAiMode("");
    }
  };

  const loadGeneratedCircuit = (generatedGates) => {
    if (!Array.isArray(generatedGates)) return;

    const normalized = generatedGates
      .map((operation, index) =>
        normalizeOperation(operation, index)
      )
      .filter(Boolean)
      .filter((operation) => {
        if (isMultiGate(operation.gate)) {
          return (
            operation.control >= 0 &&
            operation.target >= 0 &&
            operation.control < qubits &&
            operation.target < qubits &&
            operation.control !== operation.target &&
            operation.column < columnCount
          );
        }

        return (
          operation.qubit >= 0 &&
          operation.qubit < qubits &&
          operation.column < columnCount
        );
      });

    setOperations(normalized);
    setSimulationResult(null);
    setSelectedGate(null);
    setPendingControl(null);
  };

  const explainCircuit = async () => {
    try {
      setError("");
      setAiLoading(true);
      setAiMode("explain");
      setAiResult("");

      let data;

      if (simulationResult) {
        data = await aiRequest(
          "/api/ai/analyze-result",
          {
            question:
              "Explain this quantum circuit simulation result in simple beginner-friendly language.",
            result: simulationResult,
          }
        );
      } else {
        data = await aiRequest(
          "/api/ai/circuit/analyze",
          {
            num_qubits: qubits,
            gates: getAIGates(),
            question:
              "Explain this quantum circuit in simple beginner-friendly language. Explain what each important gate is doing and what the circuit is expected to demonstrate.",
          }
        );
      }

      setAiResult(
        cleanAIOutput(extractAIText(data)) ||
          "The AI could not provide an explanation."
      );
    } catch (requestError) {
      setAiResult(
        "Unable to get an AI explanation right now."
      );
      setError(requestError?.message || "");
    } finally {
      setAiLoading(false);
      setAiMode("");
    }
  };

  const predictResult = async () => {
    try {
      setError("");
      setAiLoading(true);
      setAiMode("predict");
      setAiResult("");

      const data = await aiRequest(
        "/api/ai/predict",
        {
          question:
            "Predict the likely measurement behaviour of this quantum circuit and explain why.",
          num_qubits: qubits,
          gates: getAIGates(),
        }
      );

      setAiResult(
        cleanAIOutput(extractAIText(data)) ||
          "The AI could not provide a prediction."
      );
    } catch (requestError) {
      setAiResult(
        "Unable to generate a prediction right now."
      );
      setError(requestError?.message || "");
    } finally {
      setAiLoading(false);
      setAiMode("");
    }
  };

  const optimizeCircuit = async () => {
    try {
      setError("");
      setAiLoading(true);
      setAiMode("optimize");
      setAiResult("");

      const data = await aiRequest(
        "/api/ai/optimize",
        {
          num_qubits: qubits,
          gates: getAIGates(),
          // IMPORTANT:
          // Backend expects "prompt", not "question".
          prompt: `
Optimize ONLY this quantum circuit.

Current circuit:
${getCircuitDescription()}

Qubits: ${qubits}
Gates: ${JSON.stringify(getAIGates())}

Give concise optimization suggestions.
Do not invent unrelated circuits.
Explain which gates can be removed, merged, reordered, or simplified.
          `.trim(),
        }
      );

      setAiResult(
        cleanAIOutput(extractAIText(data)) ||
          "No optimization suggestions were returned."
      );
    } catch (requestError) {
      setAiResult(
        "Unable to optimize the circuit right now."
      );
      setError(requestError?.message || "");
    } finally {
      setAiLoading(false);
      setAiMode("");
    }
  };

  const debugCircuit = async () => {
    try {
      setError("");
      setAiLoading(true);
      setAiMode("debug");
      setAiResult("");

      const data = await aiRequest(
        "/api/ai/debug",
        {
          code: JSON.stringify(circuitJson, null, 2),
          circuit: circuitJson,
          num_qubits: qubits,
          gates: getAIGates(),
          local_warnings: warnings,
          question:
            "Debug this quantum circuit. Identify structural issues and explain exactly how to fix them.",
        }
      );

      setAiResult(
        cleanAIOutput(extractAIText(data)) ||
          "No debugging issue was identified."
      );
    } catch (requestError) {
      setAiResult(
        "Unable to debug the circuit right now."
      );
      setError(requestError?.message || "");
    } finally {
      setAiLoading(false);
      setAiMode("");
    }
  };

  const renderCnotLine = (
    operation,
    currentQubit,
    currentColumn
  ) => {
    if (!isMultiGate(operation.gate)) {
      return null;
    }

    if (
      operation.column !== currentColumn ||
      ![
        operation.control,
        operation.target,
      ].includes(currentQubit)
    ) {
      return null;
    }

    const distance =
      Math.abs(
        operation.control - operation.target
      );

    return (
      <span
        className="multi-gate-line"
        style={{
          height: `${Math.max(distance, 1) * 48}px`,
        }}
      />
    );
  };

  const renderOperationMarker = (
    qubit,
    column
  ) => {
    const operation = gates.find((item) => {
      if (!item) return false;

      if (isMultiGate(item.gate)) {
        return (
          item.column === column &&
          (item.control === qubit ||
            item.target === qubit)
        );
      }

      return (
        item.column === column &&
        item.qubit === qubit
      );
    });

    if (!operation) return null;

    const definition = getGateDefinition(
      operation.gate
    );

    const isControl =
      isMultiGate(operation.gate) &&
      operation.control === qubit;

    const isTarget =
      isMultiGate(operation.gate) &&
      operation.target === qubit;

    return (
      <>
        {isControl && (
          <span className="multi-gate-control">
            ●
          </span>
        )}

        {isTarget && (
          <span className="multi-gate-target">
            {normalizeGateName(operation.gate) ===
            "CNOT"
              ? "⊕"
              : normalizeGateName(
                    operation.gate
                  ) === "SWAP"
              ? "×"
              : "Z"}
          </span>
        )}

        {!isMultiGate(operation.gate) && (
          <span
            className="placed-gate"
            title={definition?.name || operation.gate}
          >
            {definition?.label || operation.gate}
          </span>
        )}

        {renderCnotLine(
          operation,
          qubit,
          column
        )}
      </>
    );
  };

  const resultCounts = useMemo(() => {
    if (!simulationResult) return null;

    return (
      simulationResult.counts ||
      simulationResult.measurements ||
      simulationResult.result?.counts ||
      null
    );
  }, [simulationResult]);

  const sortedCounts = useMemo(() => {
    if (!resultCounts || typeof resultCounts !== "object") {
      return [];
    }

    return Object.entries(resultCounts).sort(
      ([, a], [, b]) => Number(b) - Number(a)
    );
  }, [resultCounts]);

  return (
    <div className="circuit-simulator-page">
      <header className="simulator-header">
        <div className="simulator-header-left">
          <Link
            to="/dashboard"
            className="back-button"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={19} />
          </Link>

          <div>
            <div className="simulator-title-row">
              <Cpu size={20} />
              <h1>Circuit Simulator</h1>
            </div>

            <p>
              Build, simulate and understand quantum circuits
            </p>
          </div>
        </div>

        <div className="simulator-header-actions">
          <button
            type="button"
            className="header-reset-button"
            onClick={resetCircuit}
          >
            <RefreshCw size={16} />
            Reset
          </button>
        </div>
      </header>

      {preloadTitle ? (
        <div className="simulator-preload-banner">
          <Sparkles size={15} />
          <span>
            Loaded from lecture: <b>{preloadTitle}</b> — circuit preloaded and
            simulated with real shots.
          </span>
          <button
            type="button"
            className="header-reset-button"
            onClick={() => setPreloadTitle("")}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <main className="simulator-content">
        <section className="simulator-intro">
          <div className="intro-icon">
            <Zap size={20} />
          </div>

          <div>
            <h2>Interactive Quantum Circuit</h2>
            <p>
              Drag a gate from the library, drop it onto a
              qubit, then run the circuit to observe the
              measurement behaviour.
            </p>
          </div>
        </section>

        {error && (
          <div className="simulator-error">
            <AlertCircle size={18} />
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Close error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* LEFT — GATE LIBRARY */}
        <aside className="gate-library-card simulator-card">
          <div className="simulator-card-header">
            <div>
              <span className="eyebrow">TOOLS</span>
              <h3>Gate Library</h3>
            </div>

            <Code2 size={19} />
          </div>

          <p className="card-description">
            Select or drag a gate into the circuit.
          </p>

          <div className="gate-library">
            {GATES.map((gate) => (
              <button
                key={gate.id}
                type="button"
                draggable
                className={`gate-library-item ${
                  selectedGate === gate.id
                    ? "selected"
                    : ""
                } ${
                  gate.multi
                    ? "multi-gate-item"
                    : ""
                }`}
                onClick={() => {
                  setSelectedGate(
                    selectedGate === gate.id
                      ? null
                      : gate.id
                  );

                  setPendingControl(null);
                }}
                onDragStart={(event) =>
                  handleDragStart(event, gate)
                }
                onDragEnd={() => {
                  setDraggedGate(null);
                  setDragOver(null);
                }}
              >
                <span className="gate-symbol">
                  {gate.label}
                </span>

                <span className="gate-info">
                  <strong>{gate.name}</strong>
                  <small>{gate.description}</small>
                </span>

                {gate.multi && (
                  <GitBranch size={15} />
                )}
              </button>
            ))}
          </div>

          {pendingControl && (
            <div className="pending-gate-message">
              <Target size={16} />
              <span>
                Select the target qubit for{" "}
                <strong>
                  {pendingControl.gate}
                </strong>
                .
              </span>
            </div>
          )}

          <div className="gate-library-help">
            <CircleHelp size={16} />

            <div>
              <strong>Quick tip</strong>
              <p>
                For CX, CZ or SWAP, select the first
                qubit and then the second qubit in the
                same column.
              </p>
            </div>
          </div>
        </aside>

        {/* CENTER — CIRCUIT ONLY */}
        <section className="circuit-card simulator-card">
          <div className="simulator-card-header">
            <div>
              <span className="eyebrow">DESIGN</span>
              <h3>Circuit Simulation</h3>
            </div>

            <div className="circuit-header-status">
              <span>{qubits} qubits</span>
              <span>{columnCount} columns</span>
            </div>
          </div>

          <div className="circuit-toolbar">
            <div className="toolbar-group">
              <span className="toolbar-label">
                Qubits
              </span>

              <div className="stepper">
                <button
                  type="button"
                  onClick={removeQubit}
                  disabled={qubits <= 1}
                >
                  −
                </button>

                <span>{qubits}</span>

                <button
                  type="button"
                  onClick={addQubit}
                  disabled={qubits >= MAX_QUBITS}
                >
                  +
                </button>
              </div>
            </div>

            <div className="toolbar-group">
              <span className="toolbar-label">
                Columns
              </span>

              <div className="stepper">
                <button
                  type="button"
                  onClick={removeColumn}
                  disabled={columnCount <= 1}
                >
                  −
                </button>

                <span>{columnCount}</span>

                <button
                  type="button"
                  onClick={addColumn}
                  disabled={
                    columnCount >= MAX_COLUMNS
                  }
                >
                  +
                </button>
              </div>
            </div>

            <div className="toolbar-spacer" />

            <button
              type="button"
              className="clear-circuit-button"
              onClick={clearCircuit}
              disabled={!gates.length}
            >
              <Eraser size={16} />
              Clear
            </button>
          </div>

          <div className="circuit-scroll-area">
            <div
              className="circuit-grid"
              style={{
                gridTemplateColumns: `76px repeat(${columnCount}, minmax(58px, 1fr))`,
              }}
            >
              <div className="corner-cell">
                Qubit
              </div>

              {Array.from(
                { length: columnCount },
                (_, column) => (
                  <div
                    className="column-header"
                    key={`column-${column}`}
                  >
                    <span>
                      {column + 1}
                    </span>
                  </div>
                )
              )}

              {Array.from(
                { length: qubits },
                (_, qubit) => (
                  <React.Fragment key={`row-${qubit}`}>
                    <div className="qubit-label">
                      <span className="qubit-name">
                        q{qubit}
                      </span>
                      <span className="qubit-state">
                        |0⟩
                      </span>
                    </div>

                    {Array.from(
                      {
                        length: columnCount,
                      },
                      (_, column) => {
                        const isActive =
                          dragOver?.qubit ===
                            qubit &&
                          dragOver?.column ===
                            column;

                        return (
                          <button
                            key={`cell-${qubit}-${column}`}
                            type="button"
                            className={`circuit-cell ${
                              isActive
                                ? "drag-over"
                                : ""
                            } ${
                              selectedGate
                                ? "selectable"
                                : ""
                            }`}
                            onClick={() =>
                              handleCellClick(
                                qubit,
                                column
                              )
                            }
                            onDragOver={(event) =>
                              handleDragOver(
                                event,
                                qubit,
                                column
                              )
                            }
                            onDragLeave={
                              handleDragLeave
                            }
                            onDrop={(event) =>
                              handleDrop(
                                event,
                                qubit,
                                column
                              )
                            }
                          >
                            {renderOperationMarker(
                              qubit,
                              column
                            )}

                            {!gates.some(
                              (operation) => {
                                if (
                                  isMultiGate(
                                    operation.gate
                                  )
                                ) {
                                  return (
                                    operation.column ===
                                      column &&
                                    (operation.control ===
                                      qubit ||
                                      operation.target ===
                                        qubit)
                                  );
                                }

                                return (
                                  operation.column ===
                                    column &&
                                  operation.qubit ===
                                    qubit
                                );
                              }
                            ) && (
                              <span className="cell-plus">
                                +
                              </span>
                            )}
                          </button>
                        );
                      }
                    )}
                  </React.Fragment>
                )
              )}
            </div>
          </div>

          <div className="circuit-bottom-bar">
            <div className="circuit-selection-info">
              {selectedGate ? (
                <>
                  <Sparkles size={15} />
                  <span>
                    Selected:{" "}
                    <strong>{selectedGate}</strong>
                  </span>
                </>
              ) : (
                <>
                  <CircleHelp size={15} />
                  <span>
                    Select a gate or drag it into a cell.
                  </span>
                </>
              )}
            </div>

            <div className="gate-count">
              {gates.length} gate
              {gates.length === 1 ? "" : "s"}
            </div>
          </div>

          <div className="quantum-scene" aria-label="Live quantum circuit visualization">
            <div className="quantum-scene-header">
              <div>
                <span className="eyebrow">LIVE STATE VIEW</span>
                <h4>{simulationResult ? "Measured circuit state" : gates.length ? "Circuit state preview" : "Quantum field"}</h4>
              </div>
              <span className="scene-status">{simulationResult ? "SIMULATED" : gates.length ? "READY" : "WAITING"}</span>
            </div>
            <div className="quantum-scene-stage">
              <div className="scene-grid-lines" />
              <div className="scene-orbit scene-orbit-a" />
              <div className="scene-orbit scene-orbit-b" />
              <div className="scene-core">ψ</div>
              {Array.from({ length: Math.min(gates.length, 8) }, (_, index) => {
                const operation = gates[index];
                return (
                  <div
                    className="scene-particle"
                    key={operation.id || `${operation.gate}-${index}`}
                    style={{
                      "--particle-index": index,
                      left: `${29 + ((index * 17) % 43)}%`,
                      top: `${28 + ((index * 29) % 40)}%`,
                    }}
                    title={`${operation.gate} gate`}
                  >
                    <span>{normalizeGateName(operation.gate)}</span>
                  </div>
                );
              })}
              <div className="scene-circuit-trace">
                {Array.from({ length: Math.min(columnCount, 10) }, (_, index) => (
                  <i key={`trace-${index}`} className={index < Math.ceil(gates.length / Math.max(qubits, 1)) ? "lit" : ""} />
                ))}
              </div>
            </div>
            <div className="scene-metrics">
              <span><strong>{qubits}</strong> qubits</span>
              <span><strong>{gates.length}</strong> gates</span>
              <span><strong>{simulationResult ? Object.keys(resultCounts || {}).length : "—"}</strong> outcomes</span>
            </div>
          </div>
        </section>

        {/* CENTER — SIMULATION CONTROLS */}
        <section className="simulation-controls">
          <div className="simulation-control-info">
            <div className="simulation-control-icon">
              <Play size={17} />
            </div>

            <div>
              <strong>Run Quantum Simulation</strong>
              <span>
                Execute the current circuit and inspect
                measurement probabilities.
              </span>
            </div>
          </div>

          <button
            type="button"
            className="run-simulation-button"
            onClick={runCircuit}
            disabled={
              simulationLoading || !gates.length
            }
          >
            {simulationLoading ? (
              <>
                <Loader2
                  size={17}
                  className="spin"
                />
                Running...
              </>
            ) : (
              <>
                <Play size={17} />
                Run Circuit
              </>
            )}
          </button>
        </section>

        {/* CENTER — RESULT */}
        <section className="result-card simulator-card">
          <div className="simulator-card-header">
            <div>
              <span className="eyebrow">OUTPUT</span>
              <h3>Simulation Result</h3>
            </div>

            {simulationResult && (
              <button
                type="button"
                className="icon-button"
                onClick={() =>
                  setShowResultDetails(
                    (previous) => !previous
                  )
                }
              >
                {showResultDetails ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>
            )}
          </div>

          {!simulationResult ? (
            <div className="empty-result">
              <div className="empty-result-icon">
                <Gauge size={23} />
              </div>

              <h4>No simulation yet</h4>

              <p>
                Build your circuit and click{" "}
                <strong>Run Circuit</strong> to see
                measurement results here.
              </p>
            </div>
          ) : (
            showResultDetails && (
              <div className="result-content">
                <div className="result-summary">
                  <div className="result-summary-item">
                    <span>Algorithm</span>
                    <strong>
                      {simulationResult.algorithm ||
                        "Quantum Circuit"}
                    </strong>
                  </div>

                  <div className="result-summary-item">
                    <span>Qubits</span>
                    <strong>{qubits}</strong>
                  </div>

                  <div className="result-summary-item">
                    <span>Gates</span>
                    <strong>{gates.length}</strong>
                  </div>
                </div>

                {sortedCounts.length > 0 && (
                  <div className="measurement-section">
                    <div className="measurement-header">
                      <div>
                        <h4>Measurement Distribution</h4>
                        <p>
                          Observed states after simulation
                        </p>
                      </div>
                    </div>

                    <div className="measurement-list">
                      {sortedCounts.map(
                        ([state, count]) => {
                          const numericCount =
                            Number(count) || 0;

                          const total = sortedCounts.reduce(
                            (sum, [, value]) =>
                              sum +
                              (Number(value) || 0),
                            0
                          );

                          const percentage =
                            total > 0
                              ? (
                                  (numericCount /
                                    total) *
                                  100
                                ).toFixed(1)
                              : "0.0";

                          return (
                            <div
                              className="measurement-row"
                              key={state}
                            >
                              <span className="measurement-state">
                                |{state}⟩
                              </span>

                              <div className="measurement-bar-track">
                                <div
                                  className="measurement-bar"
                                  style={{
                                    width: `${Math.min(
                                      Number(
                                        percentage
                                      ),
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>

                              <span className="measurement-value">
                                {percentage}%
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

                <details className="raw-result-details">
                  <summary>
                    View raw simulation response
                  </summary>

                  <pre>
                    {JSON.stringify(
                      simulationResult,
                      null,
                      2
                    )}
                  </pre>
                </details>
              </div>
            )
          )}
        </section>

        {/* RIGHT — AI GUIDANCE */}
        <aside className="ai-guidance-column">
          {/* AI BUILDER */}
          <section className="ai-generator-card simulator-card">
            <div className="simulator-card-header">
              <div>
                <span className="eyebrow">
                  AI ASSISTANT
                </span>
                <h3>AI Circuit Builder</h3>
              </div>

              <div className="ai-header-icon">
                <Bot size={19} />
              </div>
            </div>

            <p className="card-description">
              Describe what you want to build and let the
              AI generate a circuit idea.
            </p>

            <textarea
              className="ai-prompt-input"
              value={prompt}
              onChange={(event) =>
                setPrompt(event.target.value)
              }
              placeholder="Example: Create a Bell state circuit using 2 qubits..."
              rows={4}
            />

            <button
              type="button"
              className="ai-primary-button"
              onClick={generateCircuit}
              disabled={aiLoading}
            >
              {aiLoading && aiMode === "generate" ? (
                <>
                  <Loader2
                    size={17}
                    className="spin"
                  />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 size={17} />
                  Generate Circuit
                </>
              )}
            </button>

            {aiResult && aiMode === "" && (
              <div className="ai-result-box">
                <div className="ai-result-title">
                  <Sparkles size={15} />
                  <span>AI Guidance</span>
                </div>

                <div className="ai-result-text">
                  <ReactMarkdown>
                    {aiResult}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </section>

          {/* LIVE AI */}
          <section className="circuit-status-panel simulator-card">
            <div className="status-panel-header">
              <div className="status-panel-title">
                <div className="status-icon live">
                  <Sparkles size={16} />
                </div>

                <div>
                  <span className="eyebrow">
                    LIVE
                  </span>
                  <h3>AI Guidance</h3>
                </div>
              </div>

              <span className="live-badge">
                Live
              </span>
            </div>

            <div className="live-ai-content">
              {liveAILoading ? (
                <div className="ai-loading-state">
                  <Loader2
                    size={18}
                    className="spin"
                  />

                  <span>
                    Analyzing your circuit...
                  </span>
                </div>
              ) : (
                <div className="live-ai-text">
                  <ReactMarkdown>
                    {liveAIResult ||
                      getLocalAIGuidance(
                        qubits,
                        gates
                      )}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </section>

          {/* VALIDATION */}
          <section className="circuit-status-panel simulator-card">
            <div className="status-panel-header">
              <div className="status-panel-title">
                <div className="status-icon validation">
                  <CheckCircle2 size={16} />
                </div>

                <div>
                  <span className="eyebrow">
                    CHECK
                  </span>
                  <h3>Structural Validation</h3>
                </div>
              </div>

              <span className="validation-count">
                {warnings.length}
              </span>
            </div>

            <div className="validation-list">
              {warnings.length === 0 ? (
                <div className="validation-empty">
                  <CheckCircle2 size={16} />

                  <span>
                    Circuit structure looks good.
                  </span>
                </div>
              ) : (
                warnings.map(
                  (warning, index) => (
                    <div
                      className={`validation-item ${warning.type}`}
                      key={`${warning.message}-${index}`}
                    >
                      {warning.type === "error" ? (
                        <AlertCircle size={15} />
                      ) : warning.type ===
                        "warning" ? (
                        <CircleHelp size={15} />
                      ) : (
                        <CheckCircle2 size={15} />
                      )}

                      <span>
                        {warning.message}
                      </span>
                    </div>
                  )
                )
              )}
            </div>
          </section>

          {/* AI ACTIONS */}
          <section className="ai-actions-card simulator-card">
            <div className="simulator-card-header">
              <div>
                <span className="eyebrow">
                  AI TOOLS
                </span>
                <h3>AI Actions</h3>
              </div>

              <Lightbulb size={18} />
            </div>

            <div className="ai-actions-grid">
              <button
                type="button"
                className="ai-action-button"
                onClick={explainCircuit}
                disabled={aiLoading || !gates.length}
              >
                {aiLoading &&
                aiMode === "explain" ? (
                  <Loader2
                    size={16}
                    className="spin"
                  />
                ) : (
                  <CircleHelp size={16} />
                )}

                <span>Explain</span>
              </button>

              <button
                type="button"
                className="ai-action-button"
                onClick={predictResult}
                disabled={aiLoading || !gates.length}
              >
                {aiLoading &&
                aiMode === "predict" ? (
                  <Loader2
                    size={16}
                    className="spin"
                  />
                ) : (
                  <Target size={16} />
                )}

                <span>Predict</span>
              </button>

              <button
                type="button"
                className="ai-action-button"
                onClick={optimizeCircuit}
                disabled={aiLoading || !gates.length}
              >
                {aiLoading &&
                aiMode === "optimize" ? (
                  <Loader2
                    size={16}
                    className="spin"
                  />
                ) : (
                  <Zap size={16} />
                )}

                <span>Optimize</span>
              </button>

              <button
                type="button"
                className="ai-action-button"
                onClick={debugCircuit}
                disabled={aiLoading || !gates.length}
              >
                {aiLoading &&
                aiMode === "debug" ? (
                  <Loader2
                    size={16}
                    className="spin"
                  />
                ) : (
                  <Code2 size={16} />
                )}

                <span>Debug</span>
              </button>
            </div>

            {aiResult && (
              <div className="ai-action-result">
                <div className="ai-result-title">
                  <Sparkles size={15} />
                  <span>AI Response</span>
                </div>

                <div className="ai-result-text">
                  <ReactMarkdown>
                    {aiResult}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </section>
        </aside>
      </main>

      <BottomNavigation />
    </div>
  );
}

export default CircuitSimulator;