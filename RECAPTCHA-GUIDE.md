# 🔐 reCAPTCHA Setup Guide for Buraq AI Website

## Overview
This guide provides complete instructions for setting up and configuring Google reCAPTCHA v2 for the contact form, including support for localhost and 127.0.0.1 for development.

---

## 📋 Current Configuration

### Site Key (Public)
```
6Lf8SLwrAAAAADyqwKLrfs-_4kFu053sjEtz3N6_
```

### Implementation Files
- **HTML**: `index.html` (line 350, 375)
- **JavaScript**: `main.js` (FormController class)
- **Script**: Google reCAPTCHA API loaded via CDN

---

## 🚀 Setup Instructions

### Step 1: Configure reCAPTCHA in Google Console

1. **Go to reCAPTCHA Admin Console**
   - Visit: https://www.google.com/recaptcha/admin
   - Sign in with your Google account

2. **Register Your Site** (if not already registered)
   - Click the **+** button to add a new site
   - **Label**: Buraq AI Website
   - **reCAPTCHA type**: Choose **reCAPTCHA v2** → "I'm not a robot" Checkbox
   - Click **Submit**

3. **Add Domains** ⚠️ **CRITICAL**
   
   In the **Domains** section, add the following:
   
   ```
   localhost
   127.0.0.1
   buraq-ai-2670c.web.app
   buraq-ai-2670c.firebaseapp.com
   your-production-domain.com
   ```
   
   **Important Notes:**
   - ✅ Add domains **without** `http://` or `https://`
   - ✅ Add each domain on a **separate line**
   - ✅ Include both `localhost` and `127.0.0.1` for local development
   - ✅ Add your Firebase hosting domains
   - ✅ Add your custom production domain (if applicable)

4. **Copy Your Keys**
   - **Site Key** (public): Use in your HTML
   - **Secret Key** (private): Keep secure, use in backend validation

---

## 🔧 Implementation Details

### HTML Implementation (index.html)

The reCAPTCHA widget is already implemented:

```html
<!-- Line 350: reCAPTCHA widget -->
<div class="contact__captcha">
  <div class="g-recaptcha" 
       data-sitekey="6Lf8SLwrAAAAADyqwKLrfs-_4kFu053sjEtz3N6_" 
       data-theme="dark">
  </div>
</div>

<!-- Line 375: reCAPTCHA script -->
<script src="https://www.google.com/recaptcha/api.js" async defer crossorigin="anonymous"></script>
```

**Configuration Options:**
- `data-sitekey`: Your public site key
- `data-theme`: "dark" or "light" (currently set to dark)
- `data-size`: "normal" or "compact" (optional)
- `data-callback`: JavaScript function to call on success (optional)

---

### JavaScript Implementation (main.js)

The FormController class now includes reCAPTCHA validation:

```javascript
// Validates reCAPTCHA before form submission
validateData(data) {
  // ... other validation ...
  
  // Validate reCAPTCHA
  const recaptchaResponse = this.getRecaptchaResponse();
  if (!recaptchaResponse) {
    this.showMessage('Please complete the reCAPTCHA verification.', 'error');
    return false;
  }
  
  return hasRequired && validEmail;
}

// Gets reCAPTCHA response token
getRecaptchaResponse() {
  if (typeof grecaptcha === 'undefined') {
    log('reCAPTCHA not loaded');
    return 'dev-mode'; // Allow development without reCAPTCHA
  }
  
  try {
    return grecaptcha.getResponse();
  } catch (error) {
    log('reCAPTCHA error:', error);
    return 'dev-mode';
  }
}

// Includes reCAPTCHA token in form data
getFormData() {
  const formData = new FormData(this.form);
  return {
    // ... other fields ...
    recaptchaToken: this.getRecaptchaResponse()
  };
}

// Resets reCAPTCHA after successful submission
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

## 🧪 Testing

### Local Development Testing

1. **Start Local Server**
   ```bash
   # Option 1: Firebase hosting
   firebase serve
   
   # Option 2: Python HTTP server
   python -m http.server 8080
   
   # Option 3: Node.js http-server
   npx http-server -p 8080
   ```

2. **Access via Localhost**
   - http://localhost:8080
   - http://127.0.0.1:8080

3. **Test reCAPTCHA**
   - Navigate to the "Contact" section
   - Fill out the form
   - Check the "I'm not a robot" checkbox
   - Submit the form
   - **Expected**: Form should submit successfully after reCAPTCHA validation

### Production Testing

1. **Deploy to Firebase**
   ```bash
   firebase deploy --only hosting
   ```

2. **Test on Production URL**
   - Visit your production URL
   - Complete the form with reCAPTCHA
   - Verify submission works

---

## 🔒 Backend Validation (Recommended)

For production security, you should verify the reCAPTCHA token on the server side.

### Firebase Cloud Function Example

Create a Cloud Function to validate the reCAPTCHA token:

```javascript
const functions = require('firebase-functions');
const axios = require('axios');

