const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function setupNav() {
  const nav = $('.site-nav');
  const navInner = $('.site-nav__inner');
  const toggle = $('.site-nav__toggle');
  const mobileMenu = $('#mobileMenu');
  if (!nav || !navInner || !toggle || !mobileMenu) return;

  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-open');
  };

  const openMenu = () => {
    toggle.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-open');
  };

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    if (expanded) closeMenu();
    else openMenu();
  });

  mobileMenu.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  });

  document.addEventListener('click', (event) => {
    if (!mobileMenu.contains(event.target) && !toggle.contains(event.target)) {
      closeMenu();
    }
  });

  let lastScrollY = window.scrollY;
  const handleScroll = () => {
    const current = window.scrollY;
    nav.classList.toggle('is-condensed', current > 40);
    const isScrollingUp = current < lastScrollY;
    nav.style.opacity = isScrollingUp || current < 40 ? '1' : '0.94';
    lastScrollY = current;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

function setupSmoothAnchors() {
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return;
      const target = document.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function setupScrollProgress() {
  const bar = $('.scroll-progress span');
  if (!bar) return;

  const update = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const progress = scrollHeight <= clientHeight ? 0 : scrollTop / (scrollHeight - clientHeight);
    bar.style.width = `${clamp(progress, 0, 1) * 100}%`;
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

function setupHeroBeam() {
  const canvas = document.getElementById('heroBeam');
  const heroSection = document.getElementById('hero');
  if (!canvas || !heroSection) return;

  const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotionQuery.matches) {
    canvas.remove();
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = 256;
  noiseCanvas.height = 256;
  const noiseCtx = noiseCanvas.getContext('2d');

  const regenerateNoise = () => {
    if (!noiseCtx) return;
    const imageData = noiseCtx.createImageData(noiseCanvas.width, noiseCanvas.height);
    const { data } = imageData;
    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 255;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 36 + Math.random() * 20;
    }
    noiseCtx.putImageData(imageData, 0, 0);
  };

  regenerateNoise();

  const state = {
    pixelRatio: 1,
    width: 0,
    height: 0
  };

  const resize = () => {
    const rect = heroSection.getBoundingClientRect();
    const displayWidth = canvas.clientWidth || rect.width;
    const displayHeight = canvas.clientHeight || Math.max(200, rect.height * 0.5);
    state.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    state.width = displayWidth;
    state.height = displayHeight;
    canvas.width = displayWidth * state.pixelRatio;
    canvas.height = displayHeight * state.pixelRatio;
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });

  let animationId;
  let lastNoiseUpdate = 0;

  const render = (time) => {
    animationId = requestAnimationFrame(render);

    const { width, height, pixelRatio } = state;
    if (width === 0 || height === 0) return;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const t = time * 0.001;
    const baseY = height * (0.38 + Math.sin(t * 0.42) * 0.04);
    const beamHeight = height * 0.32;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.filter = 'blur(72px)';
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    const sweep = Math.sin(t * 0.8) * 0.06;
    gradient.addColorStop(0.0, 'rgba(255, 40, 70, 0)');
    gradient.addColorStop(0.25 + sweep, 'rgba(255, 60, 80, 0.25)');
    gradient.addColorStop(0.5, 'rgba(255, 120, 140, 0.55)');
    gradient.addColorStop(0.75 - sweep, 'rgba(255, 60, 80, 0.28)');
    gradient.addColorStop(1.0, 'rgba(255, 40, 70, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, baseY - beamHeight / 2, width, beamHeight);

    ctx.filter = 'blur(120px)';
    ctx.globalAlpha = 0.55 + Math.sin(t * 1.3) * 0.1;
    ctx.fillStyle = 'rgba(255, 95, 120, 0.6)';
    ctx.fillRect(0, baseY - beamHeight * 0.4, width, beamHeight * 0.8);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.filter = 'blur(26px)';
    ctx.globalAlpha = 0.5;
    const pulseX = (Math.sin(t * 0.6) * 0.5 + 0.5) * width;
    const pulseRadius = width * 0.35;
    const pulse = ctx.createRadialGradient(pulseX, baseY, pulseRadius * 0.1, pulseX, baseY, pulseRadius);
    pulse.addColorStop(0.0, 'rgba(255, 150, 190, 0.9)');
    pulse.addColorStop(1.0, 'rgba(255, 60, 90, 0)');
    ctx.fillStyle = pulse;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    if (noiseCtx && time - lastNoiseUpdate > 90) {
      regenerateNoise();
      lastNoiseUpdate = time;
    }

    if (noiseCtx) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.12;
      ctx.filter = 'blur(0)';
      ctx.drawImage(noiseCanvas, 0, 0, width, height);
      ctx.restore();
    }
  };

  animationId = requestAnimationFrame(render);

  const handleVisibility = () => {
    if (document.hidden) {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = undefined;
      }
    } else if (!animationId) {
      lastNoiseUpdate = performance.now();
      animationId = requestAnimationFrame(render);
    }
  };

  function cleanup() {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', handleVisibility);
    prefersReducedMotionQuery.removeEventListener('change', handleMotionChange);
    window.removeEventListener('beforeunload', cleanup);
  }

  function handleMotionChange(event) {
    if (!event.matches) {
      resize();
      animationId = requestAnimationFrame(render);
    } else {
      cleanup();
      canvas.remove();
    }
  }

  document.addEventListener('visibilitychange', handleVisibility);
  prefersReducedMotionQuery.addEventListener('change', handleMotionChange);
  window.addEventListener('beforeunload', cleanup);
}

