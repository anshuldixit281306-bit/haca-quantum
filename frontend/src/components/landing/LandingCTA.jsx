import { ArrowRight } from "lucide-react";

function LandingCTA({ onStart }) {
  return <section className="landing-invite"><div className="invite-glow" aria-hidden="true" /><p className="landing-kicker">THE QUANTUM FRONTIER IS OPEN</p><h2>Curiosity is your<br /><em>superpower.</em></h2><p>Follow the signal, build the circuit, and discover what your next idea can do.</p><button type="button" className="landing-primary" onClick={onStart}>Enter Mac &amp; Quantum <ArrowRight size={17} /></button></section>;
}

export default LandingCTA;