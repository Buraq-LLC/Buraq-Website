/**
 * Buraq AI — Evidence Vault Firebase Init
 * Dedicated Firebase project: evidence-vault-5d16d
 */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const VAULT_CONFIG = {
  apiKey: "REDACTED_EVIDENCE_VAULT_KEY",
  authDomain: "evidence-vault-5d16d.firebaseapp.com",
  projectId: "evidence-vault-5d16d",
  storageBucket: "evidence-vault-5d16d.firebasestorage.app",
  messagingSenderId: "503997504949",
  appId: "1:503997504949:web:7d57b5142f25ab120e0dfc"
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
