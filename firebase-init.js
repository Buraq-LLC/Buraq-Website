// Firebase initialization module
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAnalytics, isSupported as analyticsIsSupported } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js';

// Configuration
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBT1yoRjsG-mj0PVzIuyLnrbRvILe4S4rs",
  authDomain: "buraq-ai-2670c.firebaseapp.com",
  databaseURL: "https://buraq-ai-2670c-default-rtdb.firebaseio.com",
  projectId: "buraq-ai-2670c",
  storageBucket: "buraq-ai-2670c.firebasestorage.app",
  messagingSenderId: "910712236530",
  appId: "1:910712236530:web:9ad3566251dbf05e0fe36b",
  measurementId: "G-P9RSTYSVT3"
};

const COLLECTION_NAME = 'inquiries';

// Firebase state
let app = null;
let db = null;
let analytics = null;

/**
 * Firebase Manager Class
 * Handles initialization and database operations with error handling
 */
class FirebaseManager {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize Firebase services
   * @returns {Promise<boolean>} Success status
   */
  async init() {
    if (this.initialized) return true;

    try {
      // Initialize Firebase App
      app = initializeApp(FIREBASE_CONFIG);
      console.log(`[Firebase] App initialized: ${app.options.projectId}`);

      // Initialize Firestore
      db = getFirestore(app);
      console.log('[Firebase] Firestore ready');

      // Initialize Analytics (HTTPS only)
      await this.initAnalytics();

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('[Firebase] Initialization error:', error);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Initialize Firebase Analytics with proper checks
   */
  async initAnalytics() {
    try {
      const isHttps = location.protocol === 'https:';
      const hasConfig = !!FIREBASE_CONFIG.measurementId;
      
      if (!isHttps || !hasConfig) {
        console.log('[Firebase] Analytics skipped (requires HTTPS and measurementId)');
        return;
      }

      const isAnalyticsSupported = await analyticsIsSupported();
      
      if (isAnalyticsSupported) {
        analytics = getAnalytics(app);
        console.log('[Firebase] Analytics initialized');
      }
    } catch (error) {
      console.warn('[Firebase] Analytics initialization failed:', error);
    }
  }

  /**
   * Validate inquiry payload
   * @param {Object} payload - The inquiry data
   * @returns {Object} Validation result
   */
  validatePayload(payload) {
    const required = ['firstName', 'lastName', 'email', 'org', 'country'];
    const errors = [];

    // Check required fields
    required.forEach(field => {
      if (!payload[field] || typeof payload[field] !== 'string' || !payload[field].trim()) {
        errors.push(`Missing or invalid field: ${field}`);
      }
    });

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (payload.email && !emailPattern.test(payload.email)) {
      errors.push('Invalid email format');
    }

    // Check field lengths
    const maxLengths = {
      firstName: 100,
      lastName: 100,
      email: 255,
      org: 200,
      title: 200,
      country: 100,
      notes: 5000
    };

    Object.entries(maxLengths).forEach(([field, maxLength]) => {
      if (payload[field] && payload[field].length > maxLength) {
        errors.push(`${field} exceeds maximum length of ${maxLength}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize payload data
   * @param {Object} payload - The inquiry data
   * @returns {Object} Sanitized payload
   */
  sanitizePayload(payload) {
    const sanitized = {};
    
    Object.entries(payload).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Remove potentially dangerous characters
        sanitized[key] = value
          .trim()
          .replace(/[<>]/g, '')
          .substring(0, 5000); // Hard limit
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  /**
   * Save inquiry to Firestore with validation and error handling
   * @param {Object} payload - The inquiry data
   * @returns {Promise<Object>} Result object with success status
   */
  async saveInquiry(payload) {
    if (!this.initialized || !db) {
      return { 
        ok: false, 
        error: 'Firebase not initialized. Please refresh the page.' 
      };
    }

    // Validate payload
    const validation = this.validatePayload(payload);
    if (!validation.isValid) {
      return {
        ok: false,
        error: `Validation failed: ${validation.errors.join(', ')}`
      };
    }

    // Sanitize payload
    const sanitizedPayload = this.sanitizePayload(payload);

    try {
      // Add document to Firestore
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...sanitizedPayload,
        createdAt: serverTimestamp(),
        userAgent: this.sanitizeUserAgent(navigator.userAgent),
        timestamp: Date.now()
      });

      console.log(`[Firebase] Inquiry saved with ID: ${docRef.id}`);
      
      return { 
        ok: true, 
        id: docRef.id 
      };
    } catch (error) {
      console.error('[Firebase] Save error:', error);
      
      return { 
        ok: false, 
        error: this.getUserFriendlyError(error)
      };
    }
  }

  /**
   * Sanitize user agent string
   * @param {string} ua - User agent string
   * @returns {string} Sanitized user agent
   */
  sanitizeUserAgent(ua) {
    if (!ua || typeof ua !== 'string') return 'unknown';
    return ua.substring(0, 500).replace(/[<>]/g, '');
  }

  /**
   * Convert Firebase errors to user-friendly messages
   * @param {Error} error - The error object
   * @returns {string} User-friendly error message
   */
  getUserFriendlyError(error) {
    const errorMap = {
      'permission-denied': 'Permission denied. Please contact support.',
      'unavailable': 'Service temporarily unavailable. Please try again later.',
      'invalid-argument': 'Invalid data provided. Please check your input.',
      'deadline-exceeded': 'Request timeout. Please try again.',
      'already-exists': 'This inquiry already exists.',
      'resource-exhausted': 'Service quota exceeded. Please try again later.'
    };

    const errorCode = error?.code || '';
    return errorMap[errorCode] || error?.message || 'An unexpected error occurred.';
  }
}

// Initialize Firebase Manager
const firebaseManager = new FirebaseManager();
firebaseManager.init();

// Expose to global scope for form submission
window.saveInquiry = (payload) => firebaseManager.saveInquiry(payload);

// Export for module usage
export { firebaseManager, FIREBASE_CONFIG };