function setupHeroSlides() {
  const slidesWrap = document.querySelector('[data-hero-slides]');
  if (!slidesWrap) return;

  const slides = $$('.device-slide', slidesWrap);
  if (!slides.length) return;

  const dotsWrap = $('.device-frame__dots');
  const prev = $('.device-frame__control[data-prev]');
  const next = $('.device-frame__control[data-next]');

  slides.forEach((slide) => {
    const img = slide.dataset.image;
    if (img) {
      slide.style.backgroundImage = `url("${img}")`;
    }
  });

  let index = slides.findIndex((slide) => slide.classList.contains('is-active'));
  if (index < 0) index = 0;
  let timer = null;
  const interval = 5200;

  const dots = slides.map((_, idx) => {
    if (!dotsWrap) return null;
    const dot = document.createElement('span');
    dot.setAttribute('aria-hidden', 'true');
    dot.addEventListener('click', () => goTo(idx, true));
    dotsWrap.append(dot);
    return dot;
  });

  const activate = (i) => {
    slides.forEach((slide, idx) => {
      slide.classList.toggle('is-active', idx === i);
    });
    dots.forEach((dot, idx) => {
      if (dot) dot.classList.toggle('is-active', idx === i);
    });
  };

  const goTo = (i, user = false) => {
    index = (i + slides.length) % slides.length;
    activate(index);
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(nextSlide, user ? interval * 1.3 : interval);
  };

  const prevSlide = () => goTo(index - 1, true);
  const nextSlide = () => goTo(index + 1);

  prev?.addEventListener('click', prevSlide);
  next?.addEventListener('click', () => goTo(index + 1, true));

  goTo(index);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (timer) window.clearTimeout(timer);
      timer = null;
    } else if (!timer) {
      timer = window.setTimeout(nextSlide, interval);
    }
  });
}

function setupReveal() {
  const revealables = $$('[data-reveal]');
  if (!revealables.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealables.forEach((node, idx) => {
    node.style.transitionDelay = `${Math.min(idx * 60, 320)}ms`;
    observer.observe(node);
  });
}

function setupTilt() {
  const tilted = $$('[data-tilt]');
  if (!tilted.length) return;

  tilted.forEach((panel) => {
    let raf = null;

    const update = (event) => {
      const rect = panel.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * 8;
      const rotateY = (x - 0.5) * 12;
      panel.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const reset = () => {
      panel.style.transform = '';
    };

    panel.addEventListener('pointermove', (event) => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => update(event));
    });

    panel.addEventListener('pointerleave', () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(reset);
    });
  });
}

