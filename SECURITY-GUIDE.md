# 🔒 Firebase Security Implementation Guide

## Overview
This guide covers the comprehensive security measures implemented to protect Firebase credentials and prevent unauthorized access to the Buraq AI website.

---

## ⚠️ Critical Security Changes

### 1. Credentials Removed from Codebase
- ✅ Firebase credentials removed from `firebase-init.js`
- ✅ Configuration moved to secure loader (`firebase-config-loader.js`)
- ✅ `.env` files added to `.gitignore`
- ✅ Backup files (`*.backup`) excluded from git

### 2. New Files Created

#### `.env.example`
Template for environment variables. **Copy this to `.env` and fill in your values:**
```bash
cp .env.example .env
```

#### `firebase-config-loader.js`
Secure configuration loader with multiple strategies:
- Production: Fetches from secure backend endpoint
- Development: Uses environment variables or fallback
- Validates all configuration before use

#### `firestore.rules`
Firestore Security Rules that must be deployed to Firebase.

---

## 🚀 Deployment Steps

### Step 1: Secure Your Git Repository

```bash
# Remove sensitive files from git history (if already committed)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch firebase-init.js.backup" \
  --prune-empty --tag-name-filter cat -- --all

# Remove backup files with credentials
rm -f *.backup

# Verify .gitignore is working
git status

# Should NOT show:
# - .env
# - *.backup
# - firebase-credentials.json
```

### Step 2: Set Up Environment Variables

**Option A: For Static Hosting (Current Setup)**
```bash
# Edit firebase-config-loader.js line 67-75
# Replace 'YOUR_API_KEY_HERE' with actual values
# This is safe because Firebase security comes from Firestore rules
```

**Option B: For Server-Side Hosting (Recommended)**
```bash
# Create .env file
cp .env.example .env

# Edit .env with your values
nano .env

# Deploy backend endpoint at /api/firebase-config
# This endpoint should:
# 1. Check authentication/origin
# 2. Return only necessary config values
# 3. Use environment variables from server
```

### Step 3: Deploy Firestore Security Rules

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init firestore

# Deploy security rules
firebase deploy --only firestore:rules

# Verify deployment
firebase firestore:rules:get
```

### Step 4: Configure Firebase Console

1. **Go to Firebase Console** → Your Project → Firestore Database
2. **Verify Rules** are deployed correctly
3. **Set up App Check** (recommended):
   - Go to App Check section
   - Register your domain
   - Enable reCAPTCHA Enterprise
4. **Configure Authentication** (if needed):
   - Only enable methods you need
   - Set up authorized domains
5. **Set up Usage Quotas**:
   - Firestore → Usage tab
   - Set daily/monthly limits to prevent abuse

### Step 5: Test Security

```bash
# Test rate limiting (should block after 5 requests)
# Open browser console and run 10 times:
window.saveInquiry({
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  org: 'Test Org',
  country: 'Test Country',
  notes: 'Test'
});

# Should see: "Too many requests. Please try again in X seconds."
```

---

## 🔐 Security Features Implemented

### 1. Client-Side Protection

#### Rate Limiting
- **5 requests per minute** per client
- Prevents spam and DoS attacks
- Client-side enforcement (backed by Firestore rules)

#### Input Validation
```javascript
✅ Required fields checking
✅ Email format validation (regex)
✅ Field length limits (max 5000 chars)
✅ Type checking (string validation)
✅ HTML sanitization (removes <, >)
```

#### Client Fingerprinting
- SHA-256 hash of browser characteristics
- Helps detect abuse patterns
- Privacy-friendly (no PII stored)

### 2. Firestore Security Rules

```javascript
✅ Write-only access (no read from client)
✅ Server-side validation of all fields
✅ Email format validation in rules
✅ Field length enforcement
✅ Timestamp validation (server-side only)
✅ Rate limiting hints
✅ All other collections denied by default
```

### 3. Configuration Security

```javascript
✅ No credentials in codebase
✅ Configuration loaded from secure source
✅ Validation before use
✅ Sanitization of all values
✅ Fallback error handling
```

### 4. Headers & CORS

```html
✅ X-Content-Type-Options: nosniff
✅ Referrer-Policy: strict-origin-when-cross-origin
✅ crossorigin="anonymous" on external scripts
✅ Preconnect hints for CDNs
```

---

## 🛡️ Firestore Security Rules Explanation

### Inquiries Collection Rules

```javascript
// Allow creation only if:
allow create: if 
  // Valid timestamp (not in far future)
  isValidRequest()
  
  // All required fields present and valid
  && isValidInquiry(request.resource.data)
  
  // Server timestamp (prevents time manipulation)
  && request.resource.data.createdAt == request.time
  
  // Valid user agent
  && request.resource.data.userAgent is string
  && request.resource.data.userAgent.size() > 0
  && request.resource.data.userAgent.size() <= 500;

