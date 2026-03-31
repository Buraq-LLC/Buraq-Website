/**
 * Buraq AI — main.js
 * Clean, dependency-free. Works alongside firebase-init.js.
 */

'use strict';

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* ─── SCROLL PROGRESS ───────────────────────────────────────────── */
function initProgress() {
  const fill = $('.progress__fill');
  if (!fill) return;
  const update = () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    fill.style.width = total > 0 ? Math.min((scrolled / total) * 100, 100) + '%' : '0%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ─── NAV ───────────────────────────────────────────────────────── */
function initNav() {
  const nav      = $('#topnav');
  const burger   = $('.nav__burger');
  const sidenav  = $('#sidenav');
  const backdrop = $('.sidenav__backdrop');
  if (!nav || !burger || !sidenav) return;

  const open = () => {
    sidenav.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    backdrop?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    sidenav.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    backdrop?.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  burger.addEventListener('click', () => {
    sidenav.getAttribute('aria-hidden') === 'false' ? close() : open();
  });
  document.querySelector('.sidenav__close')?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  sidenav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

/* ─── HERO — reticle tracking + typing animation ────────────────── */
function initHero() {
  const hero = $('.hero');
  if (!hero) return;

  // ── Targeting reticle: dot follows mouse ──
  const trackDot  = document.getElementById('heroTrackDot');
  const reticleSVG = document.getElementById('heroReticleSVG');
  const MAX_OFFSET = 55; // max pixels the dot drifts from center

  if (trackDot && reticleSVG) {
    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
    let rafId;

    window.addEventListener('mousemove', e => {
      const rect = reticleSVG.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const norm = Math.min(dist / (window.innerWidth * 0.4), 1);
      targetX = (dx / dist) * norm * MAX_OFFSET;
      targetY = (dy / dist) * norm * MAX_OFFSET;
    }, { passive: true });

    // Smooth lerp so the dot glides gracefully
    function lerp(a, b, t) { return a + (b - a) * t; }
    function animateDot() {
      currentX = lerp(currentX, targetX, 0.06);
      currentY = lerp(currentY, targetY, 0.06);
      trackDot.setAttribute('transform', `translate(${currentX.toFixed(2)}, ${currentY.toFixed(2)})`);
      rafId = requestAnimationFrame(animateDot);
    }
    animateDot();

    // Stop when hero out of view
    new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) { cancelAnimationFrame(rafId); rafId = null; }
      else if (!rafId) animateDot();
    }).observe(hero);
  }

  // ── Typing animation ──
  const typingEl = document.getElementById('heroTyping');
  if (!typingEl) return;

  const PHRASES = [
    'analyzing satellite imagery...',
    'building evidence chain...',
    'detecting military assets...',
    'verifying humanitarian corridor...',
    'logging conflict incident...',
    'cross-referencing OSINT sources...',
    'flagging civilian threat zone...',
    'generating accountability report...',
  ];
  let pi = 0, ci = 0, deleting = false, pauseFrames = 0;

  function typeStep() {
    if (pauseFrames > 0) { pauseFrames--; setTimeout(typeStep, 40); return; }
    const phrase = PHRASES[pi];
    if (!deleting) {
      typingEl.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; pauseFrames = 60; }
      setTimeout(typeStep, 55 + Math.random() * 30);
    } else {
      typingEl.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % PHRASES.length; pauseFrames = 18; }
      setTimeout(typeStep, 28);
    }
  }
  setTimeout(typeStep, 800);
}

/* ─── SCROLL REVEAL ─────────────────────────────────────────────── */
function initReveal() {
  const elements = $$('.reveal');
  if (!elements.length || !('IntersectionObserver' in window)) {
    // Fallback: show everything
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -80px 0px',
  });

  elements.forEach(el => observer.observe(el));

  // Also handle legacy hero `.animate-on-scroll` elements
  const legacyEls = $$('.animate-on-scroll');
  const legacyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        legacyObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  legacyEls.forEach(el => legacyObserver.observe(el));
}

