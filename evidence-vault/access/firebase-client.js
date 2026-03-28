// ─── Firebase client initialisation ───────────────────────────────────────────
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore }            from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey:            'REDACTED_VAULT_ACCESS_KEY',
  authDomain:        'vault-access-a2961.firebaseapp.com',
  projectId:         'vault-access-a2961',
  storageBucket:     'vault-access-a2961.firebasestorage.app',
  messagingSenderId: '845042032688',
  appId:             '1:845042032688:web:2258f3ec0f1b92d24ec769',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);
