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
    let isVisible = true;

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

    // Handle visibility to save GPU/CPU cycles
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isVisible = false;
        cancelAnimationFrame(animationFrameId);
      } else {
        isVisible = true;
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Optimized particle count: 24 (reduced from 42 for top 60fps performance)
    const particles = Array.from({ length: 24 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.4 + 0.5,
      speedY: Math.random() * 0.2 + 0.08,
      speedX: (Math.random() - 0.5) * 0.15,
      opacity: Math.random() * 0.35 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      if (!isVisible) return;
      time += 0.01;

      // Smooth mouse interpolation
      currentMouseX += (targetMouseX - currentMouseX) * 0.04;
      currentMouseY += (targetMouseY - currentMouseY) * 0.04;

      // Theme-responsive background clear
      const isLight = document.documentElement.classList.contains('light');
      ctx.fillStyle = isLight ? '#F8FAFC' : '#0A0D12';
      ctx.fillRect(0, 0, width, height);

      // --- LAYER 1: Subtle Radial Glows ---
      const glow1X = width * 0.5 + Math.sin(time * 0.6) * 70 + currentMouseX * 40;
      const glow1Y = height * 0.18 + Math.cos(time * 0.45) * 50 + currentMouseY * 25;
      const grad1 = ctx.createRadialGradient(glow1X, glow1Y, 0, glow1X, glow1Y, Math.min(width, 680));
      grad1.addColorStop(0, isLight ? 'rgba(212, 246, 60, 0.08)' : 'rgba(212, 246, 60, 0.045)'); // Refined Lime tint
      grad1.addColorStop(0.6, isLight ? 'rgba(56, 189, 248, 0.04)' : 'rgba(56, 189, 248, 0.02)'); // Clean Ice Blue hint
      grad1.addColorStop(1, isLight ? 'rgba(248, 250, 252, 0)' : 'rgba(8, 9, 10, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const glow2X = width * 0.82 + Math.cos(time * 0.35) * 60;
      const glow2Y = height * 0.52 + Math.sin(time * 0.5) * 50;
      const grad2 = ctx.createRadialGradient(glow2X, glow2Y, 0, glow2X, glow2Y, 460);
      grad2.addColorStop(0, isLight ? 'rgba(52, 211, 153, 0.05)' : 'rgba(52, 211, 153, 0.03)');
      grad2.addColorStop(1, isLight ? 'rgba(248, 250, 252, 0)' : 'rgba(8, 9, 10, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // --- LAYER 2: 3D Wave Perspective Matrix ---
      const rows = 28;
      const cols = 44;
      const fov = 340;
      const horizonY = height * 0.28 + currentMouseY * 22;
      const planeWidth = width * 1.45;
      const startZ = 90;
      const endZ = 1150;

      for (let r = 0; r < rows; r++) {
        const normZ = r / (rows - 1);
        const z = startZ + normZ * (endZ - startZ);
        const scale = fov / (fov + z);

        for (let c = 0; c < cols; c++) {
          const normX = (c / (cols - 1) - 0.5) * 2;
          const worldX = normX * planeWidth * 0.65;

          const wave1 = Math.sin(normX * 3.8 + time * 1.1) * 20;
          const wave2 = Math.cos(normZ * 4.6 - time * 0.95) * 24;
          const wave3 = Math.sin((normX + normZ) * 2.8 + time * 0.75) * 14;
          const worldY = wave1 + wave2 + wave3;

          const screenX = width * 0.5 + (worldX + currentMouseX * 110 * (1 - normZ)) * scale;
          const screenY = horizonY + (worldY + 210) * scale;

          if (screenX >= -10 && screenX <= width + 10 && screenY >= -10 && screenY <= height + 10) {
            const depthFade = Math.pow(1 - normZ, 1.35);
            const dotSize = Math.max(0.6, 2.2 * scale);
            const alpha = depthFade * 0.32;

            ctx.beginPath();
            ctx.arc(screenX, screenY, dotSize, 0, Math.PI * 2);

            if (normZ < 0.32 && (c + r) % 5 === 0) {
              ctx.fillStyle = `rgba(212, 246, 60, ${alpha * 1.3})`;
            } else {
              ctx.fillStyle = isLight ? `rgba(15, 23, 42, ${alpha * 0.7})` : `rgba(248, 250, 252, ${alpha})`;
            }
            ctx.fill();
          }
        }
      }

      // --- LAYER 3: Ambient Drifting Stardust Particles ---
      for (const p of particles) {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.pulse += 0.018;

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        const currentOpacity = p.opacity * (0.6 + Math.sin(p.pulse) * 0.4);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? `rgba(180, 200, 30, ${currentOpacity})` : `rgba(212, 246, 60, ${currentOpacity})`;
        ctx.fill();
      }

      // --- LAYER 4: Smooth Vignette Gradient overlay ---
      const vignette = ctx.createLinearGradient(0, 0, 0, height);
      vignette.addColorStop(0, isLight ? 'rgba(255, 255, 255, 0.25)' : 'rgba(8, 9, 10, 0.25)');
      vignette.addColorStop(0.35, isLight ? 'rgba(255, 255, 255, 0)' : 'rgba(8, 9, 10, 0)');
      vignette.addColorStop(0.85, isLight ? 'rgba(248, 250, 252, 0.45)' : 'rgba(8, 9, 10, 0.45)');
      vignette.addColorStop(1, isLight ? '#F8FAFC' : '#08090A');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
