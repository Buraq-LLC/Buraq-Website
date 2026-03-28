/**
 * Firebase Configuration Loader
 * Securely loads Firebase configuration from environment or fallback
 */

class FirebaseConfigLoader {
  constructor() {
    this.config = null;
    this.isProduction = location.hostname !== 'localhost' && location.hostname !== '127.0.0.1';
  }

  /**
   * Load configuration from environment or secure endpoint
   * @returns {Promise<Object>} Firebase configuration
   */
  async loadConfig() {
    try {
      // In production, fetch from secure endpoint
      if (this.isProduction) {
        return await this.fetchFromSecureEndpoint();
      }
      
      // In development, use fallback (should be replaced with env vars)
      return this.getLocalConfig();
    } catch (error) {
      console.error('[Config] Failed to load Firebase configuration:', error);
      throw new Error('Unable to initialize application. Please contact support.');
    }
  }

  /**
   * Fetch configuration from secure backend endpoint
   * @returns {Promise<Object>} Firebase configuration
   */
  async fetchFromSecureEndpoint() {
    try {
      // TODO: Replace with your actual secure endpoint
      // This should be served by your backend with proper authentication
      const response = await fetch('/api/firebase-config', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const config = await response.json();
      return this.validateConfig(config);
    } catch (error) {
      console.warn('[Config] Secure endpoint unavailable, using fallback');
      return this.getLocalConfig();
    }
  }

  /**
   * Get local configuration (development only)
   * In production, this should be replaced with secure endpoint
   * @returns {Object} Firebase configuration
   */
  getLocalConfig() {
    // Keys are loaded at runtime from /__env.js (gitignored, deployed separately).
    // Never hardcode API keys here — use window.__env instead.
    const e = (typeof window !== 'undefined' && window.__env) || {};
    return {
      apiKey:            this.getEnvVar('FIREBASE_API_KEY')            || e.FIREBASE_API_KEY,
      authDomain:        this.getEnvVar('FIREBASE_AUTH_DOMAIN')        || e.FIREBASE_AUTH_DOMAIN,
      databaseURL:       this.getEnvVar('FIREBASE_DATABASE_URL')       || e.FIREBASE_DATABASE_URL,
      projectId:         this.getEnvVar('FIREBASE_PROJECT_ID')         || e.FIREBASE_PROJECT_ID,
      storageBucket:     this.getEnvVar('FIREBASE_STORAGE_BUCKET')     || e.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: this.getEnvVar('FIREBASE_MESSAGING_SENDER_ID')|| e.FIREBASE_MESSAGING_SENDER_ID,
      appId:             this.getEnvVar('FIREBASE_APP_ID')             || e.FIREBASE_APP_ID,
      measurementId:     this.getEnvVar('FIREBASE_MEASUREMENT_ID')     || e.FIREBASE_MEASUREMENT_ID,
    };
  }

  /**
   * Get environment variable (for build-time injection)
   * @param {string} key - Environment variable key
   * @returns {string|null} Environment variable value
   */
  getEnvVar(key) {
    // This works with build tools like Vite, Webpack, etc.
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
    
    // For runtime environment variables (if loaded separately)
    if (typeof window !== 'undefined' && window._env_) {
      return window._env_[key];
    }
    
    return null;
  }

  /**
   * Validate Firebase configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validated configuration
   */
  validateConfig(config) {
    const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    
    const missing = required.filter(key => !config[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }

    // Sanitize configuration
    return {
      apiKey: String(config.apiKey).trim(),
      authDomain: String(config.authDomain).trim(),
      databaseURL: config.databaseURL ? String(config.databaseURL).trim() : undefined,
      projectId: String(config.projectId).trim(),
      storageBucket: String(config.storageBucket).trim(),
      messagingSenderId: String(config.messagingSenderId).trim(),
      appId: String(config.appId).trim(),
      measurementId: config.measurementId ? String(config.measurementId).trim() : undefined
    };
  }
}

// Export singleton instance
export const configLoader = new FirebaseConfigLoader();
