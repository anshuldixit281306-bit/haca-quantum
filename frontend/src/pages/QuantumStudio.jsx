import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as THREE from "three";
import {
  ArrowRight,
  Check,
  RotateCcw,
  Sparkles,
  Trophy,
  Zap,
  Shuffle,
  Dices,
  Info,
  Trash2,
} from "lucide-react";
import "./QuantumStudio.css";

/* ================================================================== */
/* 2D Static Concept Presets                                          */
/* ================================================================== */
const concepts = {
  superposition: {
    label: "Superposition",
    eyebrow: "ONE QUBIT",
    description: "A qubit can hold a weighted combination of |0⟩ and |1⟩ until measurement.",
    hint: "Drag the state angle. At 90°, both outcomes are equally likely.",
    color: "#756be8",
  },
  entanglement: {
    label: "Entanglement",
    eyebrow: "TWO QUBITS",
    description: "Entangled qubits share one state: measuring one tells you about the other.",
    hint: "The Bell state produces matching results, even though each result is random.",
    color: "#0f7c79",
  },
  measurement: {
    label: "Measurement",
    eyebrow: "OBSERVE",
    description: "Measurement turns amplitudes into a classical outcome and collapses the state.",
    hint: "Run the measurement several times to see probability become a distribution.",
    color: "#d97745",
  },
};

/* ================================================================== */
/* 3D Three.js Complex Math & Gates Helpers                          */
/* ================================================================== */
const C = (re = 0, im = 0) => ({ re, im });
const cAdd = (a, b) => C(a.re + b.re, a.im + b.im);
const cMul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const cScale = (a, s) => C(a.re * s, a.im * s);
const cAbs2 = (a) => a.re * a.re + a.im * a.im;
const cExp = (theta) => C(Math.cos(theta), Math.sin(theta));

function applyMat2(m, v) {
  const c0 = cAdd(cMul(m[0][0], v[0]), cMul(m[0][1], v[1]));
  const c1 = cAdd(cMul(m[1][0], v[0]), cMul(m[1][1], v[1]));
  return normalizeVec([c0, c1]);
}
function normalizeVec(v) {
  const n = Math.sqrt(v.reduce((s, a) => s + cAbs2(a), 0)) || 1;
  return v.map((a) => cScale(a, 1 / n));
}
function fmt(a) {
  const re = Math.abs(a.re) < 0.0005 ? 0 : a.re;
  const im = Math.abs(a.im) < 0.0005 ? 0 : a.im;
  if (im === 0) return re.toFixed(3);
  const sign = im < 0 ? "-" : "+";
  return `${re.toFixed(3)} ${sign} ${Math.abs(im).toFixed(3)}i`;
}

const SQ = 1 / Math.sqrt(2);
const GATES = {
  X: { m: [[C(0), C(1)], [C(1), C(0)]], desc: "Pauli-X — bit flip, the quantum NOT gate" },
  Y: { m: [[C(0), C(0, -1)], [C(0, 1), C(0)]], desc: "Pauli-Y — bit flip + phase flip together" },
  Z: { m: [[C(1), C(0)], [C(0), C(-1)]], desc: "Pauli-Z — flips the phase of |1⟩" },
  H: { m: [[C(SQ), C(SQ)], [C(SQ), C(-SQ)]], desc: "Hadamard — creates an equal superposition" },
  S: { m: [[C(1), C(0)], [C(0), C(0, 1)]], desc: "S — quarter-turn phase gate" },
  Sdg: { m: [[C(1), C(0)], [C(0), C(0, -1)]], desc: "S† — inverse of the S gate" },
  T: { m: [[C(1), C(0)], [C(0), cExp(Math.PI / 4)]], desc: "T — eighth-turn phase gate" },
  Tdg: { m: [[C(1), C(0)], [C(0), cExp(-Math.PI / 4)]], desc: "T† — inverse of the T gate" },
};
function Rx(t) { const c = Math.cos(t / 2), s = Math.sin(t / 2); return [[C(c), C(0, -s)], [C(0, -s), C(c)]]; }
function Ry(t) { const c = Math.cos(t / 2), s = Math.sin(t / 2); return [[C(c), C(-s)], [C(s), C(c)]]; }
function Rz(t) { return [[cExp(-t / 2), C(0)], [C(0), cExp(t / 2)]]; }

const PRESETS = {
  "0": [C(1), C(0)], "1": [C(0), C(1)],
  "+": [C(SQ), C(SQ)], "-": [C(SQ), C(-SQ)],
  "i": [C(SQ), C(0, SQ)], "-i": [C(SQ), C(0, -SQ)],
};

function blochVector(v) {
  const [a, b] = v;
  return {
    x: 2 * (a.re * b.re + a.im * b.im),
    y: 2 * (a.re * b.im - a.im * b.re),
    z: cAbs2(a) - cAbs2(b),
  };
}