/* ─── SMOOTH SCROLL ─────────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 84; // account for fixed nav (64px) + breathing room
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ─── CONTACT FORM ──────────────────────────────────────────────── */
function initForm() {
  const form = $('#inqForm');
  const msg  = $('#formMsg');
  if (!form || !msg) return;

  const setMsg = (text, color) => {
    msg.textContent = text;
    msg.style.color = color;
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const btn = form.querySelector('.connect__btn');
    if (btn) btn.disabled = true;

    const raw = new FormData(form);
    const data = {
      firstName: raw.get('firstName')?.trim(),
      lastName:  raw.get('lastName')?.trim(),
      email:     raw.get('email')?.trim(),
      org:       raw.get('org')?.trim(),
      title:     raw.get('title')?.trim() || '',
      country:   raw.get('country')?.trim(),
      notes:     raw.get('notes')?.trim(),
    };

    // Validate required fields
    const required = ['firstName', 'lastName', 'email', 'org', 'country', 'notes'];
    for (const k of required) {
      if (!data[k]) {
        setMsg('Please fill in all required fields.', '#ff453a');
        if (btn) btn.disabled = false;
        return;
      }
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setMsg('Please enter a valid email address.', '#ff453a');
      if (btn) btn.disabled = false;
      return;
    }

    if (!window.grecaptcha || !window.grecaptcha.getResponse()) {
      setMsg('Please complete the reCAPTCHA.', '#ff453a');
      if (btn) btn.disabled = false;
      return;
    }

    setMsg('Sending…', '#2997ff');

    try {
      if (typeof window.saveInquiry !== 'function') {
        throw new Error('Service unavailable. Please try again later.');
      }
      const result = await window.saveInquiry(data);
      if (result && result.ok === false) throw new Error(result.error || 'Submission failed.');
      setMsg('Thank you. We\'ll be in touch shortly.', '#30d158');
      form.reset();
    } catch (err) {
      setMsg(err.message || 'Something went wrong. Please try again.', '#ff453a');
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

/* ─── FOOTER YEAR ───────────────────────────────────────────────── */
function initYear() {
  const el = $('[data-year]');
  if (el) el.textContent = '2025';
}

/* ─── HERO CANVAS — static etched matrix + glitch ───────────────── */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Binary-heavy char set — etched into the surface
  const CHARS = '010110010011010011011001011101001101001010110110100110';
  const FS = 13;  // cell size in px

  // Glitch timing
  const GLITCH_MIN = 2200;
  const GLITCH_MAX = 6000;

  let W, H, cols, rows;
  // Grid: each cell stores { char, alpha } — stable, not regenerated every frame
  let grid = [];
  let glitchSlices = [];
  let nextGlitch = GLITCH_MIN + Math.random() * (GLITCH_MAX - GLITCH_MIN);
  let elapsed = 0;
  let lastTs  = 0;
  let raf;

  // Build (or rebuild) the static character grid
  function buildGrid() {
    grid = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        grid.push({
          char:  CHARS[Math.floor(Math.random() * CHARS.length)],
          alpha: 0.06 + Math.random() * 0.13,  // each cell has its own fixed brightness
        });
      }
    }
  }

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    cols = Math.floor(W / FS);
    rows = Math.floor(H / FS);
    buildGrid();
  }

  const resizeObs = new ResizeObserver(resize);
  resizeObs.observe(canvas);
  resize();

  // Randomly mutate ~1.5% of cells per frame — gives subtle "alive" noise
  function flicker() {
    const n = Math.ceil(grid.length * 0.015);
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.random() * grid.length);
      grid[idx].char  = CHARS[Math.floor(Math.random() * CHARS.length)];
      // Occasional bright flare on a cell
      grid[idx].alpha = Math.random() < 0.05
        ? 0.55 + Math.random() * 0.3    // bright flare
        : 0.06 + Math.random() * 0.13;  // normal dim
    }
  }

  // Burst of glitch slices + optional full-row strobe
  function triggerGlitch() {
    const count = 4 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      glitchSlices.push({
        y:      Math.random() * H,
        h:      2 + Math.random() * 18,
        shiftX: (Math.random() < 0.5 ? -1 : 1) * (10 + Math.random() * 44),
        life:   60 + Math.random() * 130,
        age:    0,
      });
    }
    // Occasionally also strobe a wide band bright white
    if (Math.random() < 0.35) {
      glitchSlices.push({
        y:      Math.random() * H,
        h:      1 + Math.floor(Math.random() * 3),
        shiftX: 0,
        life:   40 + Math.random() * 60,
        age:    0,
        strobe: true,
      });
    }
    nextGlitch = GLITCH_MIN + Math.random() * (GLITCH_MAX - GLITCH_MIN);
    elapsed    = 0;
  }

  function draw(ts) {
    const dt = ts - lastTs || 16;
    lastTs   = ts;
    elapsed += dt;

    if (elapsed >= nextGlitch) triggerGlitch();

    // Solid clear — characters are etched, no trails
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    ctx.font         = `${FS}px "Chivo Mono", monospace`;
    ctx.textBaseline = 'top';

    // Mutate a tiny fraction of cells each frame
    flicker();

    // Draw the full static grid
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = grid[r * cols + c];
        if (!cell) continue;
        ctx.fillStyle = `rgba(41,151,255,${cell.alpha.toFixed(3)})`;
        ctx.fillText(cell.char, c * FS, r * FS);
      }
    }

    // Apply glitch slices on top
    for (let s = glitchSlices.length - 1; s >= 0; s--) {
      const sl = glitchSlices[s];
      sl.age += dt;
      const t = sl.age / sl.life;
      if (t >= 1) { glitchSlices.splice(s, 1); continue; }

      const fade = Math.sin(t * Math.PI);
      const sy   = Math.max(0, Math.round(sl.y));
      const sh   = Math.min(Math.round(sl.h), H - sy);
      if (sh <= 0) continue;

      if (sl.strobe) {
        // White strobe band — phosphor burn effect
        ctx.globalAlpha = 0.18 * fade;
        ctx.fillStyle   = '#ffffff';
        ctx.fillRect(0, sy, W, sh);
        ctx.globalAlpha = 1;
        continue;
      }

      try {
        const img   = ctx.getImageData(0, sy, W, sh);
        const shift = Math.round(sl.shiftX * fade);
        ctx.clearRect(0, sy, W, sh);
        // RGB chromatic fringe
        ctx.globalAlpha = 0.22 * fade;
        ctx.fillStyle   = '#ff003c';
        ctx.fillRect(shift - 5, sy, W, sh);
        ctx.fillStyle   = '#0096ff';
        ctx.fillRect(shift + 5, sy, W, sh);
        ctx.globalAlpha = 1;
        ctx.putImageData(img, shift, sy);
      } catch (_) { /* zero-size / cross-origin guard */ }
    }

    raf = requestAnimationFrame(draw);
  }

  raf = requestAnimationFrame(draw);

  // Pause animation when hero is off-screen
  const heroEl = document.getElementById('hero');
  if (heroEl) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!raf) raf = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(raf);
        raf = null;
      }
    }).observe(heroEl);
  }
}

/* ─── BOOT ───────────────────────────────────────────────────────── */
function init() {
  initProgress();
  initNav();
  initHero();
  initHeroCanvas();
  initReveal();
  initSmoothScroll();
  initForm();
  initYear();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
