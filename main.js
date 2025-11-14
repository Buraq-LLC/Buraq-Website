import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const beamVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const beamFragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    float centerMask = 1.0 - smoothstep(0.18, 0.48, abs(uv.y - 0.5));
    float sweep = sin(uv.x * 6.0 + uTime * 1.8) * 0.25;
    float flicker = fbm(vec2(uv.x * 4.0 + uTime * 0.6, uv.y * 2.0 - uTime * 0.4));
    float ripple = fbm(vec2(uv.x * 8.0 - uTime * 0.8, uTime * 0.2));

    float intensity = clamp(centerMask * (0.4 + sweep + flicker * 0.8 + ripple * 0.6), 0.0, 1.0);
    float glow = pow(intensity, 1.4);

    vec3 base = vec3(0.16, 0.4, 0.95);
    vec3 highlight = vec3(0.45, 0.78, 1.0);
    vec3 color = mix(base, highlight, pow(intensity, 2.2));
    color += highlight * pow(centerMask, 5.0) * 0.9;

    float alpha = smoothstep(0.05, 0.48, intensity);

    gl_FragColor = vec4(color * glow, alpha);
  }
`;

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
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    canvas.style.display = 'none';
    return;
  }

  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (error) {
    console.warn('Hero beam disabled: WebGL unavailable.', error);
    canvas.remove();
    return;
  }

  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  const uniforms = {
    uTime: { value: 0 }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: beamVertexShader,
    fragmentShader: beamFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const geometry = new THREE.PlaneGeometry(2, 1, 1, 1);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const resize = () => {
    const { clientWidth, clientHeight } = canvas;
    if (clientWidth === 0 || clientHeight === 0) return;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(clientWidth, clientHeight, false);
    mesh.scale.set(clientWidth / clientHeight, 1, 1);
  };

  resize();
  window.addEventListener('resize', resize);

  const clock = new THREE.Clock();
  let animationId;

  const render = () => {
    uniforms.uTime.value += clock.getDelta();
    renderer.render(scene, camera);
    animationId = requestAnimationFrame(render);
  };

  render();

  const handleVisibility = () => {
    if (document.hidden) {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = undefined;
      }
    } else if (!animationId) {
      clock.getDelta();
      render();
    }
  };

  document.addEventListener('visibilitychange', handleVisibility);

  const cleanup = () => {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('beforeunload', cleanup);
    material.dispose();
    geometry.dispose();
    renderer.dispose();
  };

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
  setupWaitlistForm();
  setupYear();
});