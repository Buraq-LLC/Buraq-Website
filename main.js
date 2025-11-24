// Configuration constants
const CONFIG = {
  ANIMATION_DELAY: 100,
  FADE_OUT_DELAY: 4500,
  HERO_REVEAL_DELAY: 1500,
  SCROLL_OFFSET: 80,
  REVEAL_THRESHOLD: 100,
  DEBUG_MODE: false
};

// Utility functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const log = (...args) => CONFIG.DEBUG_MODE && console.log(...args);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Hero animation controller
class HeroAnimationController {
  constructor() {
    this.elements = {
      heroContent: $('.hero__content'),
      introAnimation: $('.hero__intro-animation'),
      siteNav: $('.site-nav')
    };
    this.initialized = false;
  }

  init() {
    if (this.initialized || !this.validateElements()) return;
    
    this.showNavigation();
    this.configureVideo();
    this.scheduleAnimationSequence();
    this.initialized = true;
    log('HeroAnimationController initialized');
  }

  validateElements() {
    const { heroContent, introAnimation, siteNav } = this.elements;
    return heroContent && introAnimation && siteNav;
  }

  showNavigation() {
    this.elements.siteNav?.classList.add('visible');
  }

  configureVideo() {
    const video = this.elements.introAnimation;
    if (!video) return;
    
    video.loop = false;
    video.removeAttribute('loop');
    
    requestAnimationFrame(() => {
      setTimeout(() => {
        video.classList.add('loaded');
        log('Animation loaded');
      }, CONFIG.ANIMATION_DELAY);
    });
  }

  scheduleAnimationSequence() {
    setTimeout(() => {
      this.fadeOutAnimation();
      setTimeout(() => this.showHeroContent(), CONFIG.HERO_REVEAL_DELAY);
    }, CONFIG.FADE_OUT_DELAY);
  }

  fadeOutAnimation() {
    this.elements.introAnimation?.classList.add('fade-out');
    log('Animation fading out');
  }

  showHeroContent() {
    this.elements.heroContent?.classList.add('visible');
    log('Hero content visible');
  }
}

// Scroll progress controller
class ScrollProgressController {
  constructor() {
    this.progressBar = $('.scroll-progress');
    this.progressSpan = $('.scroll-progress span');
    this.rafId = null;
    this.ticking = false;
  }

  init() {
    if (!this.progressBar || !this.progressSpan) {
      log('Scroll progress elements not found');
      return;
    }

    this.initializeStyles();
    this.attachScrollListener();
    this.update();
  }

  initializeStyles() {
    this.progressSpan.style.width = '0%';
    this.progressBar.style.display = 'block';
    this.progressBar.style.visibility = 'visible';
  }

  attachScrollListener() {
    window.addEventListener('scroll', () => {
      if (!this.ticking) {
        this.rafId = requestAnimationFrame(() => this.update());
        this.ticking = true;
      }
    }, { passive: true });
  }

  update() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
    
    this.progressSpan.style.width = `${clamp(scrollPercentage, 0, 100)}%`;
    this.ticking = false;
  }
}

// Scroll reveal controller
class ScrollRevealController {
  constructor() {
    this.elements = Array.from($$('[data-reveal]'));
    this.ticking = false;
    this.observer = null;
  }

  init() {
    if (!this.elements.length) return;

    // Use Intersection Observer for better performance
    if ('IntersectionObserver' in window) {
      this.initIntersectionObserver();
    } else {
      this.initScrollListener();
    }
  }

  initIntersectionObserver() {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          this.observer.unobserve(entry.target);
        }
      });
    }, options);

    this.elements.forEach(el => this.observer.observe(el));
  }

  initScrollListener() {
    const revealOnScroll = () => {
      if (!this.ticking) {
        requestAnimationFrame(() => {
          this.checkVisibility();
          this.ticking = false;
        });
        this.ticking = true;
      }
    };

    window.addEventListener('scroll', revealOnScroll, { passive: true });
    this.checkVisibility();
  }

  checkVisibility() {
    const windowHeight = window.innerHeight;
    this.elements.forEach(element => {
      if (element.classList.contains('active')) return;
      
      const elementTop = element.getBoundingClientRect().top;
      if (elementTop < windowHeight - CONFIG.REVEAL_THRESHOLD) {
        element.classList.add('active');
      }
    });
  }
}

// Command palette controller
class CommandPaletteController {
  constructor() {
    this.items = $$('.command-palette__item');
    this.preview = $('.spotlight__preview img');
  }

  init() {
    if (!this.items.length) return;

    this.items.forEach(item => {
      item.addEventListener('click', () => this.selectItem(item));
    });
  }

  selectItem(selectedItem) {
    this.items.forEach(item => item.classList.remove('is-active'));
    selectedItem.classList.add('is-active');
    
    const commandText = selectedItem.querySelector('strong')?.textContent;
    log('Selected command:', commandText);
  }
}

