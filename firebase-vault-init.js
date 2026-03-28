/**
 * Buraq AI — Evidence Vault Firebase Init
 * Dedicated Firebase project: evidence-vault-5d16d
 */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Keys loaded at runtime from /__env.js (gitignored). Never hardcode here.
const _e = (typeof window !== 'undefined' && window.__env) || {};
if (!_e.EV_API_KEY) console.error('[Vault] __env.js not loaded — Firebase config missing');
const VAULT_CONFIG = {
  apiKey:            _e.EV_API_KEY,
  authDomain:        _e.EV_AUTH_DOMAIN,
  projectId:         _e.EV_PROJECT_ID,
  storageBucket:     _e.EV_STORAGE_BUCKET,
  messagingSenderId: _e.EV_MESSAGING_SENDER_ID,
  appId:             _e.EV_APP_ID,
};

const COLLECTION = 'emails';

const RATE_LIMIT = { maxRequests: 3, windowMs: 60000, requests: [] };

class VaultFirebase {
  constructor() {
    this.app = null;
    this.db = null;
    this.ready = false;
  }

  async init() {
    try {
      this.app = initializeApp(VAULT_CONFIG, 'evidence-vault');
      this.db = getFirestore(this.app);
      this.ready = true;
      console.log('[Vault Firebase] Ready');
    } catch (err) {
      console.error('[Vault Firebase] Init error:', err);
    }
  }

  checkRateLimit() {
    const now = Date.now();
    RATE_LIMIT.requests = RATE_LIMIT.requests.filter(t => now - t < RATE_LIMIT.windowMs);
    if (RATE_LIMIT.requests.length >= RATE_LIMIT.maxRequests) {
      const reset = Math.ceil((Math.min(...RATE_LIMIT.requests) + RATE_LIMIT.windowMs - now) / 1000);
      return { allowed: false, resetIn: reset };
    }
    RATE_LIMIT.requests.push(now);
    return { allowed: true };
  }

  sanitize(payload) {
    const out = {};
    for (const [k, v] of Object.entries(payload)) {
      out[k] = typeof v === 'string' ? v.trim().replace(/[<>]/g, '').substring(0, 5000) : v;
    }
    return out;
  }

  async save(payload) {
    if (!this.ready || !this.db) {
      return { ok: false, error: 'Service unavailable. Please refresh and try again.' };
    }

    const rl = this.checkRateLimit();
    if (!rl.allowed) {
      return { ok: false, error: `Too many requests. Please try again in ${rl.resetIn}s.` };
    }

    try {
      const doc = await addDoc(collection(this.db, COLLECTION), {
        ...this.sanitize(payload)
      });
      console.log('[Vault Firebase] Saved:', doc.id);
      return { ok: true, id: doc.id };
    } catch (err) {
      console.error('[Vault Firebase] Save error:', err);
      const map = {
        'permission-denied': 'Permission denied. Please contact support.',
        'unavailable': 'Service temporarily unavailable. Please try again.',
        'deadline-exceeded': 'Request timed out. Please try again.',
        'resource-exhausted': 'Service quota exceeded. Please try again later.'
      };
      return { ok: false, error: map[err?.code] || err?.message || 'Submission failed.' };
    }
  }
}

const vaultFirebase = new VaultFirebase();
vaultFirebase.init();

window.saveVaultInquiry = (payload) => vaultFirebase.save(payload);

export { vaultFirebase };