// Deny all reads (use Firebase Admin SDK on backend)
allow read: if false;

// Deny updates and deletes
allow update, delete: if false;
```

### Validation Rules
- **firstName, lastName**: 1-100 chars, non-empty
- **email**: 1-255 chars, valid email format
- **org**: 1-200 chars, non-empty
- **country**: 1-100 chars, non-empty
- **title**: Optional, max 200 chars
- **notes**: Optional, max 5000 chars

---

## 🔍 Monitoring & Alerts

### Firebase Console Monitoring

1. **Firestore Usage**
   - Monitor write operations
   - Set up alerts for unusual spikes
   - Check error rates

2. **Security Rules**
   - Review denied requests
   - Identify attack patterns
   - Update rules as needed

3. **Authentication Logs** (if using Auth)
   - Monitor failed attempts
   - Block suspicious IPs
   - Review user creation patterns

### Recommended Alerts

```bash
# Set up Firebase alerts for:
- Write operations > 1000/hour
- Security rule denials > 100/hour
- Error rate > 5%
- Unusual traffic patterns
```

---

## 🚨 Incident Response

### If Credentials Are Compromised

1. **Immediately Rotate API Keys**
   ```bash
   # Firebase Console → Project Settings → Service Accounts
   # Delete compromised keys
   # Generate new keys
   ```

2. **Review Firestore Data**
   ```bash
   # Check for unauthorized writes
   # Delete spam/malicious data
   # Update security rules
   ```

3. **Update Application**
   ```bash
   # Update configuration
   # Deploy new version
   # Notify users if needed
   ```

4. **Post-Incident**
   ```bash
   # Review logs
   # Identify breach source
   # Update security measures
   # Document lessons learned
   ```

---

## 📋 Security Checklist

### Before Going Live

- [ ] Credentials removed from all files in git history
- [ ] `.env` added to `.gitignore`
- [ ] Firestore security rules deployed
- [ ] Rate limiting tested
- [ ] Input validation tested
- [ ] Error handling tested
- [ ] Firebase Console usage limits set
- [ ] App Check enabled (optional but recommended)
- [ ] HTTPS enforced
- [ ] Security headers verified
- [ ] Monitoring alerts configured

### Regular Maintenance

- [ ] Review Firestore logs weekly
- [ ] Update dependencies monthly
- [ ] Review security rules quarterly
- [ ] Rotate credentials annually
- [ ] Test security measures quarterly

---

## 🔗 Additional Resources

### Firebase Security Documentation
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules-structure)
- [App Check](https://firebase.google.com/docs/app-check)
- [Security Best Practices](https://firebase.google.com/docs/rules/best-practices)

### Tools
- [Firebase CLI](https://firebase.google.com/docs/cli)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite) (for testing)
- [Firestore Rules Playground](https://firebase.google.com/docs/firestore/security/test-rules-emulator)

---

## 💡 Important Notes

### About Firebase API Keys
Firebase API keys in client-side code are **not secret**. They identify your Firebase project but don't grant access. Security comes from:
1. **Firestore Security Rules** (server-side)
2. **App Check** (bot protection)
3. **Authentication** (user verification)
4. **CORS/Domain restrictions** (in Firebase Console)

However, it's still best practice to:
- Not commit them to public repositories
- Use environment variables for configuration
- Restrict domains in Firebase Console
- Implement rate limiting
- Monitor usage for abuse

### Rate Limiting
The client-side rate limiting is a first line of defense. For production:
- Consider using **Firebase App Check**
- Implement **backend rate limiting** with Cloud Functions
- Use **Firebase Security Rules** to enforce limits
- Monitor usage patterns in Firebase Console

---

## 🆘 Support

If you encounter issues:
1. Check Firebase Console for error messages
2. Review Firestore security rules logs
3. Test with Firebase Emulator Suite locally
4. Contact Firebase Support for critical issues

---

**Last Updated**: November 23, 2025
**Version**: 1.0
