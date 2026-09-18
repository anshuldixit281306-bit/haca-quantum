import { Atom } from "lucide-react";

function OrbitVisualization({ mode }) {
  return (
    <div className={`landing-orbit-art orbit-mode-${mode}`} aria-label="Animated quantum state visualization">
      <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" />
      <div className="orbit-core"><Atom size={38} /><span>|ψ⟩</span></div>
      <span className="orbit-label label-top">superposition</span>
      <span className="orbit-label label-right">measurement</span>
      <span className="orbit-label label-bottom">entanglement</span>
    </div>
  );
}

export default OrbitVisualization;