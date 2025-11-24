/**
 * Security Manager
 * Implements comprehensive security measures for form submissions
 */

class SecurityManager {
  constructor() {
    this.honeypot = null;
    this.csrfToken = null;
    this.sessionStart = Date.now();
    this.submissionTimestamps = [];
    this.blockedIPs = new Set();
    
    this.config = {
      minFormFillTime: 3000, // Minimum time to fill form (ms) - bot detection
      maxFormFillTime: 1800000, // Maximum time (30 min) - session timeout
      maxSubmissionsPerHour: 3,
      enableHoneypot: true,
      enableCSRF: true,
      enableFingerprinting: true
    };
  }

  /**
   * Initialize security measures
   */
  async init() {
    this.generateCSRFToken();
    this.addHoneypot();
    this.setupSecurityHeaders();
    this.monitorDevTools();
    console.log('[Security] Security manager initialized');
  }

  /**
   * Generate CSRF token for form protection
   */
  generateCSRFToken() {
    if (!this.config.enableCSRF) return;
    
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    this.csrfToken = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    
    // Store in sessionStorage (not localStorage to limit to session)
    sessionStorage.setItem('csrf_token', this.csrfToken);
  }

  /**
   * Add honeypot field to form (hidden field that bots will fill)
   */
  addHoneypot() {
    if (!this.config.enableHoneypot) return;
    
    const form = document.querySelector('#inqForm');
    if (!form) return;

    // Create honeypot field
    const honeypot = document.createElement('input');
    honeypot.type = 'text';
    honeypot.name = 'website';
    honeypot.id = 'website';
    honeypot.autocomplete = 'off';
    honeypot.tabIndex = -1;
    honeypot.setAttribute('aria-hidden', 'true');
    honeypot.style.position = 'absolute';
    honeypot.style.left = '-9999px';
    honeypot.style.width = '1px';
    honeypot.style.height = '1px';
    honeypot.style.opacity = '0';
    
    form.appendChild(honeypot);
    this.honeypot = honeypot;
  }

  /**
   * Setup security headers recommendation
   */
  setupSecurityHeaders() {
    // Log recommendations for server-side implementation
    console.log('[Security] Recommended HTTP headers for server configuration:');
    console.log('Content-Security-Policy: default-src \'self\'; script-src \'self\' https://www.google.com https://www.gstatic.com; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; font-src \'self\' https://fonts.gstatic.com; img-src \'self\' data: https:; connect-src \'self\' https://*.googleapis.com https://*.firebaseio.com;');
    console.log('X-Content-Type-Options: nosniff');
    console.log('X-Frame-Options: DENY');
    console.log('X-XSS-Protection: 1; mode=block');
    console.log('Referrer-Policy: strict-origin-when-cross-origin');
    console.log('Permissions-Policy: geolocation=(), microphone=(), camera=()');
  }

