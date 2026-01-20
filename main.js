  // Enhanced main.js with Apple-style animations

  // Import security manager
  import { securityManager } from './security-manager.js';

  // Configuration constants
  const CONFIG = {
    ANIMATION_DELAY: 100,
    FADE_OUT_DELAY: 4500,
    HERO_REVEAL_DELAY: 1500,
    SCROLL_OFFSET: 80,
    REVEAL_THRESHOLD: 100,
    DEBUG_MODE: true, // Enabled for debugging exploded view
    // Animation settings for Apple-like feel
    ANIMATION_DURATION: 0.8,
    ANIMATION_EASING: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Apple's easing
    STAGGER_DELAY: 100
  };

  // Utility functions
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);
  const log = (...args) => CONFIG.DEBUG_MODE && console.log(...args);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  // Enhanced hero animation controller with Apple-style animations
  class HeroAnimationController {
    constructor() {
      this.elements = {
        hero: $('.hero'),
        heroContent: $('.hero__content'),
        introAnimation: $('.hero__intro-animation'),
        bgVideo: $('.hero__bg-video'),
        siteNav: $('.site-nav'),
        heroTitle: $('.hero__title'),
        heroSubtitle: $('.hero__subtitle'),
        heroStats: $('.hero__stats'),
        heroActions: $('.hero__actions'),
        heroVersion: $('.hero__version')
      };
      this.initialized = false;
    }

    init() {
      if (this.initialized) return;
      
      // If no intro animation exists (like on pi-model page), skip directly
      if (!this.elements.introAnimation) {
        if (this.elements.hero && this.elements.heroContent) {
          this.elements.hero.classList.add('skip-animation');
          this.showNavigation();
          this.showHeroContent();
          log('No intro animation - showing hero immediately');
        }
        this.initialized = true;
        return;
      }
      
      if (!this.validateElements()) return;
      
      // Check if animation has already played this session
      const hasPlayedAnimation = sessionStorage.getItem('buraq-animation-played');
      
      if (hasPlayedAnimation === 'true') {
        // Skip animation, show content immediately
        this.skipAnimation();
      } else {
        // Play animation for first time this session
        this.playAnimation();
        sessionStorage.setItem('buraq-animation-played', 'true');
      }
      
      this.initialized = true;
      log('HeroAnimationController initialized');
    }

    skipAnimation() {
      // Add class to show background and content immediately
      if (this.elements.hero) {
        this.elements.hero.classList.add('skip-animation');
      }
      
      // Hide the intro animation immediately
      if (this.elements.introAnimation) {
        this.elements.introAnimation.style.display = 'none';
      }
      
      // Show navigation and content immediately
      this.showNavigation();
      this.showHeroContent();
      
      log('Animation skipped - already played this session');
    }

    playAnimation() {
      // Add class to trigger delayed animations
      if (this.elements.hero) {
        this.elements.hero.classList.add('with-animation');
      }
      
      this.showNavigation();
      this.configureVideo();
      this.scheduleAnimationSequence();
      log('Playing animation - first visit this session');
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
      log('Animation configured');
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
      
      // Fade in background video
      this.elements.bgVideo?.classList.add('visible');
      
      // Stagger the animation of hero elements
      if (this.elements.heroTitle) {
        this.elements.heroTitle.classList.add('animate-on-load', 'fade-in-up');
        this.elements.heroTitle.style.animationDelay = '0s';
        this.elements.heroTitle.style.animationDuration = `${CONFIG.ANIMATION_DURATION}s`;
        this.elements.heroTitle.style.animationTimingFunction = CONFIG.ANIMATION_EASING;
      }
      
      if (this.elements.heroSubtitle) {
        this.elements.heroSubtitle.classList.add('animate-on-load', 'fade-in-up');
        this.elements.heroSubtitle.style.animationDelay = '0.2s';
        this.elements.heroSubtitle.style.animationDuration = `${CONFIG.ANIMATION_DURATION}s`;
        this.elements.heroSubtitle.style.animationTimingFunction = CONFIG.ANIMATION_EASING;
      }
      
      if (this.elements.heroStats) {
        this.elements.heroStats.classList.add('animate-on-load', 'fade-in-up');
        this.elements.heroStats.style.animationDelay = '0.4s';
        this.elements.heroStats.style.animationDuration = `${CONFIG.ANIMATION_DURATION}s`;
        this.elements.heroStats.style.animationTimingFunction = CONFIG.ANIMATION_EASING;
      }
      
      if (this.elements.heroActions) {
        this.elements.heroActions.classList.add('animate-on-load', 'fade-in-up');
        this.elements.heroActions.style.animationDelay = '0.6s';
        this.elements.heroActions.style.animationDuration = `${CONFIG.ANIMATION_DURATION}s`;
        this.elements.heroActions.style.animationTimingFunction = CONFIG.ANIMATION_EASING;
      }
      
      if (this.elements.heroVersion) {
        this.elements.heroVersion.classList.add('animate-on-load', 'fade-in-up');
        this.elements.heroVersion.style.animationDelay = '0.8s';
        this.elements.heroVersion.style.animationDuration = `${CONFIG.ANIMATION_DURATION}s`;
        this.elements.heroVersion.style.animationTimingFunction = CONFIG.ANIMATION_EASING;
      }
      
      log('Hero content visible with staggered animations');
    }
  }

  // Enhanced scroll progress controller
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

  // Enhanced scroll reveal controller with Apple-style animations
  class ScrollRevealController {
    constructor() {
      this.elements = Array.from($$('[data-reveal], .animate-on-scroll'));
      this.ticking = false;
      this.observer = null;
    }

    init() {
      if (!this.elements.length) return;

      // Add Apple-style animation classes to elements
      this.enhanceElements();
      
      // Use Intersection Observer for better performance
      if ('IntersectionObserver' in window) {
        this.initIntersectionObserver();
      } else {
        this.initScrollListener();
      }
    }

    enhanceElements() {
      this.elements.forEach((element, index) => {
        // Add base animation class if not present
        if (!element.classList.contains('fade-in-up') && 
            !element.classList.contains('fade-in-left') && 
            !element.classList.contains('fade-in-right')) {
          element.classList.add('fade-in-up');
        }
        
        // Set animation properties
        element.style.animationDuration = `${CONFIG.ANIMATION_DURATION}s`;
        element.style.animationTimingFunction = CONFIG.ANIMATION_EASING;
        element.style.animationFillMode = 'both';
        
        // Add staggered delay for elements in the same section
        const parent = element.closest('section');
        if (parent) {
          const siblings = Array.from(parent.querySelectorAll('.animate-on-scroll'));
          const siblingIndex = siblings.indexOf(element);
          if (siblingIndex > 0) {
            element.style.animationDelay = `${siblingIndex * CONFIG.STAGGER_DELAY}ms`;
          }
        }
      });
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
      this.securityInitialized = false;
    }

    async init() {
      if (!this.form || !this.message) return;

      // Initialize security manager
      await securityManager.init();
      this.securityInitialized = true;

      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
      log('FormController initialized with security');
    }

    async handleSubmit(e) {
      e.preventDefault();
      
      if (this.isSubmitting) return;
      this.isSubmitting = true;

      const data = this.getFormData();
      
      // Basic validation
      if (!this.validateData(data)) {
        this.showMessage('Please fill in all required fields.', 'error');
        this.isSubmitting = false;
        return;
      }

      // Security validation
      if (this.securityInitialized) {
        const securityCheck = await securityManager.validateSubmission(data);
        if (!securityCheck.valid) {
          this.showMessage(securityCheck.errors[0], 'error');
          this.isSubmitting = false;
          return;
        }
      }

      this.showMessage('Submitting...', 'loading');

      try {
        // Add fingerprint for abuse tracking
        const fingerprint = await securityManager.generateFingerprint();
        data._fingerprint = fingerprint;
        data._timestamp = Date.now();
        
        await this.submitData(data);
        this.showMessage('Thank you for your inquiry. We will be in touch shortly.', 'success');
        this.form.reset();
        this.resetCaptcha();
        
        // Regenerate CSRF token after successful submission
        securityManager.generateCSRFToken();
      } catch (error) {
        log('Form submission error:', error);
        this.showMessage(error.message || 'There was an error submitting your inquiry. Please try again.', 'error');
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
        notes: this.sanitize(formData.get('notes')),
        recaptchaToken: this.getRecaptchaResponse()
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
      
      // Validate reCAPTCHA
      const recaptchaResponse = this.getRecaptchaResponse();
      if (!recaptchaResponse) {
        this.showMessage('Please complete the reCAPTCHA verification.', 'error');
        return false;
      }
      
      return hasRequired && validEmail;
    }

    getRecaptchaResponse() {
      if (typeof grecaptcha === 'undefined') {
        log('reCAPTCHA not loaded');
        // Allow submission if reCAPTCHA is not loaded (development mode)
        return 'dev-mode';
      }
      
      try {
        return grecaptcha.getResponse();
      } catch (error) {
        log('reCAPTCHA error:', error);
        return 'dev-mode';
      }
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

  /**
   * Threat Animation Controller
   * - 3 clear header states: "center" → "top" → "free"
   * - Word "Threats" goes blue → red; description fades at same time
   * - Header unsticks just before the first card would touch it
   */
  class ThreatAnimationController {
    constructor() {
      this.section = $('.threats');
      this.header = $('.threats__header');
      this.title = $('.threats__title');
      this.description = $('.threats__description');
      this.cards = Array.from($$('.threat-card'));
      this.firstCard = this.cards[0] || null;

      this.state = null; // 'center' | 'top' | 'free' – start null so first setState always applies
      this.ticking = false;
      this.lastScrollY = window.scrollY || 0;
    }

    init() {
      if (!this.section || !this.header || !this.title || !this.description || !this.cards.length) {
        return;
      }

      // Fade cards in as they enter viewport (no sticky cards)
      this.initCardObserver();

      window.addEventListener('scroll', () => this.onScroll(), { passive: true });
      window.addEventListener('resize', () => this.onScroll());

      // Initial pass
      this.update();
    }

    initCardObserver() {
      if (!('IntersectionObserver' in window)) {
        this.cards.forEach(card => card.classList.add('threat-card--visible'));
        return;
      }

      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('threat-card--visible');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.2,
          rootMargin: '0px 0px -10% 0px'
        }
      );

      this.cards.forEach(card => observer.observe(card));
    }

    onScroll() {
      if (!this.ticking) {
        requestAnimationFrame(() => {
          this.update();
          this.ticking = false;
        });
        this.ticking = true;
      }
    }

    update() {
      if (!this.section) return;

      const viewportHeight = window.innerHeight;
      const sectionRect = this.section.getBoundingClientRect();
      const sectionTop = sectionRect.top;
      const sectionBottom = sectionRect.bottom;

      // Section completely off-screen: reset
      if (sectionBottom <= 0 || sectionTop >= viewportHeight) {
        this.setState('center');
        this.setColorState(false);
        return;
      }

      // Simple trigger points
      const colorTrigger = viewportHeight * 0.35;
      const topTrigger = viewportHeight * 0.25;

      // Color change
      const shouldBeRed = sectionTop <= colorTrigger;
      this.setColorState(shouldBeRed);

      // Position logic - only switch to free when cards are very close
      let nextState = sectionTop <= topTrigger ? 'top' : 'center';
      
      // Only check for free state if we're already at top
      if (nextState === 'top' && this.firstCard) {
        const headerRect = this.header.getBoundingClientRect();
        const cardRect = this.firstCard.getBoundingClientRect();
        
        // Only go free when card is about to overlap
        if (cardRect.top <= headerRect.bottom + 10) {
          nextState = 'free';
        }
      }

      this.setState(nextState);
    }

    setState(newState) {
      if (this.state === newState) return;
      this.state = newState;

      this.header.classList.remove(
        'threats__header--center',
        'threats__header--top',
        'threats__header--free'
      );

      if (newState === 'center') {
        this.header.classList.add('threats__header--center');
        if (this.description) {
          this.description.classList.remove('is-hidden');
        }
      } else if (newState === 'top') {
        this.header.classList.add('threats__header--top');
        if (this.description) {
          this.description.classList.remove('is-hidden');
        }
      } else if (newState === 'free') {
        this.header.classList.add('threats__header--free');
        if (this.description) {
          this.description.classList.add('is-hidden');
        }
      }
    }

    setColorState(isRed) {
      if (!this.title) return;

      if (isRed) {
        this.title.classList.add('is-red');
      } else {
        this.title.classList.remove('is-red');
      }
    }
  }

  // Pi Module Exploded View Controller
  class PiModuleController {
    constructor() {
      this.explodedView = null;
      this.hasTriggered = false;
    }

    init() {
      // Look for exploded view on page
      this.explodedView = $('.exploded-view');
      
      if (!this.explodedView) {
        log('No exploded view found on this page');
        return;
      }

      log('Initializing Pi Module exploded view animation');
      
      // Ensure it starts collapsed and hidden
      this.explodedView.classList.remove('exploded');
      
      // Use Intersection Observer to trigger on scroll
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !this.hasTriggered) {
              this.hasTriggered = true;
              log('Exploded view is visible, triggering animation');
              // First make it visible, then trigger explosion after fade in
              this.explodedView.classList.add('exploded');
              log('Exploded view animation triggered - layers should pull apart now');
            }
          });
        },
        {
          threshold: 0.3,
          rootMargin: '0px'
        }
      );

      observer.observe(this.explodedView);
      log('Observer attached to exploded view');
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
        smoothScroll: new SmoothScrollController(),
        threatAnimation: new ThreatAnimationController(),
        piModule: new PiModuleController()
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
      this.controllers.threatAnimation.init();
      this.controllers.piModule.init();
      
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