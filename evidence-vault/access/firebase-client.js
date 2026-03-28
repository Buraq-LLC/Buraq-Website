// ─── Firebase client initialisation ───────────────────────────────────────────
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore }            from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Keys loaded at runtime from /__env.js (gitignored). Never hardcode here.
const _e = (typeof window !== 'undefined' && window.__env) || {};
if (!_e.VAULT_API_KEY) console.error('[Vault] __env.js not loaded — Firebase config missing');
const firebaseConfig = {
  apiKey:            _e.VAULT_API_KEY,
  authDomain:        _e.VAULT_AUTH_DOMAIN,
  projectId:         _e.VAULT_PROJECT_ID,
  storageBucket:     _e.VAULT_STORAGE_BUCKET,
  messagingSenderId: _e.VAULT_MESSAGING_SENDER_ID,
  appId:             _e.VAULT_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);
