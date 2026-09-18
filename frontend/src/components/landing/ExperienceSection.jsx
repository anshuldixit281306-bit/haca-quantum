import { ArrowRight, BrainCircuit, FlaskConical, Trophy } from "lucide-react";

function ExperienceSection({ onStart }) {
  return (
    <section className="landing-experience" id="experience">
      <div className="experience-visual"><div className="mini-circuit"><span className="wire-label">q₀</span><i /><b>H</b><i /><b>●</b><i /><span className="wire-label">q₁</span><i /><i /><b>⊕</b><i /></div><div className="probability-bars"><span>|0⟩ <i style={{ width: "50%" }} /></span><span>|1⟩ <i style={{ width: "50%" }} /></span></div></div>
      <div className="experience-copy"><p className="landing-kicker">LEARN BY DOING</p><h2>From first gate to quantum intuition.</h2><p>Every lesson connects a clear explanation to a playground. Earn XP for completing concepts, keep your streak alive, and unlock harder challenges as your confidence grows.</p><div className="experience-points"><span><BrainCircuit size={18} /> Visual explanations</span><span><FlaskConical size={18} /> Real circuit simulation</span><span><Trophy size={18} /> Progress that feels rewarding</span></div><button type="button" className="landing-primary" onClick={onStart}>Begin your journey <ArrowRight size={17} /></button></div>
    </section>
  );
}

export default ExperienceSection;