  /**
   * Monitor for DevTools (basic bot/scraper detection)
   */
  monitorDevTools() {
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        // DevTools might be open - log for analytics
        console.warn('[Security] Development tools detected');
      }
    };

    window.addEventListener('resize', detectDevTools);
    detectDevTools();
  }

  /**
   * Validate form submission security
   * @param {Object} formData - Form data to validate
   * @returns {Object} Validation result
   */
  async validateSubmission(formData) {
    const errors = [];

    // Check honeypot
    if (this.config.enableHoneypot && this.honeypot?.value) {
      errors.push('Bot detected (honeypot triggered)');
      this.logSecurityEvent('honeypot_triggered', formData);
    }

    // Check form fill time
    const fillTime = Date.now() - this.sessionStart;
    if (fillTime < this.config.minFormFillTime) {
      errors.push('Form submitted too quickly');
      this.logSecurityEvent('fast_submission', { fillTime });
    }

    if (fillTime > this.config.maxFormFillTime) {
      errors.push('Session expired. Please refresh and try again.');
      this.logSecurityEvent('session_expired', { fillTime });
    }

    // Check rate limiting
    const rateLimitCheck = this.checkRateLimit();
    if (!rateLimitCheck.allowed) {
      errors.push(`Too many submissions. Please wait ${rateLimitCheck.waitTime} minutes.`);
      this.logSecurityEvent('rate_limit_exceeded', rateLimitCheck);
    }

    // Validate reCAPTCHA
    const recaptchaValid = await this.validateRecaptcha();
    if (!recaptchaValid) {
      errors.push('Please complete the CAPTCHA verification');
      this.logSecurityEvent('captcha_failed', {});
    }

    // Validate CSRF token
    if (this.config.enableCSRF) {
      const submittedToken = sessionStorage.getItem('csrf_token');
      if (submittedToken !== this.csrfToken) {
        errors.push('Invalid security token. Please refresh the page.');
        this.logSecurityEvent('csrf_mismatch', {});
      }
    }

    // Check for suspicious patterns
    const suspiciousCheck = this.detectSuspiciousPatterns(formData);
    if (suspiciousCheck.isSuspicious) {
      errors.push('Suspicious activity detected');
      this.logSecurityEvent('suspicious_pattern', suspiciousCheck.reasons);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check rate limiting
   * @returns {Object} Rate limit status
   */
  checkRateLimit() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    // Remove old submissions
    this.submissionTimestamps = this.submissionTimestamps.filter(t => t > oneHourAgo);

    if (this.submissionTimestamps.length >= this.config.maxSubmissionsPerHour) {
      const oldestSubmission = Math.min(...this.submissionTimestamps);
      const waitTime = Math.ceil((oldestSubmission + (60 * 60 * 1000) - now) / (60 * 1000));
      
      return {
        allowed: false,
        waitTime
      };
    }

    this.submissionTimestamps.push(now);
    return { allowed: true };
  }

  /**
   * Validate reCAPTCHA response
   * @returns {Promise<boolean>} Validation result
   */
  async validateRecaptcha() {
    // Check if reCAPTCHA script is present
    const recaptchaScript = document.querySelector('script[src*="recaptcha/api.js"]');
    if (!recaptchaScript) {
      alert('reCAPTCHA script failed to load. Please check your network or browser settings.');
      console.warn('[Security] reCAPTCHA script element not found');
      return false;
    }

    if (typeof grecaptcha === 'undefined') {
      alert('reCAPTCHA failed to initialize. Please disable browser extensions or try a different network.');
      console.warn('[Security] reCAPTCHA not loaded');
      return false;
    }

    try {
      const response = grecaptcha.getResponse();
      if (!response || response.length === 0) {
        return false;
      }
      // Note: Actual server-side verification should be done on backend
      // This is client-side check only
      return true;
    } catch (error) {
      alert('An error occurred during reCAPTCHA validation.');
      console.error('[Security] reCAPTCHA validation error:', error);
      return false;
    }
  }

  /**
   * Detect suspicious patterns in form data
   * @param {Object} data - Form data
   * @returns {Object} Detection result
   */
  detectSuspiciousPatterns(data) {
    const reasons = [];

    // Check for SQL injection patterns
    const sqlPattern = /(\bUNION\b|\bSELECT\b|\bDROP\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b)/i;
    Object.values(data).forEach(value => {
      if (typeof value === 'string' && sqlPattern.test(value)) {
        reasons.push('SQL injection attempt detected');
      }
    });

    // Check for XSS patterns
    const xssPattern = /<script|javascript:|onerror=|onclick=/i;
    Object.values(data).forEach(value => {
      if (typeof value === 'string' && xssPattern.test(value)) {
        reasons.push('XSS attempt detected');
      }
    });

    // Check for excessive special characters
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const specialCharCount = (value.match(/[^a-zA-Z0-9\s.,!?@-]/g) || []).length;
        if (specialCharCount > value.length * 0.3) {
          reasons.push(`Excessive special characters in ${key}`);
        }
      }
    });

    // Check for identical repeated values
    const values = Object.values(data);
    const uniqueValues = new Set(values.filter(v => typeof v === 'string' && v.length > 2));
    if (values.length > 3 && uniqueValues.size === 1) {
      reasons.push('Suspicious repeated values');
    }

    return {
      isSuspicious: reasons.length > 0,
      reasons
    };
  }

  /**
   * Generate browser fingerprint for tracking
   * @returns {Promise<string>} Browser fingerprint hash
   */
  async generateFingerprint() {
    if (!this.config.enableFingerprinting) return 'disabled';

    try {
      const components = [
        navigator.userAgent,
        navigator.language,
        navigator.platform,
        navigator.hardwareConcurrency || 0,
        new Date().getTimezoneOffset(),
        screen.width + 'x' + screen.height + 'x' + screen.colorDepth,
        !!window.sessionStorage,
        !!window.localStorage,
        !!window.indexedDB
      ].join('|');

      const encoder = new TextEncoder();
      const data = encoder.encode(components);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
    } catch (error) {
      console.error('[Security] Fingerprinting error:', error);
      return 'error';
    }
  }

  /**
   * Log security events for monitoring
   * @param {string} eventType - Type of security event
   * @param {Object} details - Event details
   */
  logSecurityEvent(eventType, details) {
    const event = {
      type: eventType,
      timestamp: new Date().toISOString(),
      details,
      userAgent: navigator.userAgent.substring(0, 200)
    };

    console.warn('[Security Event]', event);

    // In production, send to security monitoring service
    // Example: sendToSecurityMonitoring(event);
  }

  /**
   * Sanitize and encode output to prevent XSS
   * @param {string} str - String to sanitize
   * @returns {string} Sanitized string
   */
  sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Export security manager
export const securityManager = new SecurityManager();