function setupExtensionFilters() {
  const pills = $$('[data-filter]');
  const cards = $$('.extension-card');
  if (!pills.length || !cards.length) return;

  const applyFilter = (filter) => {
    cards.forEach((card) => {
      const category = card.dataset.category || 'all';
      const visible = filter === 'all' || category.includes(filter);
      card.style.display = visible ? '' : 'none';
    });
  };

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      pills.forEach((p) => p.classList.toggle('is-active', p === pill));
      applyFilter(pill.dataset.filter || 'all');
    });
  });
}

function setupCarousel() {
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) return;

  const track = $('.carousel__track', carousel);
  const prev = $('.carousel__arrow--prev', carousel);
  const next = $('.carousel__arrow--next', carousel);
  if (!track) return;

  const scrollByCard = (direction) => {
    const card = track.querySelector('.extension-card');
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gridColumnGap || '24');
    const width = card ? card.getBoundingClientRect().width : 300;
    track.scrollBy({ left: (width + gap) * direction, behavior: 'smooth' });
  };

  prev?.addEventListener('click', () => scrollByCard(-1));
  next?.addEventListener('click', () => scrollByCard(1));

  track.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaX) < Math.abs(event.deltaY)) return;
    event.preventDefault();
    track.scrollBy({ left: event.deltaX, behavior: 'smooth' });
  }, { passive: false });
}

function setupSpotlightPreview() {
  const list = document.querySelector('.command-palette__list');
  const target = document.querySelector('[data-spotlight-preview-target]');
  if (!list || !target) return;

  const items = Array.from(list.querySelectorAll('.command-palette__item'));
  if (!items.length) return;

  const activate = (button) => {
    items.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-selected', String(isActive));
      item.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    const type = button.dataset.previewType || 'image';
    const src = button.dataset.previewSrc;
    const alt = button.dataset.previewAlt || '';

    target.innerHTML = '';

    if (!src) return;

    if (type === 'video') {
      const video = document.createElement('video');
      video.src = src;
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('aria-label', alt);
      target.append(video);
    } else {
      const img = document.createElement('img');
      img.src = src;
      img.alt = alt;
      target.append(img);
    }
  };

  items.forEach((button) => {
    button.addEventListener('click', () => activate(button));
  });

  const initialActive = items.find((item) => item.classList.contains('is-active')) || items[0];
  if (initialActive) {
    activate(initialActive);
  }
}

function setupWaitlistForm() {
  const form = $('#waitlistForm');
  if (!form) return;
  const message = form.querySelector('.form-msg');
  if (!message) return;

  let busy = false;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy) return;

    if (!form.reportValidity()) {
      return;
    }

    busy = true;
    message.textContent = 'Submitting…';
    message.style.color = 'rgba(255, 255, 255, 0.7)';

    await new Promise((resolve) => setTimeout(resolve, 900));

    busy = false;
    message.textContent = 'Thanks! We just added you to the list.';
    message.style.color = '#7bffb3';
    form.reset();
  });
}

function setupYear() {
  const yearNode = document.querySelector('[data-year]');
  if (yearNode) {
    yearNode.dataset.year = String(new Date().getFullYear());
  }
}

window.addEventListener('DOMContentLoaded', () => {
  setupNav();
  setupSmoothAnchors();
  setupScrollProgress();
  setupHeroBeam();
  setupHeroSlides();
  setupReveal();
  setupTilt();
  setupExtensionFilters();
  setupCarousel();
  setupSpotlightPreview();
  setupWaitlistForm();
  setupYear();
});