import { useEffect, useRef } from "react";

export default function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; vx: number; vy: number; size: number; type: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      const count = Math.floor((window.innerWidth * window.innerHeight) / 20000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 5 + 2,
          type: Math.floor(Math.random() * 5),
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(16, 185, 129, 0.1)";
      ctx.lineWidth = 1;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        switch (p.type) {
          case 0: // Rect
            ctx.strokeRect(p.x, p.y, p.size, p.size);
            break;
          case 1: // Square fill
            ctx.fillStyle = "rgba(16, 185, 129, 0.05)";
            ctx.fillRect(p.x, p.y, p.size, p.size);
            break;
          case 2: // Line
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.size, p.y + p.size);
            ctx.stroke();
            break;
          case 3: // Cross
            ctx.moveTo(p.x - p.size / 2, p.y);
            ctx.lineTo(p.x + p.size / 2, p.y);
            ctx.moveTo(p.x, p.y - p.size / 2);
            ctx.lineTo(p.x, p.y + p.size / 2);
            ctx.stroke();
            break;
          case 4: // Bracket
            ctx.moveTo(p.x + p.size, p.y);
            ctx.lineTo(p.x, p.y);
            ctx.lineTo(p.x, p.y + p.size);
            ctx.stroke();
            break;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    createParticles();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-50"
    />
  );
}