function quditShift(state, d) { const out = new Array(d); for (let j = 0; j < d; j++) out[j] = state[(j - 1 + d) % d]; return out; }
function quditClock(state, d) { return state.map((amp, k) => cMul(amp, cExp((2 * Math.PI * k) / d))); }
function quditQFT(state, d) {
  const out = new Array(d).fill(0).map(() => C(0, 0));
  for (let k = 0; k < d; k++) {
    let sum = C(0, 0);
    for (let j = 0; j < d; j++) sum = cAdd(sum, cMul(state[j], cExp((2 * Math.PI * j * k) / d)));
    out[k] = cScale(sum, 1 / Math.sqrt(d));
  }
  return out;
}
function quditBasis(d, k) { const s = new Array(d).fill(0).map(() => C(0, 0)); s[k] = C(1, 0); return s; }

const R_SPHERE = 2, RING = 2.6, BARH = 3, MAXDIM = 8;
const COL_CYAN = 0x5fd8e0, COL_AMBER = 0xe8a457, COL_VIOLET = 0xb58cff, COL_GRID = 0x2a3550, COL_FIELD = 0x8fb3ff;
const AXIS_VEC = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 0, 1), z: new THREE.Vector3(0, 1, 0) };

function makeLabel(text, colorCss) {
  const canvas = document.createElement("canvas");
  canvas.width = 128; canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.font = "600 36px sans-serif";
  ctx.fillStyle = colorCss; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(text, 64, 32);
  const tex = new THREE.CanvasTexture(canvas); tex.needsUpdate = true;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sprite.scale.set(1.1, 0.55, 1);
  return sprite;
}
function circlePoints(plane, radius, segs = 64) {
  const pts = [];
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2, c = Math.cos(a) * radius, s = Math.sin(a) * radius;
    if (plane === "xz") pts.push(new THREE.Vector3(c, 0, s));
    if (plane === "xy") pts.push(new THREE.Vector3(c, s, 0));
    if (plane === "yz") pts.push(new THREE.Vector3(0, c, s));
  }
  return pts;
}
function fibonacciSphere(n) {
  const pts = [];
  const offset = 2 / n, increment = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = i * offset - 1 + offset / 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const phi = i * increment;
    pts.push(new THREE.Vector3(Math.cos(phi) * r, y, Math.sin(phi) * r));
  }
  return pts;
}

const BELL_STATES = {
  phiPlus: { label: "Φ+", eq: "(|00⟩ + |11⟩) / √2", corr: "same" },
  phiMinus: { label: "Φ-", eq: "(|00⟩ − |11⟩) / √2", corr: "same" },
  psiPlus: { label: "Ψ+", eq: "(|01⟩ + |10⟩) / √2", corr: "opposite" },
  psiMinus: { label: "Ψ-", eq: "(|01⟩ − |10⟩) / √2", corr: "opposite" },
};

const TELE_STEPS = [
  { title: "Shared entanglement", text: "Alice and Bob each hold one half of an entangled pair, prepared in advance and never touched again as a pair." },
  { title: "Alice links her qubit", text: "Alice applies a CNOT then a Hadamard between the unknown state |ψ⟩ and her half of the pair, entangling all three qubits." },
  { title: "Alice measures", text: "Alice measures both qubits she holds. This destroys the original |ψ⟩ and yields two random classical bits." },
  { title: "Bits travel classically", text: "Alice sends her two classical bits to Bob over an ordinary channel — this step cannot happen faster than light." },
  { title: "Bob corrects his qubit", text: "Bob applies X and/or Z to his qubit based on the bits received. His qubit is now exactly |ψ⟩ — teleportation complete." },
];

