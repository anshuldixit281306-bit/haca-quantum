import { useEffect, useRef } from "react";

function QuantumParticleField({ mode }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return undefined;

    let animationFrame;
    let width = 0;
    let height = 0;
    let particles = [];
    const pointer = { x: -1000, y: -1000, active: false };
    const palette = [["#5eead4", "#67cfc1"], ["#0f7c79", "#5eead4"], ["#d97745", "#5eead4"]];

    const resize = () => {
      const scale = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * scale);
      canvas.height = Math.floor(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      const count = width < 700 ? 150 : 320;
      particles = Array.from({ length: count }, (_, index) => ({
        index,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        size: Math.random() * 1.8 + 0.6,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const movePointer = (event) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.active = true;
    };

    const leavePointer = () => {
      pointer.active = false;
    };

    const draw = (time) => {
      context.clearRect(0, 0, width, height);
      const colors = palette[mode];
      const elapsed = time * 0.00035;
      const maxDistance = width < 700 ? 82 : 110;

      particles.forEach((particle) => {
        particle.x += particle.vx + Math.sin(elapsed + particle.phase + particle.index * 0.015) * 0.16;
        particle.y += particle.vy + Math.cos(elapsed + particle.phase) * 0.08;
        if (particle.x < -10) particle.x = width + 10;
        if (particle.x > width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = height + 10;
        if (particle.y > height + 10) particle.y = -10;

        if (pointer.active) {
          const dx = pointer.x - particle.x;
          const dy = pointer.y - particle.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 150 && distance > 0) {
            particle.x -= (dx / distance) * 0.45;
            particle.y -= (dy / distance) * 0.45;
          }
        }

        context.beginPath();
        context.fillStyle = colors[particle.index % 2];
        context.globalAlpha = 0.22 + (Math.sin(elapsed + particle.phase) + 1) * 0.16;
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      });

      context.lineWidth = 0.55;
      particles.forEach((particle, index) => {
        for (let next = index + 1; next < Math.min(index + 8, particles.length); next += 1) {
          const other = particles[next];
          const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
          if (distance < maxDistance) {
            context.beginPath();
            context.strokeStyle = colors[(index + next) % 2];
            context.globalAlpha = (1 - distance / maxDistance) * 0.16;
            context.moveTo(particle.x, particle.y);
            context.lineTo(other.x, other.y);
            context.stroke();
          }
        }
      });

      context.globalAlpha = 1;
      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    canvas.addEventListener("pointermove", movePointer);
    canvas.addEventListener("pointerleave", leavePointer);
    window.addEventListener("resize", resize);
    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      canvas.removeEventListener("pointermove", movePointer);
      canvas.removeEventListener("pointerleave", leavePointer);
      window.removeEventListener("resize", resize);
    };
  }, [mode]);

  return <canvas ref={canvasRef} className="quantum-particle-field" aria-hidden="true" />;
}

export default QuantumParticleField;