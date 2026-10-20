// Pointer effects, in the site's terminal theme:
//   * click  → a burst of code glyphs
//   * drag   → a fading trail of "matrix" characters
//   * move   → a soft spotlight that follows the cursor over the dotted grid
// One full-screen canvas, drawn only while particles are alive. Disabled for
// prefers-reduced-motion.

const COLORS = ["#a78bfa", "#3fb950", "#39c5cf", "#f778ba", "#e3b341"];
const BURST = "{}[]<>/;=$#*01";
const TRAIL = "ｱｲｳｴｵｶｷｸｹｺ0123456789";
const FONT = '"JetBrains Mono Variable", ui-monospace, monospace';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 1 → 0
  decay: number;
  size: number;
  glyph: string;
  color: string;
  gravity: number;
};

const pick = <T>(s: ArrayLike<T>) => s[Math.floor(Math.random() * s.length)];

export function initPointerEffects() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.className = "pointer-events-none fixed inset-0 z-[45]";
  document.body.append(canvas);
  const ctx = canvas.getContext("2d")!;

  let dpr = 1;
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
  };
  resize();
  addEventListener("resize", resize);

  const particles: Particle[] = [];
  let raf = 0;

  const frame = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.96;
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.font = `600 ${p.size}px ${FONT}`;
      ctx.fillText(p.glyph, p.x, p.y);
    }
    ctx.globalAlpha = 1;
    raf = particles.length ? requestAnimationFrame(frame) : 0;
  };
  const wake = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  const burst = (x: number, y: number) => {
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.4;
      const speed = 2 + Math.random() * 3.5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 1,
        decay: 0.022 + Math.random() * 0.015,
        size: 11 + Math.random() * 7,
        glyph: pick(BURST),
        color: pick(COLORS),
        gravity: 0.12,
      });
    }
    wake();
  };

  let dragging = false;
  let last = { x: 0, y: 0 };
  const trail = (x: number, y: number) => {
    // One glyph every ~14px of travel, so fast drags don't flood the screen.
    if (Math.hypot(x - last.x, y - last.y) < 14) return;
    last = { x, y };
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 0.4,
      vy: 0.6 + Math.random() * 0.6,
      life: 1,
      decay: 0.018,
      size: 13 + Math.random() * 5,
      glyph: pick(TRAIL),
      color: Math.random() < 0.8 ? "#3fb950" : "#a78bfa",
      gravity: 0.02,
    });
    if (particles.length > 400) particles.splice(0, particles.length - 400);
    wake();
  };

  // Spotlight: CSS reads --mx/--my (see .spotlight in global.css).
  const root = document.documentElement;
  let pending = false;
  let mx = 0;
  let my = 0;

  addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    burst(e.clientX, e.clientY);
    dragging = true;
    last = { x: e.clientX, y: e.clientY };
  });
  addEventListener("pointermove", (e) => {
    if (dragging && e.buttons === 1) trail(e.clientX, e.clientY);
    if (e.pointerType !== "mouse") return;
    mx = e.clientX;
    my = e.clientY;
    if (!pending) {
      pending = true;
      requestAnimationFrame(() => {
        root.style.setProperty("--mx", `${mx}px`);
        root.style.setProperty("--my", `${my}px`);
        pending = false;
      });
    }
  }, { passive: true });
  const stop = () => (dragging = false);
  addEventListener("pointerup", stop);
  addEventListener("pointercancel", stop);
}