/* ================================================================== */
export default function QuantumStudio() {
  /* Top 2D Concept Sandbox State */
  const [active, setActive] = useState("superposition");
  const [angle, setAngle] = useState(45);
  const [measured, setMeasured] = useState(null);
  const [xp, setXp] = useState(() => Number(localStorage.getItem("quantumlearn_xp") || 140));
  const concept = concepts[active];
  const probabilityZero = useMemo(() => Math.round(Math.cos((angle * Math.PI) / 180) ** 2 * 100), [angle]);

  const grantXp = useCallback((amount = 15) => {
    setXp((prev) => {
      const next = prev + amount;
      localStorage.setItem("quantumlearn_xp", String(next));
      return next;
    });
  }, []);

  const completeExperiment = () => {
    grantXp(25);
    setMeasured(probabilityZero > 50 ? 0 : 1);
  };

  /* 3D Three.js Simulation State */
  const mountRef = useRef(null);
  const three = useRef({});
  const [mode, setMode] = useState("qubit");
  const [dim, setDim] = useState(3);
  const [qubit, setQubit] = useState(PRESETS["0"]);
  const [qudit, setQudit] = useState(quditBasis(3, 0));
  const [measurement, setMeasurement] = useState(null);
  const [rotAxis, setRotAxis] = useState("y");
  const [rotAngle, setRotAngle] = useState(90);
  const [showField, setShowField] = useState(true);
  const [history, setHistory] = useState([]);
  const [bellState, setBellState] = useState("phiPlus");
  const [entResult, setEntResult] = useState(null);
  const [entPulse, setEntPulse] = useState(0);
  const [teleStep, setTeleStep] = useState(0);
  const [teleBits, setTeleBits] = useState(null);
  const [teleInput, setTeleInput] = useState("+");

  /* Setup Three.js once */
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const width = mount.clientWidth || 600, height = mount.clientHeight || 450;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const spherical = { radius: 7, az: 0.9, polar: 1.15 };
    function updateCamera() {
      const { radius, az, polar } = spherical;
      camera.position.set(radius * Math.sin(polar) * Math.cos(az), radius * Math.cos(polar), radius * Math.sin(polar) * Math.sin(az));
      camera.lookAt(0, 0, 0);
    }
    updateCamera();

    const qubitGroup = new THREE.Group();
    const sphereMat = new THREE.MeshBasicMaterial({ color: COL_GRID, wireframe: true, transparent: true, opacity: 0.35 });
    qubitGroup.add(new THREE.Mesh(new THREE.SphereGeometry(R_SPHERE, 24, 16), sphereMat));
    qubitGroup.add(new THREE.Mesh(new THREE.SphereGeometry(R_SPHERE * 0.995, 24, 16), new THREE.MeshBasicMaterial({ color: 0x142033, transparent: true, opacity: 0.12 })));

    const lineMat = new THREE.LineBasicMaterial({ color: 0x3a4666, transparent: true, opacity: 0.55 });
    ["xz", "xy", "yz"].forEach((plane) => qubitGroup.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(circlePoints(plane, R_SPHERE)), lineMat)));

    function axisLine(dir, color) {
      const pts = [dir.clone().multiplyScalar(-R_SPHERE * 1.35), dir.clone().multiplyScalar(R_SPHERE * 1.35)];
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 }));
    }
    qubitGroup.add(axisLine(new THREE.Vector3(1, 0, 0), COL_AMBER));
    qubitGroup.add(axisLine(new THREE.Vector3(0, 1, 0), COL_CYAN));
    qubitGroup.add(axisLine(new THREE.Vector3(0, 0, 1), COL_VIOLET));

    const labels = [
      [makeLabel("|0>", "#5fd8e0"), [0, R_SPHERE * 1.55, 0]], [makeLabel("|1>", "#5fd8e0"), [0, -R_SPHERE * 1.55, 0]],
      [makeLabel("|+>", "#e8a457"), [R_SPHERE * 1.55, 0, 0]], [makeLabel("|->", "#e8a457"), [-R_SPHERE * 1.55, 0, 0]],
      [makeLabel("|i>", "#b58cff"), [0, 0, R_SPHERE * 1.55]], [makeLabel("|-i>", "#b58cff"), [0, 0, -R_SPHERE * 1.55]],
    ];
    labels.forEach(([s, p]) => { s.position.set(...p); qubitGroup.add(s); });

    const arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), R_SPHERE, 0xffffff, 0.35, 0.2);
    qubitGroup.add(arrow);

    const fieldGroup = new THREE.Group();
    const fieldArrows = fibonacciSphere(42).map((unit) => {
      const pos = unit.clone().multiplyScalar(R_SPHERE * 1.3);
      const helper = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), pos, 0.42, COL_FIELD, 0.14, 0.075);
      helper.line.material.transparent = true; helper.cone.material.transparent = true;
      helper.line.material.opacity = 0.4; helper.cone.material.opacity = 0.4;
      fieldGroup.add(helper);
      return { helper, unit, phase: Math.random() * Math.PI * 2 };
    });
    qubitGroup.add(fieldGroup);
    scene.add(qubitGroup);

    const quditGroup = new THREE.Group();
    quditGroup.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(circlePoints("xz", RING)), new THREE.LineBasicMaterial({ color: 0x3a4666, transparent: true, opacity: 0.6 })));
    const bars = [], barLabels = [];
    for (let k = 0; k < MAXDIM; k++) {
      const geo = new THREE.CylinderGeometry(0.16, 0.2, 1, 16); geo.translate(0, 0.5, 0);
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x5fd8e0 }));
      quditGroup.add(mesh); bars.push(mesh);
      const lbl = makeLabel(`|${k}>`, "#c7d2e6"); quditGroup.add(lbl); barLabels.push(lbl);
    }
    quditGroup.visible = false;
    scene.add(quditGroup);

    let dragging = false, lastX = 0, lastY = 0;
    const dom = renderer.domElement;
    const onDown = (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; dom.setPointerCapture(e.pointerId); };
    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY;
      spherical.az -= dx * 0.0065;
      spherical.polar = Math.min(Math.PI - 0.15, Math.max(0.15, spherical.polar - dy * 0.0065));
    };
    const onUp = (e) => { dragging = false; try { dom.releasePointerCapture(e.pointerId); } catch (err) {} };
    const onWheel = (e) => { e.preventDefault(); spherical.radius = Math.min(13, Math.max(3.5, spherical.radius * (1 + e.deltaY * 0.0015))); };
    dom.addEventListener("pointerdown", onDown);
    dom.addEventListener("pointermove", onMove);
    dom.addEventListener("pointerup", onUp);
    dom.addEventListener("pointerleave", onUp);
    dom.addEventListener("wheel", onWheel, { passive: false });

    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    });
    ro.observe(mount);

    three.current = {
      scene, camera, renderer, spherical, updateCamera, qubitGroup, quditGroup, arrow,
      targetBloch: new THREE.Vector3(0, R_SPHERE, 0), currentBloch: new THREE.Vector3(0, R_SPHERE, 0),
      bars, barLabels,
      quditTargets: Array.from({ length: MAXDIM }, () => ({ height: 0, phase: 0, visible: false })),
      quditCurrent: Array.from({ length: MAXDIM }, () => 0),
      fieldGroup, fieldArrows, showField: true, raf: null,
    };

    let running = true, clock = new THREE.Clock();
    function tick() {
      if (!running) return;
      const t = three.current;
      if (!t.updateCamera) return;
      const time = clock.getElapsedTime();
      t.updateCamera();
      t.currentBloch.lerp(t.targetBloch, 0.14);
      if (t.currentBloch.length() > 0.0005) {
        const dir = t.currentBloch.clone().normalize();
        t.arrow.setDirection(dir);
        t.arrow.setLength(Math.max(t.currentBloch.length(), 0.001), 0.35, 0.2);
      }
      t.fieldGroup.visible = t.showField;
      if (t.showField) {
        t.fieldArrows.forEach(({ helper, phase }) => {
          const op = 0.18 + 0.28 * (0.5 + 0.5 * Math.sin(time * 1.6 - phase));
          helper.line.material.opacity = op; helper.cone.material.opacity = op;
        });
      }
      for (let k = 0; k < MAXDIM; k++) {
        const target = t.quditTargets[k];
        t.quditCurrent[k] += (target.height - t.quditCurrent[k]) * 0.16;
        const h = Math.max(t.quditCurrent[k], 0.0005);
        const mesh = t.bars[k];
        mesh.scale.y = h;
        mesh.visible = target.visible || h > 0.01;
        t.barLabels[k].visible = target.visible;
        const col = new THREE.Color();
        col.setHSL((((target.phase / (2 * Math.PI)) % 1) + 1) % 1, 0.6, 0.58);
        mesh.material.color.lerp(col, 0.15);
      }
      t.renderer.render(t.scene, t.camera);
      t.raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      running = false;
      cancelAnimationFrame(three.current.raf);
      ro.disconnect();
      dom.removeEventListener("pointerdown", onDown);
      dom.removeEventListener("pointermove", onMove);
      dom.removeEventListener("pointerup", onUp);
      dom.removeEventListener("pointerleave", onUp);
      dom.removeEventListener("wheel", onWheel);
      renderer.dispose();
      if (mount.contains(dom)) mount.removeChild(dom);
    };
  }, []);

  useEffect(() => { const t = three.current; if (!t.qubitGroup) return; t.qubitGroup.visible = mode === "qubit"; t.quditGroup.visible = mode === "qudit"; }, [mode]);
  useEffect(() => { const t = three.current; if (t.targetBloch) { const { x, y, z } = blochVector(qubit); t.targetBloch.set(R_SPHERE * x, R_SPHERE * z, R_SPHERE * y); } }, [qubit]);
  useEffect(() => { const t = three.current; if (t) t.showField = showField; }, [showField]);
  useEffect(() => {
    const t = three.current;
    if (!t.fieldArrows) return;
    const axisVec = AXIS_VEC[rotAxis];
    t.fieldArrows.forEach(({ helper, unit }) => {
      const tangent = new THREE.Vector3().crossVectors(axisVec, unit);
      if (tangent.lengthSq() < 1e-5) { helper.visible = false; return; }
      helper.visible = true; helper.setDirection(tangent.normalize());
    });
  }, [rotAxis]);
  useEffect(() => {
    const t = three.current;
    if (!t.quditTargets) return;
    for (let k = 0; k < MAXDIM; k++) {
      if (k < dim) {
        const amp = qudit[k] || C(0, 0);
        t.quditTargets[k] = { height: cAbs2(amp) * BARH, phase: Math.atan2(amp.im, amp.re), visible: true };
        const a = (2 * Math.PI * k) / dim;
        t.bars[k].position.set(RING * Math.cos(a), 0, RING * Math.sin(a));
        t.barLabels[k].position.set((RING + 0.6) * Math.cos(a), BARH + 0.35, (RING + 0.6) * Math.sin(a));
      } else t.quditTargets[k] = { height: 0, phase: 0, visible: false };
    }
  }, [qudit, dim]);

  const applyGate = useCallback((key) => {
    setMeasurement(null);
    setQubit((s) => applyMat2(GATES[key].m, s));
    setHistory((h) => [...h.slice(-11), key]);
    grantXp(5);
  }, [grantXp]);
  const applyPreset = useCallback((key) => { setMeasurement(null); setQubit(PRESETS[key]); setHistory((h) => [...h.slice(-11), `|${key}⟩`]); }, []);
  const applyRotation = useCallback(() => {
    const rad = (rotAngle * Math.PI) / 180;
    const m = rotAxis === "x" ? Rx(rad) : rotAxis === "y" ? Ry(rad) : Rz(rad);
    setMeasurement(null); setQubit((s) => applyMat2(m, s));
    setHistory((h) => [...h.slice(-11), `R${rotAxis}(${rotAngle}°)`]);
    grantXp(5);
  }, [rotAngle, rotAxis, grantXp]);
  const measureQubit = useCallback(() => {
    setQubit((s) => {
      const result = Math.random() < cAbs2(s[0]) ? 0 : 1;
      setMeasurement(result); setHistory((h) => [...h.slice(-11), `M→${result}`]);
      grantXp(10);
      return PRESETS[result === 0 ? "0" : "1"];
    });
  }, [grantXp]);
  const resetQubit = useCallback(() => { setMeasurement(null); setQubit(PRESETS["0"]); setHistory([]); }, []);

  const applyQuditGate = useCallback((type) => {
    setMeasurement(null);
    setQudit((s) => {
      const full = s.slice(0, dim);
      if (type === "shift") return quditShift(full, dim);
      if (type === "clock") return quditClock(full, dim);
      if (type === "qft") return quditQFT(full, dim);
      return full;
    });
    grantXp(5);
  }, [dim, grantXp]);
  const randomQudit = useCallback(() => { setMeasurement(null); setQudit(normalizeVec(Array.from({ length: dim }, () => C(Math.random() * 2 - 1, Math.random() * 2 - 1)))); }, [dim]);
  const measureQudit = useCallback(() => {
    setQudit((s) => {
      const full = s.slice(0, dim), probs = full.map(cAbs2);
      let r = Math.random(), acc = 0, result = dim - 1;
      for (let k = 0; k < dim; k++) { acc += probs[k]; if (r <= acc) { result = k; break; } }
      setMeasurement(result);
      grantXp(10);
      return quditBasis(dim, result);
    });
  }, [dim, grantXp]);
  const resetQudit = useCallback(() => { setMeasurement(null); setQudit(quditBasis(dim, 0)); }, [dim]);
  const changeDim = useCallback((d) => { setDim(d); setMeasurement(null); setQudit(quditBasis(d, 0)); }, []);

  const measureBell = useCallback(() => {
    const a = Math.random() < 0.5 ? 0 : 1;
    const b = BELL_STATES[bellState].corr === "same" ? a : 1 - a;
    setEntPulse((p) => p + 1);
    setTimeout(() => {
      setEntResult({ a, b });
      grantXp(15);
    }, 420);
  }, [bellState, grantXp]);
  const resetBell = useCallback((key = bellState) => { setBellState(key); setEntResult(null); }, [bellState]);

  const teleNext = useCallback(() => {
    setTeleStep((s) => {
      const next = Math.min(TELE_STEPS.length - 1, s + 1);
      if (s === 1 && next === 2) setTeleBits({ m1: Math.round(Math.random()), m2: Math.round(Math.random()) });
      if (next === 4) grantXp(25);
      return next;
    });
  }, [grantXp]);
  const teleReset = useCallback(() => { setTeleStep(0); setTeleBits(null); }, []);

  const bloch = blochVector(qubit);
  const theta = (Math.acos(Math.max(-1, Math.min(1, bloch.z))) * 180) / Math.PI;
  const phi = ((Math.atan2(bloch.y, bloch.x) * 180) / Math.PI + 360) % 360;
  const p0 = cAbs2(qubit[0]) * 100, p1 = cAbs2(qubit[1]) * 100;

  return (
    <div className="studio-page">
      {/* ============================================================ */}
      {/* TOP SECTION: Original 2D Interactive Concept Sandbox          */}
      {/* ============================================================ */}
      <div className="studio-hero">
        <div>
          <p className="studio-kicker">
            <Sparkles size={15} /> Quantum Studio / interactive concepts
          </p>
          <h1>
            See the state<br />
            <em>change.</em>
          </h1>
          <p>
            Build intuition for the ideas that make quantum computing different.
            No black boxes, just controls, state vectors, and measurable outcomes.
          </p>
        </div>
        <div className="studio-level">
          <Trophy size={17} />
          <span>
            <strong>{xp} XP</strong> Explorer level 2
          </span>
          <div>
            <i style={{ width: `${Math.min(((xp % 250) / 250) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="studio-tabs">
        {Object.entries(concepts).map(([id, item]) => (
          <button
            type="button"
            className={active === id ? "active" : ""}
            key={id}
            onClick={() => {
              setActive(id);
              setMeasured(null);
            }}
          >
            <span>
              {id === "superposition" ? "01" : id === "entanglement" ? "02" : "03"}
            </span>
            {item.label}
          </button>
        ))}
      </div>

      <section className="studio-card">
        <div className="studio-explanation">
          <p className="studio-kicker">{concept.eyebrow}</p>
          <h2>{concept.label}</h2>
          <p>{concept.description}</p>
          <div className="studio-hint">
            <Zap size={16} /> {concept.hint}
          </div>
          <button type="button" className="studio-action" onClick={completeExperiment}>
            {measured === null ? "Run experiment" : "Experiment complete"} <ArrowRight size={16} />
          </button>
          {measured !== null && (
            <span className="studio-success">
              <Check size={15} /> +25 XP earned · measured |{measured}⟩
            </span>
          )}
        </div>

        <div className="state-visual" style={{ "--accent": concept.color }}>
          <div className="state-orbit">
            <div className="state-vector" style={{ transform: `rotate(${angle - 45}deg)` }} />
            <span className="state-node node-top">|0⟩</span>
            <span className="state-node node-bottom">|1⟩</span>
            <div className="state-center">ψ</div>
          </div>

          {active === "superposition" ? (
            <label className="angle-control">
              State angle <strong>{angle}°</strong>
              <input
                type="range"
                min="0"
                max="90"
                value={angle}
                onChange={(event) => {
                  setAngle(Number(event.target.value));
                  setMeasured(null);
                }}
              />
            </label>
          ) : (
            <div className="probability-readout">
              <span>Probability distribution</span>
              <strong>
                {active === "entanglement"
                  ? "50% · 50%"
                  : measured === null
                  ? "Ready to measure"
                  : `100% · 0%`}
              </strong>
              <div>
                <i style={{ width: active === "entanglement" ? "50%" : measured === null ? "50%" : "100%" }} />
                <i style={{ width: active === "entanglement" ? "50%" : measured === null ? "50%" : "0%" }} />
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="studio-footer">
        <button
          type="button"
          onClick={() => {
            setAngle(45);
            setMeasured(null);
          }}
        >
          <RotateCcw size={15} /> Reset experiment
        </button>
        <span>Complete all experiments to earn your Quantum Explorer badge.</span>
      </div>

      {/* ============================================================ */}
      {/* BOTTOM SECTION: 3D Quantum Lab (Bloch sphere, qudits, etc.)    */}
      {/* ============================================================ */}
      <section className="quantum-lab-3d-wrapper">
        <div className="lab-3d-header">
          <div>
            <span className="studio-kicker"><Sparkles size={14} /> 3D QUANTUM LAB</span>
            <h2 className="lab-3d-title">3D State Vector, Entanglement & Teleportation</h2>
            <p className="lab-3d-sub">
              Drag to rotate the Bloch sphere, test single and multi-qudit gates, and step through quantum teleportation.
            </p>
          </div>
          <div className="qs-seg">
            {[["qubit", "Qubit"], ["qudit", "Qudit"], ["entangle", "Entangle"], ["teleport", "Teleport"]].map(([k, label]) => (
              <button key={k} className={mode === k ? "active" : ""} onClick={() => setMode(k)}>{label}</button>
            ))}
          </div>
        </div>

        <div className="lab-3d-container">
          <div className="lab-3d-viewport" ref={mountRef}>
            {(mode === "qubit" || mode === "qudit") && (
              <>
                <div className="lab-3d-hint">drag to orbit · scroll to zoom</div>
                {measurement !== null && <div className="lab-3d-measure-badge">measured → |{measurement}⟩</div>}
              </>
            )}

            {mode === "entangle" && (
              <div className="lab-3d-overlay">
                <div className="lab-bell-eq">|{BELL_STATES[bellState].label}⟩ = {BELL_STATES[bellState].eq}</div>
                <div className="lab-ent-row">
                  <div className="lab-ent-col">
                    <div className={"qs-orb " + (entResult ? (entResult.a === 0 ? "zero" : "one") : "pending")}>
                      {entResult ? `|${entResult.a}⟩` : "?"}
                    </div>
                    <div className="lab-ent-name">Alice</div>
                  </div>
                  <div style={{ flex: 1, padding: "0 18px" }}>
                    <div className={"qs-link" + (entPulse && !entResult ? " pulse" : "")} />
                  </div>
                  <div className="lab-ent-col">
                    <div className={"qs-orb " + (entResult ? (entResult.b === 0 ? "zero" : "one") : "pending")}>
                      {entResult ? `|${entResult.b}⟩` : "?"}
                    </div>
                    <div className="lab-ent-name">Bob</div>
                  </div>
                </div>
                <div className="lab-ent-note">
                  {entResult
                    ? `Alice measured |${entResult.a}⟩, and Bob's qubit was ${BELL_STATES[bellState].corr === "same" ? "instantly the same" : "instantly the opposite"} — every time, for this Bell state.`
                    : "Both qubits are in one shared superposition — neither has a definite value on its own yet. Press Measure to collapse them."}
                </div>
              </div>
            )}

            {mode === "teleport" && (
              <div className="lab-3d-overlay">
                <svg viewBox="0 0 640 210" style={{ width: "100%", maxWidth: 620 }}>
                  <line x1="40" y1="40" x2="600" y2="40" className={"qs-tele-wire" + (teleStep <= 2 ? " qs-tele-wire-active" : "")} />
                  <line x1="40" y1="105" x2="600" y2="105" className={"qs-tele-wire" + (teleStep <= 2 ? " qs-tele-wire-active" : "")} />
                  <line x1="40" y1="170" x2="600" y2="170" className={"qs-tele-wire" + (teleStep >= 4 ? " qs-tele-wire-active" : "")} />
                  <text x="14" y="44" className="qs-tele-label">ψ</text>
                  <text x="14" y="109" className="qs-tele-label">A</text>
                  <text x="14" y="174" className="qs-tele-label">B</text>

                  <rect x="80" y="90" width="30" height="30" rx="5" className={"qs-tele-gate" + (teleStep === 0 ? " qs-tele-gate-active" : "")} />
                  <text x="95" y="110" textAnchor="middle" className="qs-tele-text">H</text>
                  <line x1="130" y1="105" x2="130" y2="170" className={teleStep === 0 ? "qs-tele-wire-active" : "qs-tele-wire"} strokeWidth="2" />
                  <circle cx="130" cy="105" r="5" fill={teleStep === 0 ? "#5fd8e0" : "#41537f"} />
                  <circle cx="130" cy="170" r="9" fill="none" stroke={teleStep === 0 ? "#5fd8e0" : "#41537f"} strokeWidth="2" />

                  <line x1="220" y1="40" x2="220" y2="105" className={teleStep === 1 ? "qs-tele-wire-active" : "qs-tele-wire"} strokeWidth="2" />
                  <circle cx="220" cy="40" r="5" fill={teleStep === 1 ? "#5fd8e0" : "#41537f"} />
                  <circle cx="220" cy="105" r="9" fill="none" stroke={teleStep === 1 ? "#5fd8e0" : "#41537f"} strokeWidth="2" />
                  <rect x="265" y="25" width="30" height="30" rx="5" className={"qs-tele-gate" + (teleStep === 1 ? " qs-tele-gate-active" : "")} />
                  <text x="280" y="45" textAnchor="middle" className="qs-tele-text">H</text>

                  <rect x="335" y="25" width="34" height="30" rx="5" className={"qs-tele-gate" + (teleStep === 2 ? " qs-tele-gate-active" : "")} />
                  <text x="352" y="46" textAnchor="middle" className="qs-tele-text">M</text>
                  <rect x="335" y="90" width="34" height="30" rx="5" className={"qs-tele-gate" + (teleStep === 2 ? " qs-tele-gate-active" : "")} />
                  <text x="352" y="111" textAnchor="middle" className="qs-tele-text">M</text>

                  <path d="M 352 55 L 352 155 L 430 155 L 430 170" fill="none" className={teleStep === 3 ? "qs-tele-wire-active" : "qs-tele-wire"} strokeDasharray="4 4" strokeWidth="2" />
                  <path d="M 352 120 L 352 155 L 500 155 L 500 170" fill="none" className={teleStep === 3 ? "qs-tele-wire-active" : "qs-tele-wire"} strokeDasharray="4 4" strokeWidth="2" />
                  {teleBits && <text x="470" y="150" textAnchor="middle" className="qs-tele-label">bits: {teleBits.m1}{teleBits.m2}</text>}

                  <rect x="415" y="155" width="30" height="30" rx="5" className={"qs-tele-gate" + (teleStep === 4 ? " qs-tele-gate-active" : "")} />
                  <text x="430" y="175" textAnchor="middle" className="qs-tele-text">X</text>
                  <rect x="485" y="155" width="30" height="30" rx="5" className={"qs-tele-gate" + (teleStep === 4 ? " qs-tele-gate-active" : "")} />
                  <text x="500" y="175" textAnchor="middle" className="qs-tele-text">Z</text>

                  <text x="600" y="174" textAnchor="end" style={{ fontSize: 13, fontWeight: 600, fill: teleStep === 4 ? "#5fd8e0" : "#8b98b4" }}>
                    {teleStep === 4 ? `≈ |${teleInput}⟩ ✓` : "?"}
                  </text>
                </svg>
                <div style={{ fontSize: 13, color: "#c7d2e6", textAlign: "center", maxWidth: 500 }}>
                  <strong style={{ color: "#dbe4f5" }}>{TELE_STEPS[teleStep].title}.</strong> {TELE_STEPS[teleStep].text}
                </div>
              </div>
            )}
          </div>

          <div className="lab-3d-sidebar qs-scroll">
            {mode === "qubit" && (
              <>
                <div className="lab-3d-section">
                  <div className="lab-3d-section-title">State Vector</div>
                  <div className="lab-3d-eq">|ψ⟩ = ({fmt(qubit[0])})|0⟩ + ({fmt(qubit[1])})|1⟩</div>
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9abbb3" }}>
                      <span>P(0)</span><span>{p0.toFixed(1)}%</span>
                    </div>
                    <div className="qs-bar-track"><div className="qs-bar-fill" style={{ width: `${p0}%`, background: "#5fd8e0" }} /></div>
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9abbb3" }}>
                      <span>P(1)</span><span>{p1.toFixed(1)}%</span>
                    </div>
                    <div className="qs-bar-track"><div className="qs-bar-fill" style={{ width: `${p1}%`, background: "#e8a457" }} /></div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9abbb3", marginTop: 6 }}>
                    <span>θ = {theta.toFixed(1)}°</span><span>φ = {phi.toFixed(1)}°</span>
                  </div>
                </div>

                <div className="lab-3d-section">
                  <div className="lab-3d-section-title">Presets</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                    {Object.keys(PRESETS).map((k) => (
                      <button key={k} className="qs-btn" onClick={() => applyPreset(k)}>|{k}⟩</button>
                    ))}
                  </div>
                </div>

                <div className="lab-3d-section">
                  <div className="lab-3d-section-title">Quantum Gates</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                    {Object.keys(GATES).map((k) => (
                      <button key={k} className="qs-btn" title={GATES[k].desc} onClick={() => applyGate(k)}>
                        {k === "Sdg" ? "S†" : k === "Tdg" ? "T†" : k}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lab-3d-section">
                  <div className="lab-3d-section-title">Rotation R(θ)</div>
                  <div className="qs-seg" style={{ marginBottom: 8 }}>
                    {["x", "y", "z"].map((ax) => (
                      <button key={ax} className={rotAxis === ax ? "active" : ""} onClick={() => setRotAxis(ax)}>R{ax}</button>
                    ))}
                  </div>
                  <input className="qs-slider" type="range" min={-180} max={180} value={rotAngle} onChange={(e) => setRotAngle(Number(e.target.value))} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                    <span style={{ fontSize: 12, color: "#9abbb3" }}>{rotAngle}°</span>
                    <button className="qs-btn" onClick={applyRotation}>Apply R{rotAxis}(θ)</button>
                  </div>
                </div>

                <div className="lab-3d-section">
                  <div className="lab-3d-section-title">Actions</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button className="qs-btn qs-btn-lg" onClick={measureQubit}><Zap size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Measure</button>
                    <button className="qs-btn qs-btn-lg" onClick={resetQubit}><RotateCcw size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Reset</button>
                  </div>
                </div>
              </>
            )}

            {mode === "qudit" && (
              <>
                <div className="lab-3d-section">
                  <div className="lab-3d-section-title">Dimension</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                    {[2, 3, 4, 5, 6, 7, 8].map((d) => (
                      <button key={d} className={"qs-btn" + (dim === d ? " active" : "")} onClick={() => changeDim(d)}>d={d}</button>
                    ))}
                  </div>
                </div>
                <div className="lab-3d-section">
                  <div className="lab-3d-section-title">Amplitudes</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {qudit.slice(0, dim).map((amp, k) => (
                      <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                        <span style={{ width: 32, color: "#5eead4" }}>|{k}⟩</span>
                        <div className="qs-bar-track" style={{ flex: 1 }}>
                          <div className="qs-bar-fill" style={{ width: `${(cAbs2(amp) * 100).toFixed(1)}%`, background: `hsl(${(((Math.atan2(amp.im, amp.re) / (2 * Math.PI)) % 1 + 1) % 1) * 360},60%,58%)` }} />
                        </div>
                        <span style={{ width: 34, textAlign: "right", color: "#9abbb3" }}>{(cAbs2(amp) * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lab-3d-section">
                  <div className="lab-3d-section-title">Qudit Operations</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <button className="qs-btn" onClick={() => applyQuditGate("shift")}>Shift Xd</button>
                    <button className="qs-btn" onClick={() => applyQuditGate("clock")}>Clock Zd</button>
                    <button className="qs-btn" onClick={() => applyQuditGate("qft")}>QFT (Hd)</button>
                    <button className="qs-btn" onClick={randomQudit}><Shuffle size={13} style={{ verticalAlign: -2, marginRight: 4 }} />Random</button>
                  </div>
                </div>
                <div className="lab-3d-section">
                  <div className="lab-3d-section-title">Actions</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button className="qs-btn qs-btn-lg" onClick={measureQudit}><Dices size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Measure</button>
                    <button className="qs-btn qs-btn-lg" onClick={resetQudit}><RotateCcw size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Reset</button>
                  </div>
                </div>
              </>
            )}

            {mode === "entangle" && (
              <>
                <div className="lab-3d-section">
                  <div className="lab-3d-section-title">Bell State Choice</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {Object.keys(BELL_STATES).map((k) => (
                      <button key={k} className={"qs-btn" + (bellState === k ? " active" : "")} onClick={() => resetBell(k)}>|{BELL_STATES[k].label}⟩</button>
                    ))}
                  </div>
                </div>
                <div className="lab-3d-section">
                  <div className="lab-3d-section-title">Actions</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button className="qs-btn qs-btn-lg" onClick={measureBell} disabled={Boolean(entResult)}><Zap size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Measure</button>
                    <button className="qs-btn qs-btn-lg" onClick={() => resetBell()}><RotateCcw size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Reset</button>
                  </div>
                </div>
              </>
            )}

            {mode === "teleport" && (
              <>
                <div className="lab-3d-section">
                  <div className="lab-3d-section-title">State to Send</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                    {["0", "1", "+", "-"].map((k) => (
                      <button key={k} className={"qs-btn" + (teleInput === k ? " active" : "")} onClick={() => { setTeleInput(k); teleReset(); }}>|{k}⟩</button>
                    ))}
                  </div>
                </div>
                <div className="lab-3d-section">
                  <div className="lab-3d-section-title">Protocol Steps</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                    {TELE_STEPS.map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#c7d2e6", opacity: i <= teleStep ? 1 : 0.4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: i <= teleStep ? "#5fd8e0" : "#223154", flexShrink: 0 }} />
                        {s.title}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button className="qs-btn qs-btn-lg" onClick={teleNext} disabled={teleStep >= TELE_STEPS.length - 1}><ArrowRight size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Next step</button>
                    <button className="qs-btn qs-btn-lg" onClick={teleReset}><RotateCcw size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Reset</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
