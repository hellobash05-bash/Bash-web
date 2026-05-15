const scrollTrack = document.getElementById('scrollTrack');
const scene = document.getElementById('scene');
const heroStage = document.getElementById('heroStage');
const heroImage = document.getElementById('heroImage');
const wallpaperView = document.getElementById('wallpaperView');
const screenFocus = document.getElementById('screenFocus');
const animatedElements = document.querySelectorAll('[data-animate]');

const state = {
  px: 0,
  py: 0,
  tx: 0,
  ty: 0,
  p: 0,
  tp: 0,
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function map(value, inMin, inMax, outMin, outMax) {
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return outMin + (outMax - outMin) * t;
}

function easeInOut(value) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function getSectionProgress(value, start, end) {
  return clamp((value - start) / (end - start), 0, 1);
}

function onPointerMove(event) {
  const rect = scene.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;

  state.tx = (x - 0.5) * 2;
  state.ty = (y - 0.5) * 2;
}

function resetPointer() {
  state.tx = 0;
  state.ty = 0;
}

function updateScrollProgress() {
  const rect = scrollTrack.getBoundingClientRect();
  const maxScroll = scrollTrack.offsetHeight - window.innerHeight;
  const scrolled = clamp(-rect.top, 0, maxScroll);
  state.tp = maxScroll > 0 ? scrolled / maxScroll : 0;
}

function render() {
  state.px += (state.tx - state.px) * 0.09;
  state.py += (state.ty - state.py) * 0.09;
  state.p += (state.tp - state.p) * 0.08;

  const pointerDepth = 1 - state.p * 0.45;
  const tiltX = state.py * 7 * pointerDepth;
  const tiltY = state.px * -10 * pointerDepth;
  const driftX = state.px * -26 * pointerDepth;
  const driftY = state.py * -22 * pointerDepth;

  // Shard interaction
  const shards = document.querySelectorAll('.shard');
  shards.forEach((shard, i) => {
    const factor = (i + 1) * 15;
    shard.style.transform = `translate3d(${state.px * factor}px, ${state.py * factor}px, 0)`;
  });

  const zoomProgress = easeInOut(getSectionProgress(state.p, 0.12, 0.72));
  const heroScale = map(zoomProgress, 0, 1, 1.02, 2.9);
  const heroShiftX = map(zoomProgress, 0, 1, 0, -36);
  const heroShiftY = map(zoomProgress, 0, 1, 0, -278);

  const revealProgress = easeInOut(getSectionProgress(state.p, 0.62, 0.98));

  heroStage.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  heroImage.style.transform = `translateX(${driftX + heroShiftX}px) translateY(${driftY + heroShiftY}px) scale(${heroScale})`;
  heroImage.style.opacity = String(1 - revealProgress * 0.94);

  screenFocus.style.opacity = String(map(zoomProgress, 0.25, 1, 0, 0.9) * (1 - revealProgress));
  screenFocus.style.transform = `scale(${map(zoomProgress, 0, 1, 0.94, 1.12)})`;

  wallpaperView.style.opacity = String(revealProgress);
  wallpaperView.style.transform = `scale(${map(revealProgress, 0, 1, 1.18, 1)})`;
  wallpaperView.style.pointerEvents = revealProgress > 0.8 ? 'auto' : 'none';

  requestAnimationFrame(render);
}

window.addEventListener('resize', updateScrollProgress);
window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('pointermove', onPointerMove);
scene.addEventListener('pointerleave', resetPointer);
scene.addEventListener('pointercancel', resetPointer);

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const siblings = Array.from(element.parentElement.querySelectorAll('[data-animate]'));
        const index = siblings.indexOf(element);
        
        // Use a CSS variable for easier staggering in CSS
        element.style.setProperty('--stagger-index', index);
        
        // Legacy transition delay support
        element.style.transitionDelay = `${index * 90}ms`;
        
        element.classList.add('in-view');
        window.revealObserver.unobserve(element);
      });
    },
    { threshold: 0.2 }
  );

  animatedElements.forEach((element) => window.revealObserver.observe(element));
} else {
  animatedElements.forEach((element) => element.classList.add('in-view'));
}

updateScrollProgress();
render();

