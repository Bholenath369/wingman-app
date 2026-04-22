// src/lib/animations.js
// Core animation engine for Wingman.
// All effects are pure JS + Canvas — no external dependencies.

// ── Haptic feedback ──────────────────────────────────────────
export function haptic(style = "light") {
  if (!navigator.vibrate) return;
  const patterns = {
    light:    [10],
    medium:   [20],
    heavy:    [30],
    success:  [10, 50, 20],
    error:    [50, 30, 50],
    celebrate:[10, 20, 10, 20, 40],
  };
  navigator.vibrate(patterns[style] || patterns.light);
}

// ── Spring easing ────────────────────────────────────────────
export function springEase(t, tension = 180, friction = 12) {
  // Damped spring simulation
  const omega = Math.sqrt(tension);
  const zeta  = friction / (2 * Math.sqrt(tension));
  if (zeta < 1) {
    const wd = omega * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * omega * t) * (
      Math.cos(wd * t) + (zeta * omega / wd) * Math.sin(wd * t)
    );
  }
  return 1 - Math.exp(-omega * t) * (1 + omega * t);
}

// ── Animate a value with spring physics ─────────────────────
export function animateSpring(from, to, duration, onUpdate, onDone) {
  const start = performance.now();
  function tick(now) {
    const elapsed = (now - start) / duration;
    if (elapsed >= 1) { onUpdate(to); onDone?.(); return; }
    const t = springEase(elapsed * 2, 200, 18);
    onUpdate(from + (to - from) * Math.min(t, 1));
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  return () => {}; // cancel stub
}

// ── Number counter animation ─────────────────────────────────
export function animateNumber(el, from, to, duration = 1200) {
  if (!el) return;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 4); // ease-out-quart
    el.textContent = Math.round(from + (to - from) * eased);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ── Confetti burst ───────────────────────────────────────────
const CONFETTI_COLORS = [
  "#E8547A","#FF8FAB","#7C5CFC","#A78BFA",
  "#34D399","#FCD34D","#60A5FA","#F472B6",
];

export function confettiBurst(originX, originY, count = 60) {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = `
    position:fixed;inset:0;pointer-events:none;
    z-index:9999;width:100%;height:100%;
  `;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const particles = Array.from({ length: count }, (_, i) => {
    const angle  = (Math.random() * Math.PI * 2);
    const speed  = 4 + Math.random() * 8;
    const size   = 4 + Math.random() * 7;
    const shape  = Math.random() > 0.5 ? "rect" : "circle";
    return {
      x: originX, y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (3 + Math.random() * 4),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size, shape,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
      life: 1, decay: 0.012 + Math.random() * 0.008,
    };
  });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      if (p.life <= 0) continue;
      alive = true;
      p.vy += 0.25; // gravity
      p.vx *= 0.99; // air resistance
      p.x  += p.vx;
      p.y  += p.vy;
      p.rotation += p.rotSpeed;
      p.life -= p.decay;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle   = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      if (p.shape === "rect") {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    if (alive) requestAnimationFrame(draw);
    else canvas.remove();
  }
  requestAnimationFrame(draw);
}

// ── Floating emoji reaction ──────────────────────────────────
export function floatEmoji(emoji, originX, originY) {
  const el = document.createElement("span");
  el.textContent = emoji;
  el.style.cssText = `
    position:fixed;
    left:${originX - 16}px;
    top:${originY - 16}px;
    font-size:28px;
    pointer-events:none;
    z-index:9999;
    will-change:transform,opacity;
    transition:none;
    user-select:none;
  `;
  document.body.appendChild(el);

  const targetX = (Math.random() - 0.5) * 80;
  const targetY = -(60 + Math.random() * 60);
  const start = performance.now();
  const duration = 900 + Math.random() * 400;

  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const scale = p < 0.15 ? p / 0.15 : p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1;
    el.style.transform = `translate(${targetX * eased}px,${targetY * eased}px) scale(${scale})`;
    el.style.opacity   = String(1 - Math.max(0, (p - 0.6) / 0.4));
    if (p < 1) requestAnimationFrame(tick);
    else el.remove();
  }
  requestAnimationFrame(tick);
}

// ── Ripple on button click ───────────────────────────────────
export function addRipple(el) {
  if (!el) return;
  el.style.position   = "relative";
  el.style.overflow   = "hidden";
  el.addEventListener("click", (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const r = document.createElement("span");
    const size = Math.max(rect.width, rect.height) * 2;
    r.style.cssText = `
      position:absolute;
      border-radius:50%;
      background:rgba(255,255,255,0.25);
      width:${size}px;height:${size}px;
      left:${x - size / 2}px;top:${y - size / 2}px;
      transform:scale(0);
      animation:rippleAnim 0.55s ease-out forwards;
      pointer-events:none;
    `;
    el.appendChild(r);
    setTimeout(() => r.remove(), 600);
  });
}

