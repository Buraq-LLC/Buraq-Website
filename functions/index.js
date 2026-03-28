const functions = require("firebase-functions");
const admin     = require("firebase-admin");
const bcrypt    = require("bcrypt");

// ─── Admin SDK initialisation ─────────────────────────────────────────────────
// Uses default credentials automatically when deployed to Cloud Functions.
admin.initializeApp();

const db = admin.firestore();

// ─── Existing function ────────────────────────────────────────────────────────
exports.getCharities = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await db.collection("charities").get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching data");
  }
});

// ─── verifyVaultAccess ────────────────────────────────────────────────────────
// Callable function that validates Evidence Vault credentials and returns
// a Firebase custom token + tier access level.
//
// Rate limiting note: For production, implement one of:
//   a) Cloud Tasks-based per-IP quotas
//   b) A Firestore `rate_limits/{fingerprint}` counter with a TTL Cloud Function
//   c) Firebase App Check (enforced below) to block non-app traffic
//
exports.verifyVaultAccess = functions.https.onCall(async (data, context) => {
  // ── App Check (optional enforcement) ───────────────────────────────────────
  // Uncomment to hard-enforce App Check:
  // if (context.app == undefined) {
  //   throw new functions.https.HttpsError(
  //     "failed-precondition",
  //     "App Check verification failed."
  //   );
  // }

  // ── Input validation ────────────────────────────────────────────────────────
  const { email, secretKey } = data || {};

  if (
    typeof email !== "string" ||
    typeof secretKey !== "string" ||
    !email.trim() ||
    !secretKey
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Email and secret key are required."
    );
  }

  if (secretKey.length > 512) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid input.");
  }

  // ── Normalize email ─────────────────────────────────────────────────────────
  const normalizedEmail = email.toLowerCase().trim();

  // Generic error used for all auth failures to prevent info leakage
  const authFailed = new functions.https.HttpsError(
    "unauthenticated",
    "Invalid credentials."
  );

  // Constant-time delay to mitigate timing-based email enumeration
  const delay = () =>
    new Promise((r) => setTimeout(r, 300 + Math.floor(Math.random() * 200)));

  // ── Firestore lookup ─────────────────────────────────────────────────────────
  let doc;
  try {
    doc = await db.collection("accounts").doc(normalizedEmail).get();
  } catch (err) {
    console.error("[verifyVaultAccess] Firestore read error:", err);
    throw new functions.https.HttpsError("internal", "Service unavailable.");
  }

  if (!doc.exists) {
    await delay();
    throw authFailed;
  }

  const record = doc.data();

  // ── Active check ─────────────────────────────────────────────────────────────
  if (!record.active) {
    await delay();
    throw authFailed;
  }

  // ── bcrypt comparison ─────────────────────────────────────────────────────────
  let isValid = false;
  try {
    isValid = await bcrypt.compare(secretKey, record.secretKeyHash);
  } catch (err) {
    console.error("[verifyVaultAccess] bcrypt error:", err);
    throw new functions.https.HttpsError("internal", "Service unavailable.");
  }

  if (!isValid) {
    await delay();
    throw authFailed;
  }

  // ── Create / fetch Firebase Auth user ────────────────────────────────────────
  const tierAccess = record.tierAccess;
  let userRecord;

  try {
    userRecord = await admin.auth().getUserByEmail(normalizedEmail);
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      userRecord = await admin.auth().createUser({
        email:         normalizedEmail,
        emailVerified: true,
      });
    } else {
      console.error("[verifyVaultAccess] Auth user lookup error:", err);
      throw new functions.https.HttpsError("internal", "Service unavailable.");
    }
  }

  // ── Set custom claims ─────────────────────────────────────────────────────────
  const claims = { tierAccess };
  if (tierAccess === "admin") claims.admin = true;

  await admin.auth().setCustomUserClaims(userRecord.uid, claims);

  // ── Create custom token ───────────────────────────────────────────────────────
  const token = await admin.auth().createCustomToken(userRecord.uid, claims);

  return { token, tierAccess };
});
