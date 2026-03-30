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

/* ─── HERO CANVAS — binary data rain + mouse field + glitch ─────── */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Character set: binary heavy, occasional hex/katakana for texture
  const CHARS = '01010101001101001101100101110100110100101!@#$%^<>/\\|[]{}~*';
  const FS = 13;          // font size / column width (px)
  const SPEED_BASE = 0.35;
  const SPEED_VAR  = 0.3;
  const GLITCH_INTERVAL_MIN = 3500;
  const GLITCH_INTERVAL_MAX = 8000;

  let W, H, cols;
  let drops  = [];   // current y position of each column head (in rows)
  let speeds = [];   // fall speed of each column
  let glitchSlices = [];
  let nextGlitch = GLITCH_INTERVAL_MIN + Math.random() * (GLITCH_INTERVAL_MAX - GLITCH_INTERVAL_MIN);
  let elapsed = 0;
  let lastTs  = 0;
  let raf;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    cols = Math.floor(W / FS);
    // Preserve existing drops, extend or trim
    while (drops.length < cols) {
      drops.push(-(Math.random() * (H / FS)));
      speeds.push(SPEED_BASE + Math.random() * SPEED_VAR);
    }
    drops.length  = cols;
    speeds.length = cols;
  }

  const resizeObs = new ResizeObserver(resize);
  resizeObs.observe(canvas);
  resize();

  // Schedule random glitch events
  function triggerGlitch() {
    const count = 3 + Math.floor(Math.random() * 5);
    glitchSlices = [];
    for (let i = 0; i < count; i++) {
      glitchSlices.push({
        y:        Math.random() * H,
        h:        4 + Math.random() * 22,
        shiftX:   (Math.random() < 0.5 ? -1 : 1) * (8 + Math.random() * 36),
        life:     80 + Math.random() * 100,
        age:      0
      });
    }
    nextGlitch = GLITCH_INTERVAL_MIN + Math.random() * (GLITCH_INTERVAL_MAX - GLITCH_INTERVAL_MIN);
    elapsed = 0;
  }

  function draw(ts) {
    const dt = ts - lastTs || 16;
    lastTs = ts;
    elapsed += dt;

    // Trigger glitch
    if (elapsed >= nextGlitch) triggerGlitch();

    // Clear to solid background each frame — no motion blur trail
    ctx.fillStyle = 'rgba(10,10,10,1)';
    ctx.fillRect(0, 0, W, H);

    ctx.font = `${FS}px "Chivo Mono", monospace`;
    ctx.textBaseline = 'top';

    for (let i = 0; i < cols; i++) {
      const x = i * FS;
      const y = Math.floor(drops[i]) * FS;
      if (y < -FS || y > H + FS) { drops[i]++; continue; }

      // Character — randomise each frame
      const ch = CHARS[Math.floor(Math.random() * CHARS.length)];

      // Uniform blue tint — no mouse proximity effect
      const a = 0.05 + Math.random() * 0.04;
      ctx.fillStyle = `rgba(41,151,255,${a})`;
      ctx.fillText(ch, x, y);

      // Head character — slightly brighter
      ctx.fillStyle = `rgba(200,230,255,${0.45 + Math.random() * 0.2})`;
      ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, y);

      // Advance column at constant speed
      drops[i] += speeds[i];

      if (drops[i] * FS > H && Math.random() > 0.975) {
        drops[i] = -(2 + Math.random() * 6);
        speeds[i] = SPEED_BASE + Math.random() * SPEED_VAR;
      }
    }

    // Apply glitch slices
    for (let s = glitchSlices.length - 1; s >= 0; s--) {
      const sl = glitchSlices[s];
      sl.age += dt;
      const t = sl.age / sl.life;            // 0 → 1
      if (t >= 1) { glitchSlices.splice(s, 1); continue; }

      const fade   = Math.sin(t * Math.PI);  // ease in & out
      const shift  = sl.shiftX * fade;
      const sy     = Math.max(0, Math.round(sl.y));
      const sh     = Math.min(Math.round(sl.h), H - sy);
      if (sh <= 0) continue;

      try {
        const img = ctx.getImageData(0, sy, W, sh);
        ctx.clearRect(0, sy, W, sh);

        // RGB fringe: red channel ahead, blue behind
        ctx.globalAlpha = 0.25 * fade;
        ctx.fillStyle   = '#ff003c';
        ctx.fillRect(shift - 4, sy, W, sh);
        ctx.fillStyle   = '#0096ff';
        ctx.fillRect(shift + 4, sy, W, sh);
        ctx.globalAlpha = 1;

        ctx.putImageData(img, Math.round(shift), sy);
      } catch (_) { /* cross-origin / zero-size guard */ }
    }

    raf = requestAnimationFrame(draw);
  }

  raf = requestAnimationFrame(draw);

  // Stop when hero leaves viewport to save GPU
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
