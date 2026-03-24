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

/* ─── HERO ANIMATION ────────────────────────────────────────────── */
function initHero() {
  const hero      = $('.hero');
  const video     = $('.hero__intro-animation');
  const content   = $('.hero__content');
  const title     = $('.hero__title');

  if (!hero) return;

  const revealContent = () => {
    content?.classList.add('visible');
    if (title) {
      title.classList.add('animate-on-load', 'fade-in-up');
    }
  };

  // No video → skip immediately
  if (!video) {
    hero.classList.add('skip-animation');
    revealContent();
    return;
  }

  const played = sessionStorage.getItem('buraq-hero-played');

  if (played) {
    // Skip on repeat visits within the session
    hero.classList.add('skip-animation');
    video.style.display = 'none';
    revealContent();
    return;
  }

  // First visit — play animation
  sessionStorage.setItem('buraq-hero-played', '1');
  hero.classList.add('with-animation');
  video.loop = false;
  video.removeAttribute('loop');

  // After ~4.5s fade out the intro video, then reveal content
  setTimeout(() => {
    video.classList.add('fade-out');
    setTimeout(revealContent, 1200);
  }, 4500);
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
  if (el) el.textContent = new Date().getFullYear();
}

/* ─── BOOT ───────────────────────────────────────────────────────── */
function init() {
  initProgress();
  initNav();
  initHero();
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
