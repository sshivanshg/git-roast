"use client";

import { useEffect, useRef } from "react";

export function BackgroundAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Isometric grid lines — electric blue tint
      ctx.strokeStyle = "rgba(56, 189, 248, 0.035)";
      ctx.lineWidth = 1;

      const tileW = 48;
      const tileH = 28;
      const drift = (Date.now() * 0.006) % (tileW * 2);
      const cols = Math.ceil(canvas.width / tileW) + 4;
      const rows = Math.ceil(canvas.height / tileH) + 4;

      for (let row = -2; row < rows; row++) {
        for (let col = -2; col < cols; col++) {
          const sx = col * tileW + (row % 2) * (tileW / 2) - drift;
          const sy = row * tileH;

          // right edge
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + tileW / 2, sy + tileH);
          ctx.stroke();

          // left edge
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx - tileW / 2, sy + tileH);
          ctx.stroke();
        }
      }

      // Central radial glow — blue
      const cx = canvas.width / 2;
      const cy = canvas.height * 0.38;
      const r = Math.max(canvas.width, canvas.height) * 0.65;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, "rgba(56, 189, 248, 0.06)");
      g.addColorStop(0.45, "rgba(56, 189, 248, 0.02)");
      g.addColorStop(1, "rgba(56, 189, 248, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
