import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

function HeroParticles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return undefined;
    let frame = 0;
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    const particles = Array.from({ length: 55 }, () => ({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, size: Math.random() * 1.8 + 0.3, color: ["#00e5ff", "#3b82f6", "#8b5cf6"][Math.floor(Math.random() * 3)], alpha: Math.random() * 0.4 + 0.1 }));
    const resize = () => { width = canvas.width = canvas.offsetWidth; height = canvas.height = canvas.offsetHeight; };
    const render = () => { context.clearRect(0, 0, width, height); particles.forEach((particle) => { particle.x = (particle.x + particle.vx + width) % width; particle.y = (particle.y + particle.vy + height) % height; context.beginPath(); context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2); context.fillStyle = particle.color; context.globalAlpha = particle.alpha; context.fill(); }); context.globalAlpha = 1; frame = requestAnimationFrame(render); };
    resize(); render(); window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="ql-new-hero-particles" aria-hidden="true" />;
}

function QuantumSphere() {
  return <div className="ql-new-sphere" aria-hidden="true"><div className="ql-new-sphere-ring ring-one" /><div className="ql-new-sphere-ring ring-two" /><div className="ql-new-sphere-ring ring-three" /><div className="ql-new-sphere-core"><svg viewBox="0 0 100 100"><line x1="50" y1="10" x2="50" y2="90" /><line x1="10" y1="50" x2="90" y2="50" /><ellipse cx="50" cy="50" rx="35" ry="15" /><ellipse cx="50" cy="50" rx="15" ry="35" /><line x1="50" y1="50" x2="75" y2="25" /><circle cx="75" cy="25" r="3" /></svg></div><span className="ql-new-quantum-symbol symbol-one">|ψ⟩</span><span className="ql-new-quantum-symbol symbol-two">|0⟩</span><span className="ql-new-quantum-symbol symbol-three">⊗</span></div>;
}

function Hero() {
  const navigate = useNavigate();
  const scrollToFeatures = () => document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" });
  return <section id="home" className="ql-new-hero"><div className="ql-new-hero-gradient" /><div className="ql-new-grid-bg" /><HeroParticles /><QuantumSphere /><div className="ql-new-hero-content"><div className="ql-new-eyebrow"><Sparkles size={14} /> AI-POWERED QUANTUM LEARNING</div><h1>Master <span>Quantum Computing</span>.<br />The Interactive Way.</h1><p>Learn quantum computing and algorithms through interactive lessons, AI-powered guidance, gamification and personalized progress tracking.</p><div className="ql-new-actions"><button type="button" className="ql-new-button" onClick={() => navigate("/signup")}>Get Started <ArrowRight size={17} /></button><button type="button" className="ql-new-ghost" onClick={scrollToFeatures}>Explore Platform</button></div></div><div className="ql-new-hero-float float-left"><strong>✦ Interactive lessons</strong><small>Learn by doing</small></div><div className="ql-new-hero-float float-right"><strong>◉ Track progress</strong><small>Your quantum journey</small></div></section>;
}

export default Hero;