// ── Web Development terminal animation ──
(function () {
  const codeBody = document.getElementById('codeBody');
  if (!codeBody) return;

  const PROMPT_HTML = '<span class="tok-prompt">user@bash</span><span class="tok-output">:</span><span class="tok-url">~/web-app</span><span class="tok-output">$</span>';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  let lines = [];

  function flush() {
    codeBody.innerHTML = lines.join('\n') + '<span class="tok-cursor"> </span>';
    codeBody.scrollTop = codeBody.scrollHeight;
  }

  async function typeCmd(cmd) {
    lines.push('');
    const idx = lines.length - 1;
    let typed = '';
    const typoAt = Math.floor(cmd.length * 0.45 + Math.random() * cmd.length * 0.25);
    const wrongChar = 'qwrtypsdfghjklzxcvbnm'[Math.floor(Math.random() * 21)];
    let typoInserted = false;

    for (let i = 0; i < cmd.length; i++) {
      if (i === typoAt && !typoInserted) {
        typoInserted = true;
        typed += wrongChar;
        lines[idx] = `${PROMPT_HTML} <span class="tok-cmd">${esc(typed)}</span>`;
        flush();
        await sleep(80 + Math.random() * 60);
        await sleep(220 + Math.random() * 180);
        typed = typed.slice(0, -1);
        lines[idx] = `${PROMPT_HTML} <span class="tok-cmd">${esc(typed)}</span>`;
        flush();
        await sleep(60);
      }
      typed += cmd[i];
      lines[idx] = `${PROMPT_HTML} <span class="tok-cmd">${esc(typed)}</span>`;
      flush();
      let delay = 55 + Math.random() * 55;
      if (' /-_.'.includes(cmd[i])) delay += 30;
      if (i > 0 && cmd[i - 1] === ' ')  delay += 20;
      await sleep(delay);
    }
    await sleep(300 + Math.random() * 200);
  }

  async function out(text, cls = 'tok-output', delay = 40) {
    await sleep(delay);
    lines.push(cls ? `<span class="${cls}">${esc(text)}</span>` : esc(text));
    flush();
  }

  async function progress(label, steps = 30, stepMs = 35) {
    lines.push('');
    const idx = lines.length - 1;
    for (let i = 0; i <= steps; i++) {
      const pct  = Math.round((i / steps) * 100);
      const fill = '█'.repeat(i);
      const empty = '░'.repeat(steps - i);
      lines[idx] =
        `  <span class="tok-warn">${esc(label.padEnd(12))}</span>` +
        `<span class="tok-success">${fill}</span>` +
        `<span class="tok-comment">${empty}</span>` +
        `  <span class="tok-prompt">${String(pct).padStart(3)}%</span>`;
      flush();
      await sleep(stepMs + Math.random() * 20);
    }
    await sleep(100);
  }

  async function blankLine() {
    lines.push('');
    flush();
    await sleep(30);
  }

  async function runScript() {
    lines = [];
    flush();
    await sleep(600);
    await typeCmd('node -v');
    await out('v20.11.0', 'tok-success', 120);
    await blankLine();
    await typeCmd('npm install');
    await progress('Installing', 32, 30);
    await out('added 214 packages in 4.2s', 'tok-output', 80);
    await blankLine();
    await typeCmd('npm run dev');
    await out('  VITE v5.2.0  ready in 312 ms', 'tok-success', 80);
    await blankLine();
    await out('  ➜  Local:   http://localhost:5173/', 'tok-url', 50);
    await blankLine();
    lines.push(`${PROMPT_HTML} `);
    flush();
    await sleep(3500);
    runScript();
  }

  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      io.disconnect();
      runScript();
    }
  }, { threshold: 0.25 });

  io.observe(codeBody);
})();

// ── Projects Loading ──
async function loadMainProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  try {
    const res = await fetch('/api/projects/public');
    const projects = await res.json();

    if (projects.length === 0) {
      grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: #666;">No projects added yet. Visit /admin.html to add some!</p>';
      return;
    }

    grid.innerHTML = '';
    projects.forEach(p => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.setAttribute('data-animate', '');
      card.innerHTML = `
        <div class="project-preview">
          <iframe src="${p.url}" loading="lazy" scrolling="no"></iframe>
        </div>
        <div class="project-info">
          <h3>${p.name}</h3>
          <a href="${p.url}" target="_blank" class="project-link">Visit Site ↗</a>
        </div>
      `;
      grid.appendChild(card);
    });

    // Re-trigger observer for new elements
    if (window.revealObserver) {
      document.querySelectorAll('.project-card[data-animate]').forEach(el => {
        window.revealObserver.observe(el);
      });
    }
  } catch (err) {
    console.error('Failed to load projects:', err);
  }
}

// ── Professional Connectivity Animation (Neural Net) ──
(function() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  const particleCount = 60;
  const connectionDistance = 150;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.size = Math.random() * 2 + 1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
  }

  function init() {
    resize();
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#6cf2cf';
    
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      p1.update();

      ctx.beginPath();
      ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
      ctx.fillStyle = accentColor;
      ctx.globalAlpha = 0.5;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDistance) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = accentColor;
          ctx.globalAlpha = (1 - dist / connectionDistance) * 0.2;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  init();
  draw();
})();

document.addEventListener('DOMContentLoaded', () => {
  loadMainProjects();
});