// Mobile menu controller
class MobileMenuController {
  constructor() {
    this.toggle = $('.site-nav__toggle');
    this.menu = $('.mobile-menu');
  }

  init() {
    if (!this.toggle || !this.menu) return;

    this.toggle.addEventListener('click', () => this.toggleMenu());
  }

  toggleMenu() {
    const isExpanded = this.toggle.getAttribute('aria-expanded') === 'true';
    this.toggle.setAttribute('aria-expanded', !isExpanded);
    this.menu.setAttribute('aria-hidden', isExpanded);
  }

  close() {
    if (!this.toggle || !this.menu) return;
    this.toggle.setAttribute('aria-expanded', 'false');
    this.menu.setAttribute('aria-hidden', 'true');
  }
}

// Form controller with validation and security
class FormController {
  constructor() {
    this.form = $('#inqForm');
    this.message = $('#formMsg');
    this.isSubmitting = false;
  }

  init() {
    if (!this.form || !this.message) return;

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const data = this.getFormData();
    
    if (!this.validateData(data)) {
      this.showMessage('Please fill in all required fields.', 'error');
      this.isSubmitting = false;
      return;
    }

    this.showMessage('Submitting...', 'loading');

    try {
      await this.submitData(data);
      this.showMessage('Thank you for your inquiry. We will be in touch shortly.', 'success');
      this.form.reset();
      this.resetCaptcha();
    } catch (error) {
      log('Form submission error:', error);
      this.showMessage('There was an error submitting your inquiry. Please try again.', 'error');
    } finally {
      this.isSubmitting = false;
    }
  }

  getFormData() {
    const formData = new FormData(this.form);
    return {
      firstName: this.sanitize(formData.get('firstName')),
      lastName: this.sanitize(formData.get('lastName')),
      email: this.sanitize(formData.get('email')),
      org: this.sanitize(formData.get('org')),
      title: this.sanitize(formData.get('title') || ''),
      country: this.sanitize(formData.get('country')),
      notes: this.sanitize(formData.get('notes'))
    };
  }

  sanitize(value) {
    if (typeof value !== 'string') return value;
    return value.trim().replace(/[<>]/g, '');
  }

  validateData(data) {
    const required = ['firstName', 'lastName', 'email', 'org', 'country'];
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    const hasRequired = required.every(field => data[field]);
    const validEmail = emailPattern.test(data.email);
    
    return hasRequired && validEmail;
  }

  async submitData(data) {
    if (typeof window.saveInquiry !== 'function') {
      throw new Error('Firebase not initialized');
    }

    const result = await window.saveInquiry(data);
    
    if (!result.ok) {
      throw new Error(result.error || 'Submission failed');
    }

    return result;
  }

  showMessage(text, type) {
    const colors = {
      loading: '#60a5fa',
      success: '#10b981',
      error: '#ef4444'
    };

    this.message.textContent = text;
    this.message.style.color = colors[type] || colors.loading;
  }

  resetCaptcha() {
    if (typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
      try {
        grecaptcha.reset();
      } catch (e) {
        log('reCAPTCHA reset error:', e);
      }
    }
  }
}

// Smooth scroll controller
class SmoothScrollController {
  constructor() {
    this.links = $$('a[href^="#"]');
    this.mobileMenu = null;
  }

  init(mobileMenuController) {
    this.mobileMenu = mobileMenuController;
    
    this.links.forEach(link => {
      link.addEventListener('click', (e) => this.handleClick(e, link));
    });
  }

  handleClick(e, link) {
    const targetId = link.getAttribute('href');
    if (targetId === '#') return;

    const target = $(targetId);
    if (!target) return;

    e.preventDefault();
    
    const targetPosition = target.offsetTop - CONFIG.SCROLL_OFFSET;
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });

    this.mobileMenu?.close();
  }
}

// Utility controller for miscellaneous tasks
class UtilityController {
  static updateFooterYear() {
    const yearElement = $('[data-year]');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }
}

// Main application controller
class App {
  constructor() {
    this.controllers = {
      hero: new HeroAnimationController(),
      scrollProgress: new ScrollProgressController(),
      scrollReveal: new ScrollRevealController(),
      commandPalette: new CommandPaletteController(),
      mobileMenu: new MobileMenuController(),
      form: new FormController(),
      smoothScroll: new SmoothScrollController()
    };
  }

  init() {
    log('Initializing Buraq AI Website');
    
    // Initialize all controllers
    this.controllers.hero.init();
    this.controllers.scrollProgress.init();
    this.controllers.scrollReveal.init();
    this.controllers.commandPalette.init();
    this.controllers.mobileMenu.init();
    this.controllers.form.init();
    this.controllers.smoothScroll.init(this.controllers.mobileMenu);
    
    // Utility functions
    UtilityController.updateFooterYear();
    
    log('All controllers initialized');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new App().init());
} else {
  new App().init();
}
