"use client";

import { useEffect, useRef } from "react";

export function BackgroundAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const drawIsometricGrid = () => {
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(0, 255, 136, 0.03)";
      ctx.lineWidth = 1;

      const tileSize = 40;
      const offset = (Date.now() * 0.02) % (tileSize * 2);

      // Isometric grid
      for (let x = -tileSize; x < canvas.width + tileSize * 2; x += tileSize) {
        for (let y = -tileSize; y < canvas.height + tileSize * 2; y += tileSize) {
          const isoX = (x - y) * 0.866;
          const isoY = (x + y) * 0.5;

          ctx.beginPath();
          ctx.moveTo(isoX - offset, isoY - offset);
          ctx.lineTo(isoX + tileSize * 0.866 - offset, isoY + tileSize * 0.5 - offset);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(isoX - offset, isoY - offset);
          ctx.lineTo(isoX - tileSize * 0.866 - offset, isoY + tileSize * 0.5 - offset);
          ctx.stroke();
        }
      }

      // Radial glow at center
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height)
      );
      gradient.addColorStop(0, "rgba(0, 255, 136, 0.05)");
      gradient.addColorStop(0.5, "rgba(0, 255, 136, 0.01)");
      gradient.addColorStop(1, "rgba(0, 255, 136, 0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const animate = () => {
      drawIsometricGrid();
      requestAnimationFrame(animate);
    };

    animate();

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #111111 100%)" }}
    />
  );
}
