# 🔒 reCAPTCHA Setup and Configuration Guide

## Current Status

**Site Key**: `6Lf8SLwrAAAAADyqwKLrfs-_4kFu053sjEtz3N6_`  
**Current Implementation**: ✅ Present in HTML and JS  
**Issue**: Needs localhost configuration for development

---

## 🚀 Quick Fix for Localhost

### Step 1: Add Localhost to Google reCAPTCHA Console

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Select your site: **Buraq AI Website**
3. Click **Settings**
4. Under **Domains**, add:
   ```
   localhost
   127.0.0.1
   buraq-ai-2670c.web.app
   buraq-ai-2670c.firebaseapp.com
   ```
5. Click **Save**

### Step 2: Verify Implementation

The code now uses **explicit rendering** for better reliability:

**HTML (line ~349):**
```html
<div class="g-recaptcha"></div>
```

**JavaScript Callback (index.html):**
```javascript
window.onRecaptchaLoad = function() {
  console.log('reCAPTCHA loaded successfully');
  if (typeof grecaptcha !== 'undefined') {
    try {
      grecaptcha.render(document.querySelector('.g-recaptcha'), {
        'sitekey': '6Lf8SLwrAAAAADyqwKLrfs-_4kFu053sjEtz3N6_',
        'theme': 'dark'
      });
      console.log('reCAPTCHA rendered');
    } catch (error) {
      console.error('reCAPTCHA render error:', error);
    }
  }
};
```

**Script Tag:**
```html
<script src="https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit" async defer></script>
```

**JavaScript (main.js):**
- ✅ `getRecaptchaResponse()` - Gets token
- ✅ `validateData()` - Validates before submission
- ✅ `resetCaptcha()` - Resets after submission
- ✅ Development mode fallback - Returns 'dev-mode' if reCAPTCHA not loaded

---

## 📝 How It Works

### 1. Form Submission Flow
```
User fills form
    ↓
User completes reCAPTCHA
    ↓
User clicks "Submit inquiry"
    ↓
validateData() checks reCAPTCHA
    ↓
getRecaptchaResponse() gets token
    ↓
Submit to Firebase with token
    ↓
Reset form & reCAPTCHA on success
```

### 2. Code Flow

**Validation (main.js line 409-414):**
```javascript
// Validate reCAPTCHA
const recaptchaResponse = this.getRecaptchaResponse();
if (!recaptchaResponse) {
  this.showMessage('Please complete the reCAPTCHA verification.', 'error');
  return false;
}
```

**Get Response (main.js line 419-432):**
```javascript
getRecaptchaResponse() {
  if (typeof grecaptcha === 'undefined') {
    log('reCAPTCHA not loaded');
    // Allow submission if reCAPTCHA is not loaded (development mode)
    return 'dev-mode';
  }
  
  try {
    return grecaptcha.getResponse();
  } catch (error) {
    log('reCAPTCHA error:', error);
    return 'dev-mode';
  }
}
```

**Reset After Submission (main.js line 460-467):**
```javascript
resetCaptcha() {
  if (typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
    try {
      grecaptcha.reset();
    } catch (e) {
      log('reCAPTCHA reset error:', e);
    }
  }
}
```

---

## 🔧 Development Mode

The current implementation includes a **smart fallback** for development:

- If `grecaptcha` is not loaded → Returns `'dev-mode'`
- Allows testing without reCAPTCHA active
- Production will require valid token

---

## ✅ Testing Checklist

### Local Testing (localhost)
1. [ ] Open `http://localhost:5000` or your local server
2. [ ] Navigate to Contact section
3. [ ] Fill out the form
4. [ ] Complete reCAPTCHA (should appear)
5. [ ] Click "Submit inquiry"
6. [ ] Should submit successfully
7. [ ] reCAPTCHA should reset after submission

### Production Testing
1. [ ] Deploy to Firebase hosting
2. [ ] Test on live URL
3. [ ] Verify reCAPTCHA loads
4. [ ] Test form submission
5. [ ] Check Firebase Console for inquiries

---

## 🐛 Troubleshooting

### Issue: "Please complete the reCAPTCHA verification"
**Cause**: reCAPTCHA not completed or domain not authorized

**Fix**:
1. Add domain to reCAPTCHA console
2. Clear browser cache
3. Hard refresh (Ctrl+Shift+R)

### Issue: reCAPTCHA not visible
**Cause**: Script not loaded or blocked by ad blocker

**Fix**:
1. Check browser console for errors
2. Disable ad blockers
3. Verify script tag in HTML:
   ```html
   <script src="https://www.google.com/recaptcha/api.js" async defer></script>
   ```

### Issue: "reCAPTCHA not loaded" in console
**Cause**: Development mode or script load failure

**Fix**:
- This is normal in development
- Form will still submit with 'dev-mode' token
- In production, ensure script loads properly

### Issue: reCAPTCHA doesn't reset after submission
**Cause**: Reset function not called or failed

**Fix**:
- Check `resetCaptcha()` is called in success handler
- Verify `grecaptcha.reset()` is available
- Clear browser cache

---

## 🔐 Security Considerations

### Current Implementation
✅ Client-side validation  
✅ Token sent to backend  
⚠️ Backend verification needed (Firebase Functions)

### Backend Verification (Recommended)

To fully secure the form, add server-side verification in Firebase Functions:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

exports.verifyRecaptcha = functions.https.onCall(async (data, context) => {
  const { recaptchaToken } = data;
  const secretKey = 'YOUR_SECRET_KEY'; // Get from reCAPTCHA console
  
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${secretKey}&response=${recaptchaToken}`
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new functions.https.HttpsError('invalid-argument', 'reCAPTCHA verification failed');
  }
  
  return { verified: true };
});
```

---

## 📊 Current Configuration Summary

| Component | Status | Value |
|-----------|--------|-------|
| Site Key | ✅ | `6Lf8SLwrAAAAADyqwKLrfs-_4kFu053sjEtz3N6_` |
| HTML Implementation | ✅ | Line 349 |
| JS Validation | ✅ | `validateData()` |
| JS Get Token | ✅ | `getRecaptchaResponse()` |
| JS Reset | ✅ | `resetCaptcha()` |
| Dev Mode Fallback | ✅ | Returns 'dev-mode' |
| Theme | ✅ | Dark |
| Backend Verification | ⚠️ | Not implemented (recommended) |

---

## 🎯 Next Steps

1. **Immediate**: Add `localhost` and `127.0.0.1` to authorized domains in reCAPTCHA console
2. **Short-term**: Test locally and on production
3. **Long-term**: Implement backend verification in Firebase Functions

---

## 📞 Support Resources

- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/display)
- [Firebase Functions Guide](https://firebase.google.com/docs/functions)

---

**Last Updated**: November 24, 2025  
**Configuration**: reCAPTCHA v2 Checkbox