exports.validateRecaptcha = functions.https.onCall(async (data, context) => {
  const { token } = data;
  const secretKey = functions.config().recaptcha.secret; // Set via: firebase functions:config:set recaptcha.secret="YOUR_SECRET_KEY"
  
  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: secretKey,
          response: token,
          remoteip: context.rawRequest.ip
        }
      }
    );
    
    return {
      success: response.data.success,
      score: response.data.score,
      action: response.data.action
    };
  } catch (error) {
    console.error('reCAPTCHA validation error:', error);
    return { success: false, error: 'Validation failed' };
  }
});
```

### Update firebase-init.js

Add reCAPTCHA validation to the saveInquiry method:

```javascript
async saveInquiry(payload) {
  // ... existing validation ...
  
  // Validate reCAPTCHA token on backend (recommended for production)
  if (payload.recaptchaToken && payload.recaptchaToken !== 'dev-mode') {
    try {
      const validateRecaptcha = firebase.functions().httpsCallable('validateRecaptcha');
      const result = await validateRecaptcha({ token: payload.recaptchaToken });
      
      if (!result.data.success) {
        return {
          ok: false,
          error: 'reCAPTCHA verification failed. Please try again.'
        };
      }
    } catch (error) {
      console.error('reCAPTCHA backend validation error:', error);
      // Continue anyway for now (optional: make this strict in production)
    }
  }
  
  // Remove token from stored data
  const { recaptchaToken, ...sanitizedPayload } = this.sanitizePayload(payload);
  
  // ... continue with firestore save ...
}
```

---

## 🐛 Troubleshooting

### Issue: "ERROR for site owner: Invalid domain for site key"

**Solution:**
1. Go to reCAPTCHA admin console
2. Add `localhost` and `127.0.0.1` to the domains list
3. Wait 1-2 minutes for changes to propagate
4. Clear browser cache and reload page

### Issue: "Please complete the reCAPTCHA verification" even after checking

**Possible Causes:**
1. **reCAPTCHA script not loaded**
   - Check browser console for errors
   - Verify script tag is present: `<script src="https://www.google.com/recaptcha/api.js">`

2. **Incorrect site key**
   - Verify site key in HTML matches Google Console
   - Check for typos

3. **JavaScript error**
   - Check browser console for errors
   - Verify `grecaptcha` object is available

**Solution:**
```javascript
// Add to browser console to debug:
console.log('grecaptcha loaded:', typeof grecaptcha !== 'undefined');
console.log('grecaptcha response:', grecaptcha.getResponse());
```

### Issue: reCAPTCHA not appearing

**Possible Causes:**
1. **Script blocked by ad blocker**
   - Disable ad blocker temporarily
   - Check browser console for blocked requests

2. **CSS hiding the widget**
   - Inspect element to verify visibility
   - Check for `display: none` or `visibility: hidden`

3. **Content Security Policy (CSP) blocking**
   - Add to HTML `<head>` if using CSP:
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="frame-src https://www.google.com">
   ```

### Issue: "Timestamp is too far from current time"

