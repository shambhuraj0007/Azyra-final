'use client';

import { useEffect, useRef } from 'react';

export default function CinematicCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let time = 0;

    // Mouse tracking with gentle smoothing for subtle parallax
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / width - 0.5) * 2;
      targetMouseY = (e.clientY / height - 0.5) * 2;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Floating ambient stardust particles
    const particles = Array.from({ length: 42 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      speedY: Math.random() * 0.25 + 0.1,
      speedX: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.4 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      time += 0.012;

      // Smooth mouse interpolation
      currentMouseX += (targetMouseX - currentMouseX) * 0.04;
      currentMouseY += (targetMouseY - currentMouseY) * 0.04;

      // Pure deep black background clear
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // --- LAYER 1: Animated Radial Aurora Glows (Atmospheric depth) ---
      const glow1X = width * 0.5 + Math.sin(time * 0.7) * 90 + currentMouseX * 50;
      const glow1Y = height * 0.18 + Math.cos(time * 0.5) * 60 + currentMouseY * 30;
      const grad1 = ctx.createRadialGradient(glow1X, glow1Y, 0, glow1X, glow1Y, Math.min(width, 700));
      grad1.addColorStop(0, 'rgba(212, 246, 60, 0.065)'); // Electric Lime tint
      grad1.addColorStop(0.5, 'rgba(46, 229, 157, 0.03)'); // Emerald tint
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const glow2X = width * 0.85 + Math.cos(time * 0.4) * 80;
      const glow2Y = height * 0.55 + Math.sin(time * 0.6) * 70;
      const grad2 = ctx.createRadialGradient(glow2X, glow2Y, 0, glow2X, glow2Y, 500);
      grad2.addColorStop(0, 'rgba(46, 229, 157, 0.04)');
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // --- LAYER 2: 3D Perspective Undulating Wave Matrix (ReleaseStack style) ---
      const rows = 32;
      const cols = 48;
      const fov = 340;
      const horizonY = height * 0.28 + currentMouseY * 25;
      const planeWidth = width * 1.5;
      const startZ = 80;
      const endZ = 1200;

      for (let r = 0; r < rows; r++) {
        const normZ = r / (rows - 1);
        const z = startZ + normZ * (endZ - startZ);
        const scale = fov / (fov + z);

        for (let c = 0; c < cols; c++) {
          const normX = (c / (cols - 1) - 0.5) * 2;
          const worldX = normX * planeWidth * 0.65;

          // Organic mathematical wave formula
          const wave1 = Math.sin(normX * 4 + time * 1.2) * 22;
          const wave2 = Math.cos(normZ * 5 - time * 1.0) * 26;
          const wave3 = Math.sin((normX + normZ) * 3 + time * 0.8) * 16;
          const worldY = wave1 + wave2 + wave3;

          // Project to 2D screen coordinates
          const screenX = width * 0.5 + (worldX + currentMouseX * 120 * (1 - normZ)) * scale;
          const screenY = horizonY + (worldY + 220) * scale;

          if (screenX >= -10 && screenX <= width + 10 && screenY >= -10 && screenY <= height + 10) {
            // Distance fading and pulse
            const depthFade = Math.pow(1 - normZ, 1.4);
            const dotSize = Math.max(0.6, (2.4 * scale));
            const alpha = depthFade * 0.38;

            ctx.beginPath();
            ctx.arc(screenX, screenY, dotSize, 0, Math.PI * 2);

            // Subtle color blend: front nodes tinted slightly electric lime
            if (normZ < 0.35 && (c + r) % 4 === 0) {
              ctx.fillStyle = `rgba(212, 246, 60, ${alpha * 1.4})`;
            } else {
              ctx.fillStyle = `rgba(244, 247, 246, ${alpha})`;
            }
            ctx.fill();
          }
        }
      }

      // --- LAYER 3: Ambient Drifting Stardust Particles ---
      for (const p of particles) {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.pulse += 0.02;

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        const currentOpacity = p.opacity * (0.6 + Math.sin(p.pulse) * 0.4);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 246, 60, ${currentOpacity})`;
        ctx.fill();
      }

      // --- LAYER 4: Smooth Vignette Gradient overlay ---
      const vignette = ctx.createLinearGradient(0, 0, 0, height);
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0.25)');
      vignette.addColorStop(0.3, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(0.85, 'rgba(0, 0, 0, 0.4)');
      vignette.addColorStop(1, '#000000');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 block w-full h-full"
      aria-hidden="true"
    />
  );
}
