# Quick Fix: origin_mismatch Error

## What's Happening?

You're accessing the app from origin **A**, but Google OAuth is configured for origin **B**.

---

## What URL Are You Using?

### Option 1: Docker (Most Likely)
You're probably accessing: `http://localhost` or `http://localhost:80`

But Google is configured for: `http://localhost:3001`

**FIX:**

1. Go to https://console.cloud.google.com/
2. APIs & Services → Credentials
3. Click your OAuth 2.0 Web Client
4. Under "Authorized JavaScript origins", add: `http://localhost`
5. Save
6. Refresh browser (Ctrl+F5)
7. Try again

---

### Option 2: Local Dev (npm run dev)
You're accessing: `http://localhost:3001`

**FIX:**

1. Go to https://console.cloud.google.com/
2. APIs & Services → Credentials
3. Click your OAuth 2.0 Web Client
4. Under "Authorized JavaScript origins", make sure it has: `http://localhost:3001`
5. If not there, add it
6. Save
7. Refresh browser (Ctrl+F5)
8. Try again

---

### Option 3: Using Machine IP (192.168.x.x)
You're accessing: `http://192.168.1.100` or similar

**FIX:**

1. Go to https://console.cloud.google.com/
2. APIs & Services → Credentials
3. Click your OAuth 2.0 Web Client
4. Under "Authorized JavaScript origins", add: `http://192.168.1.100`
5. Save
6. Refresh browser (Ctrl+F5)
7. Try again

---

## Check Your Current Origin

Open browser console (F12) and run:

```javascript
console.log(window.location.origin)
```

**This is the origin that needs to be in Google Cloud Console!**

---

## The Complete Fix Process

1. **Open Google Cloud Console:** https://console.cloud.google.com/
2. **Select your project**
3. **Go to:** APIs & Services → Credentials
4. **Find:** Your OAuth 2.0 Web Client
5. **Click it** to open details
6. **Add your current origin:**
   - Look at what `console.log(window.location.origin)` shows
   - Add that to "Authorized JavaScript origins"
7. **ALSO make sure:**
   - Authorized redirect URIs includes: `http://localhost:5000/api/oauth/google/callback`
8. **Click Save**
9. **Close and clear browser cache:** Ctrl+Shift+Delete
10. **Hard refresh:** Ctrl+F5
11. **Try signing in again**

---

## You Must Add:

### In Google Cloud Console

**Authorized JavaScript origins:**
```
http://localhost
```
(or whatever your current origin is)

**Authorized redirect URIs:**
```
http://localhost:5000/api/oauth/google/callback
```

---

## Files to Check (if needed)

- `backend/.env` → Check `FRONTEND_URL=` matches your origin
- `frontend/.env.local` → Should have `VITE_GOOGLE_CLIENT_ID=...`

---

## That's It!

After adding the origin to Google Cloud Console and refreshing your browser, it should work! 🎉

---

## Still Stuck?

See the full guide: `Docs/FIX_ORIGIN_MISMATCH_ERROR.md`