**Solution:**
- Ensure system clock is correct
- reCAPTCHA requires accurate time for token validation

---

## 🎨 Customization

### Change Theme
```html
<!-- Light theme -->
<div class="g-recaptcha" data-theme="light" ...></div>

<!-- Dark theme (current) -->
<div class="g-recaptcha" data-theme="dark" ...></div>
```

### Change Size
```html
<!-- Normal size (current) -->
<div class="g-recaptcha" data-size="normal" ...></div>

<!-- Compact size -->
<div class="g-recaptcha" data-size="compact" ...></div>

<!-- Invisible reCAPTCHA (programmatic) -->
<div class="g-recaptcha" data-size="invisible" ...></div>
```

### Custom Callback
```html
<div class="g-recaptcha" 
     data-callback="onRecaptchaSuccess"
     data-expired-callback="onRecaptchaExpired" ...>
</div>

<script>
function onRecaptchaSuccess(token) {
  console.log('reCAPTCHA success:', token);
}

function onRecaptchaExpired() {
  console.log('reCAPTCHA expired, please verify again');
}
</script>
```

---

## 📊 Monitoring

### Check reCAPTCHA Analytics

1. Visit: https://www.google.com/recaptcha/admin
2. Select your site
3. View the **Analytics** tab to see:
   - Request count
   - Success rate
   - Failed attempts
   - Suspicious activity

### Set Up Alerts

In Google reCAPTCHA admin:
1. Go to **Settings** → **Advanced Settings**
2. Enable **Email notifications** for:
   - High traffic
   - Suspicious activity
   - Configuration changes

---

## 🔐 Security Best Practices

### ✅ DO:
- Always validate reCAPTCHA token on the backend
- Keep your secret key secure (never expose in client code)
- Use environment variables for secret key
- Monitor reCAPTCHA analytics regularly
- Set reasonable rate limits
- Add domains explicitly (don't use wildcards unnecessarily)

### ❌ DON'T:
- Don't commit secret keys to git
- Don't rely on client-side validation alone
- Don't skip backend verification in production
- Don't use the same site key across multiple projects
- Don't ignore suspicious activity alerts

---

## 📝 Quick Reference

### Site Key (Public - OK to expose)
```
6Lf8SLwrAAAAADyqwKLrfs-_4kFu053sjEtz3N6_
```

### Allowed Domains
```
localhost
127.0.0.1
buraq-ai-2670c.web.app
buraq-ai-2670c.firebaseapp.com
[your-production-domain]
```

### JavaScript API Methods
```javascript
// Get response token
grecaptcha.getResponse()

// Reset widget
grecaptcha.reset()

// Render widget programmatically
grecaptcha.render(container, parameters)

// Execute (for invisible reCAPTCHA)
grecaptcha.execute()
```

### Verification Endpoint (Backend)
```
POST https://www.google.com/recaptcha/api/siteverify
Parameters:
  - secret: YOUR_SECRET_KEY
  - response: TOKEN_FROM_CLIENT
  - remoteip: USER_IP (optional)
```

---

## 🆘 Support Resources

- **Google reCAPTCHA Docs**: https://developers.google.com/recaptcha
- **Admin Console**: https://www.google.com/recaptcha/admin
- **FAQ**: https://developers.google.com/recaptcha/docs/faq
- **Community**: https://groups.google.com/g/recaptcha

---

## ✅ Verification Checklist

Before going live:

- [ ] Site key added to HTML
- [ ] Localhost domains added in Google Console
- [ ] Production domains added in Google Console
- [ ] reCAPTCHA script loads without errors
- [ ] Form validation includes reCAPTCHA check
- [ ] reCAPTCHA resets after successful submission
- [ ] Backend validation implemented (recommended)
- [ ] Tested on localhost
- [ ] Tested on production
- [ ] Analytics monitoring enabled
- [ ] Error handling implemented
- [ ] Secret key secured (not in code)

---

**Last Updated**: November 24, 2025
**Version**: 2.0