// ── Heartbeat pulse on a number el ──────────────────────────
export function heartbeatPulse(el) {
  if (!el) return;
  let phase = 0;
  const beats = [0, 0.1, 0.2, 0.3, 0.5]; // beat at these fractions of 2π
  let raf;
  function tick() {
    phase += 0.025;
    // Heartbeat: sharp spike then drop
    const raw  = Math.sin(phase);
    const beat = raw > 0.6 ? raw * 1.15 : raw * 0.95;
    const s = 1 + Math.max(0, beat - 0.6) * 0.18;
    el.style.transform = `scale(${s})`;
    raf = requestAnimationFrame(tick);
  }
  tick();
  return () => cancelAnimationFrame(raf);
}

// ── Particle network background ──────────────────────────────
export function initParticleBackground(canvas) {
  if (!canvas) return () => {};
  const ctx = canvas.getContext("2d");
  let W = canvas.parentElement.offsetWidth;
  let H = canvas.parentElement.offsetHeight;
  canvas.width  = W;
  canvas.height = H;

  const mouse = { x: W / 2, y: H / 2 };
  const COUNT = Math.min(40, Math.floor(W * H / 14000));

  const particles = Array.from({ length: COUNT }, () => ({
    x:  Math.random() * W,
    y:  Math.random() * H,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r:  1.5 + Math.random() * 2.5,
    hue: Math.random() > 0.5 ? 340 : 265, // pink or purple
  }));

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connection lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(232,84,122,${0.06 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // Draw particles + mouse influence
    for (const p of particles) {
      // Mouse attraction
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 120) {
        p.vx += dx * 0.00015;
        p.vy += dy * 0.00015;
      }

      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.995;
      p.vy *= 0.995;

      // Wrap edges
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      // Glow orb
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
      grad.addColorStop(0, `hsla(${p.hue},80%,70%,0.7)`);
      grad.addColorStop(1, `hsla(${p.hue},80%,70%,0)`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  let raf;
  function loop() { draw(); raf = requestAnimationFrame(loop); }
  loop();

  // Mouse tracking
  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }
  function onTouch(e) {
    const t = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    mouse.x = t.clientX - rect.left;
    mouse.y = t.clientY - rect.top;
  }
  function onResize() {
    W = canvas.parentElement.offsetWidth;
    H = canvas.parentElement.offsetHeight;
    canvas.width  = W;
    canvas.height = H;
  }

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("touchmove", onTouch, { passive: true });
  window.addEventListener("resize", onResize);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("touchmove", onTouch);
    window.removeEventListener("resize", onResize);
  };
}

// ── Skeleton shimmer helper ──────────────────────────────────
// Returns inline style object for shimmer placeholder elements
export function shimmerStyle(width = "100%", height = 16, radius = 8) {
  return {
    width, height,
    borderRadius: radius,
    background: "linear-gradient(90deg, var(--surface) 25%, rgba(255,255,255,0.06) 50%, var(--surface) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmerSlide 1.6s ease-in-out infinite",
    display: "block",
  };
}

// ── Stagger-in children ──────────────────────────────────────
export function staggerIn(parent, delayStep = 80) {
  if (!parent) return;
  const children = Array.from(parent.children);
  children.forEach((child, i) => {
    child.style.opacity   = "0";
    child.style.transform = "translateY(16px)";
    child.style.transition = `opacity 0.4s ease ${i * delayStep}ms, transform 0.4s ease ${i * delayStep}ms`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        child.style.opacity   = "1";
        child.style.transform = "translateY(0)";
      });
    });
  });
}

// ── Premium unlock celebration ───────────────────────────────
export function premiumUnlockCelebration() {
  // Full-screen flash then confetti rain
  const flash = document.createElement("div");
  flash.style.cssText = `
    position:fixed;inset:0;
    background:radial-gradient(circle at center, rgba(232,84,122,0.25) 0%, transparent 70%);
    pointer-events:none;z-index:9998;
    animation:premiumFlash 0.8s ease-out forwards;
  `;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 900);

  // Confetti from multiple origin points
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 3;
  confettiBurst(cx, cy, 80);
  setTimeout(() => confettiBurst(cx - 120, cy + 40, 40), 120);
  setTimeout(() => confettiBurst(cx + 120, cy + 40, 40), 200);

  haptic("celebrate");
}

// ── Magnetic button hover ─────────────────────────────────────
export function makeMagnetic(el, strength = 0.35) {
  if (!el) return;
  function onMove(e) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;
    el.style.transform = `translate(${dx}px,${dy}px)`;
  }
  function onLeave() {
    el.style.transform = "";
    el.style.transition = "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)";
    setTimeout(() => { el.style.transition = ""; }, 400);
  }
  el.addEventListener("mousemove", onMove);
  el.addEventListener("mouseleave", onLeave);
  return () => {
    el.removeEventListener("mousemove", onMove);
    el.removeEventListener("mouseleave", onLeave);
  };
}
