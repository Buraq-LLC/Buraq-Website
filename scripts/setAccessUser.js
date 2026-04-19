#!/usr/bin/env node
// ─── Evidence Vault — Admin access management script ─────────────────────────
//
// Usage:
//   node scripts/setAccessUser.js \
//     --email user@example.com \
//     --key "my-secret-key" \
//     --tier basic \
//     --active true
//
// Tiers: basic | pro | enterprise | admin
//
// To rotate a key for an existing user, run the same command with a new --key.
// The script always does a full set (creates or overwrites the document).
//
// Prerequisites:
//   npm install firebase-admin bcrypt
//   Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path:
//     export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
// ─────────────────────────────────────────────────────────────────────────────

const admin  = require("firebase-admin");
const bcrypt = require("bcrypt");

const VALID_TIERS  = ["basic", "pro", "enterprise", "admin"];
const BCRYPT_ROUNDS = 12;

// ── Parse CLI args ─────────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, "");
    result[key] = args[i + 1];
  }
  return result;
}

async function main() {
  const { email, key, tier, active } = parseArgs();

  // ── Validate ────────────────────────────────────────────────────────────────
  if (!email || !key || !tier) {
    console.error("Usage: node setAccessUser.js --email <email> --key <secret> --tier <tier> [--active true|false]");
    process.exit(1);
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    console.error("Invalid email address.");
    process.exit(1);
  }
  if (!VALID_TIERS.includes(tier)) {
    console.error(`Invalid tier. Choose from: ${VALID_TIERS.join(", ")}`);
    process.exit(1);
  }
  if (key.length < 12) {
    console.error("Secret key must be at least 12 characters.");
    process.exit(1);
  }

  const isActive = active !== "false"; // defaults to true

  // ── Firebase Admin init ───────────────────────────────────────────────────
  // Uses GOOGLE_APPLICATION_CREDENTIALS env variable automatically.
  admin.initializeApp({
    credential:  admin.credential.applicationDefault(),
    projectId:   "buraq-ai-2670c",
  });

  const db = admin.firestore();

  // ── Hash the secret key ──────────────────────────────────────────────────
  console.log(`Hashing secret key with bcrypt (${BCRYPT_ROUNDS} rounds)…`);
  const secretKeyHash = await bcrypt.hash(key, BCRYPT_ROUNDS);

  // ── Write to Firestore ───────────────────────────────────────────────────
  const docRef = db.collection("vault_access").doc(normalizedEmail);
  const record = {
    email:         normalizedEmail,
    secretKeyHash,
    tierAccess:    tier,
    active:        isActive,
  };

  await docRef.set(record);

  console.log(`\n✓ vault_access/${normalizedEmail} written:`);
  console.log(`  tier:   ${tier}`);
  console.log(`  active: ${isActive}`);
  console.log("  (secret key stored as bcrypt hash only)\n");

  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
