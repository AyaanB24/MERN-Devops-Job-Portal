# Fix: Error 400 - origin_mismatch

**Problem**: When clicking "Continue with Google", you get:
```
Error 400: origin_mismatch
Access blocked: Authorisation error
You can't sign in to this app because it doesn't comply 
with Google's OAuth 2.0 policy.
```

**Cause**: The frontend URL `http://localhost:3001` is not registered in Google Cloud Console

---

## Quick Fix (2 minutes)

### Step 1: Open Google Cloud Console

1. Go to https://console.cloud.google.com/
2. Make sure your project is selected (dropdown at top)

### Step 2: Find OAuth Credentials

1. Click **Credentials** (left sidebar)
2. Look for your "Web Application" credential
3. Click the **edit icon** (pencil)

### Step 3: Add Authorized Origin

1. Find section: **"Authorized JavaScript origins"**
2. Click **+ ADD URI**
3. Enter: `http://localhost:3001`
4. Click **ADD** button

**Should look like**:
```
Authorized JavaScript origins:
✓ http://localhost:3001
✓ http://localhost:5173
✓ http://localhost:5000
```

### Step 4: Save

1. Scroll to bottom
2. Click **SAVE** button
3. Wait 1-2 minutes for propagation

### Step 5: Try Again

1. Go back to http://localhost:3001/login
2. Click "Continue with Google"
3. Should work now! ✅

---

## Why This Happened

Google requires you to explicitly list all URLs where your app can be accessed from. This is a security feature.

When you try to sign in from a URL that's not in the whitelist, Google blocks it.

---

## Common URLs to Add

Add these to Google Console (Authorized JavaScript origins):

```
For Development:
- http://localhost:3001
- http://localhost:5173
- http://localhost:5000

For Production:
- https://yourdomain.com
- https://api.yourdomain.com
```

---

## Still Getting Error?

Try these:

1. **Clear Browser Cache**
   - Press Ctrl+Shift+Delete
   - Clear all cookies & cache
   - Refresh page

2. **Wait Longer**
   - Google takes 1-5 minutes to propagate changes
   - Wait 5 minutes and try again

3. **Check Exact URL**
   - Make sure you're accessing from exactly `http://localhost:3001`
   - Not `http://127.0.0.1:3001`
   - Not `http://localhost:5173`

4. **Verify Client ID**
   - In `frontend/.env.local`:
     ```bash
     VITE_GOOGLE_CLIENT_ID=29489975186-m79...apps.googleusercontent.com
     ```
   - Make sure it's the SAME Client ID in Google Console

5. **Check Console**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for any JavaScript errors
   - Check Network tab - see if request is sent

---

## Verify It's Saved

1. Go to Google Cloud Console
2. Credentials → Edit your credential
3. Scroll to "Authorized JavaScript origins"
4. Should see: `http://localhost:3001` ✅

If you don't see it, go back to Step 3

---

## After Fix

Once you add the origin:

1. **Google button appears** on login/signup pages ✅
2. **Click it** → Google account selector opens ✅
3. **Select account** → Automatic redirect to dashboard ✅
4. **Logged in!** ✅

---

**Time to Fix**: 2-5 minutes  
**Difficulty**: Very Easy  
**Common Issue**: Yes, happens to everyone setting up OAuth

