import { useEffect, useRef } from "react";

function QuantumBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return undefined;

    let width = 0;
    let height = 0;
    let frame = 0;
    const colors = ["#5eead4", "#5eead4", "#34d399", "#34d399"];
    const particles = [];
    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    resize();
    const count = Math.min(Math.floor((width * height) / 18000), 80);
    for (let index = 0; index < count; index += 1) {
      particles.push({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, size: Math.random() * 2 + 0.5, color: colors[index % colors.length], alpha: Math.random() * 0.5 + 0.2 });
    }
    const render = () => {
      context.clearRect(0, 0, width, height);
      particles.forEach((particle, index) => {
        particle.x = (particle.x + particle.vx + width) % width;
        particle.y = (particle.y + particle.vy + height) % height;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fillStyle = particle.color;
        context.globalAlpha = particle.alpha;
        context.fill();
        for (let next = index + 1; next < particles.length; next += 1) {
          const other = particles[next];
          const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
          if (distance < 140) {
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(other.x, other.y);
            context.strokeStyle = `rgba(94,234,212,${(1 - distance / 140) * 0.15})`;
            context.lineWidth = 0.5;
            context.stroke();
          }
        }
      });
      context.globalAlpha = 1;
      frame = requestAnimationFrame(render);
    };
    render();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="ql-new-background" aria-hidden="true" />;
}

export default QuantumBackground;