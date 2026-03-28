// ─── Auth helpers ─────────────────────────────────────────────────────────────
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const TIER_ROUTES = {
  basic:      '/evidence-vault/access/basic.html',
  pro:        '/evidence-vault/access/pro.html',
  enterprise: '/evidence-vault/access/enterprise.html',
  admin:      '/evidence-vault/access/admin.html',
};

/**
 * Looks up the user's tier in Firestore and redirects to the correct page.
 * @param {import('firebase/auth').User} user
 * @param {import('firebase/firestore').Firestore} db
 */
export async function completeSignIn(user, db) {
  const snap = await getDoc(doc(db, 'accounts', user.email));
  const tierAccess = snap.exists() ? (snap.data().tierAccess ?? 'basic') : 'basic';
  window.location.href = TIER_ROUTES[tierAccess] ?? TIER_ROUTES.basic;
}
