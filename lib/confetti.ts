// Lightweight canvas confetti engine with zero external dependencies
export function triggerConfetti() {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    document.body.removeChild(canvas);
    return;
  }

  const width = (canvas.width = window.innerWidth);
  const height = (canvas.height = window.innerHeight);

  const colors = ['#D4F63C', '#2EE59D', '#F3F7F6', '#8E9D9E', '#E4FF54', '#34F5AA'];
  const particles: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
  }[] = [];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: width * 0.5 + (Math.random() - 0.5) * 300,
      y: height * 0.4,
      vx: (Math.random() - 0.5) * 16,
      vy: Math.random() * -18 - 4,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
    });
  }

  let animationFrameId: number;
  const startTime = Date.now();
  const duration = 2800;

  function render() {
    const elapsed = Date.now() - startTime;
    if (elapsed > duration) {
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
      return;
    }

    ctx!.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.5; // gravity
      p.vx *= 0.98; // air resistance
      p.rotation += p.rotationSpeed;
      p.opacity = Math.max(0, 1 - elapsed / duration);

      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate((p.rotation * Math.PI) / 180);
      ctx!.globalAlpha = p.opacity;
      ctx!.fillStyle = p.color;
      ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      ctx!.restore();
    });

    animationFrameId = requestAnimationFrame(render);
  }

  animationFrameId = requestAnimationFrame(render);
}
