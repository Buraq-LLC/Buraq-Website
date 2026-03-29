// ─── Runtime environment variables ────────────────────────────────────────────
// This file is NOT committed to git (see .gitignore).
// It is deployed directly to Firebase Hosting via firebase.json headers/rewrites.
// All API keys live here so they never appear in source control.
window.__env = {
  // buraq-ai-2670c  (main site)
  FIREBASE_API_KEY:              'AIzaSyBAQdBxdnV_-qsmVxjdK4fzAUNBEf-QHG8',
  FIREBASE_AUTH_DOMAIN:          'buraq-ai-2670c.firebaseapp.com',
  FIREBASE_DATABASE_URL:         'https://buraq-ai-2670c-default-rtdb.firebaseio.com',
  FIREBASE_PROJECT_ID:           'buraq-ai-2670c',
  FIREBASE_STORAGE_BUCKET:       'buraq-ai-2670c.firebasestorage.app',
  FIREBASE_MESSAGING_SENDER_ID:  '910712236530',
  FIREBASE_APP_ID:               '1:910712236530:web:9ad3566251dbf05e0fe36b',
  FIREBASE_MEASUREMENT_ID:       'G-P9RSTYSVT3',

  // vault-access-a2961  (login / access control)
  VAULT_API_KEY:                 'AIzaSyD0jAdeCJkYjLr2WdKAwAgLmexwcqa9cZo',
  VAULT_AUTH_DOMAIN:             'vault-access-a2961.firebaseapp.com',
  VAULT_PROJECT_ID:              'vault-access-a2961',
  VAULT_STORAGE_BUCKET:          'vault-access-a2961.firebasestorage.app',
  VAULT_MESSAGING_SENDER_ID:     '845042032688',
  VAULT_APP_ID:                  '1:845042032688:web:2258f3ec0f1b92d24ec769',

  // evidence-vault-5d16d  (email / request-access form)
  EV_API_KEY:                    'AIzaSyD9Xv1oN_JRm7Gdz_ffLI-hg6ivkuE-A7Q',
  EV_AUTH_DOMAIN:                'evidence-vault-5d16d.firebaseapp.com',
  EV_PROJECT_ID:                 'evidence-vault-5d16d',
  EV_STORAGE_BUCKET:             'evidence-vault-5d16d.firebasestorage.app',
  EV_MESSAGING_SENDER_ID:        '503997504949',
  EV_APP_ID:                     '1:503997504949:web:7d57b5142f25ab120e0dfc',

  // BuraqAI API — set to wherever BuraqAI is hosted/running
  VAULT_BURAQAI_API:             'http://localhost:5000',
};
