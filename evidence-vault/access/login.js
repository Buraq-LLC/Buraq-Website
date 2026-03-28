// ─── Login form controller ────────────────────────────────────────────────────
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { db } from '/evidence-vault/access/firebase-client.js';

// bcryptjs is loaded as a classic <script> in index.html — available as window.dcodeIO.bcrypt
const bcrypt = window.dcodeIO?.bcrypt ?? window.bcrypt;

const loginCard = document.getElementById('loginCard');
const vaultView = document.getElementById('vaultView');
const form      = document.getElementById('loginForm');
const emailEl   = document.getElementById('email');
const keyEl     = document.getElementById('secretKey');
const btn       = document.getElementById('submitBtn');
const msgEl     = document.getElementById('loginMsg');

// ─── Tier content templates ────────────────────────────────────────────────────
const TIER_CONFIG = {
  basic: {
    label: 'Basic',
    badgeStyle: 'background:rgba(41,151,255,.12);color:#2997ff',
    title: 'Welcome to the Evidence Vault',
    body: 'You are signed in with Basic access. Your authorized evidence materials will appear here.',
  },
  pro: {
    label: 'Pro',
    badgeStyle: 'background:rgba(249,115,22,.12);color:#f97316',
    title: 'Welcome to the Evidence Vault',
    body: 'You are signed in with Pro access. Your authorized evidence materials will appear here.',
  },
  enterprise: {
    label: 'Enterprise',
    badgeStyle: 'background:rgba(34,197,94,.12);color:#22c55e',
    title: 'Welcome to the Evidence Vault',
    body: 'You are signed in with Enterprise access. Your authorized evidence materials will appear here.',
  },
  admin: {
    label: 'Admin',
    badgeStyle: 'background:rgba(255,69,58,.12);color:#ff453a',
    title: 'Evidence Vault Admin',
    body: 'You are signed in with Admin access. Full vault management is available.',
  },
};

// ─── Tier → dashboard route map ────────────────────────────────────────────────
const TIER_ROUTES = {
  basic:      '/evidence-vault/access/basic',
  pro:        '/evidence-vault/access/pro',
  enterprise: '/evidence-vault/access/enterprise',
  admin:      '/evidence-vault/access/admin',
};

function tierRoute(tierAccess) {
  return TIER_ROUTES[tierAccess] ?? TIER_ROUTES.basic;
}

// ─── Restore session on page load — redirect if already authenticated ────────
try {
  const stored = sessionStorage.getItem('vault_session');
  if (stored) {
    const session = JSON.parse(stored);
    if (session?.email && session?.tierAccess) {
      window.location.replace(tierRoute(session.tierAccess));
    } else {
      loginCard.style.display = 'block';
    }
  } else {
    loginCard.style.display = 'block';
  }
} catch (_) {
  loginCard.style.display = 'block';
}

// ─── Helpers ────────────────────────────────────────────────────
function setMsg(text, isError = false) {
  msgEl.textContent = text;
  msgEl.style.color = isError ? '#ff453a' : '#30d158';
}

function setLoading(loading) {
  btn.disabled    = loading;
  btn.textContent = loading ? 'Verifying…' : 'Access Vault →';
}

// ─── Login submit ────────────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msgEl.textContent = '';

  const email     = emailEl.value.trim().toLowerCase();
  const secretKey = keyEl.value.trim();

  if (!email || !secretKey) {
    setMsg('Please enter your email and secret key.', true);
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setMsg('Please enter a valid email address.', true);
    return;
  }

  setLoading(true);

  try {
    const snap = await getDoc(doc(db, 'vault_access', email));

    if (!snap.exists()) {
      setMsg('Invalid credentials. Please try again.', true);
      return;
    }

    const record = snap.data();

    // Validate credentials before revealing account status
    if (!record.secretKey || !record.secretKey.startsWith('$2')) {
      setMsg('Invalid credentials. Please try again.', true);
      return;
    }
    const keyMatches = await bcrypt.compare(secretKey, record.secretKey);
    if (!keyMatches) {
      setMsg('Invalid credentials. Please try again.', true);
      return;
    }

    // Credentials correct — now check active
    if (record.active !== true) {
      setMsg('Account deleted or deactivated. Please contact support.', true);
      return;
    }

    const session = { email, tierAccess: record.tierAccess ?? 'basic' };
    sessionStorage.setItem('vault_session', JSON.stringify(session));
    setMsg('Access granted.', false);
    setTimeout(() => window.location.replace(tierRoute(session.tierAccess)), 800);

  } catch (err) {
    console.error('[VaultAccess]', err);
    setMsg('Something went wrong. Please try again later.', true);
  } finally {
    setLoading(false);
  }
});
