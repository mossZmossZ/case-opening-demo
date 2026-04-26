let canvas = null;
let ctx = null;
let frame = null;

// Detect touch device once at load — halve particle count on mobile to stay within GPU budget
const isMobile = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;

export function burst(x, y, color, count = 32) {
  const actualCount = isMobile ? Math.ceil(count / 2) : count;

  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:50;will-change:transform;';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
  }

  // Only resize when viewport dimensions actually changed — canvas resize is expensive
  if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  const particles = Array.from({ length: actualCount }, () => ({
    x, y,
    vx: (Math.random() - 0.5) * 14,
    vy: (Math.random() - 0.5) * 14 - 4,
    r: Math.random() * 4 + 2,
    alpha: 1,
  }));

  cancelAnimationFrame(frame);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Set fillStyle once per frame — all particles share the same color
    ctx.fillStyle = color;
    let alive = false;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
      p.alpha -= 0.022;
      if (p.alpha <= 0) continue;
      alive = true;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (alive) {
      frame = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();
}
