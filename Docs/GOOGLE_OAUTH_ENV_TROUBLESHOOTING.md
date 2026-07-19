# Google OAuth - VITE_GOOGLE_CLIENT_ID Troubleshooting

## Issue: "Configure VITE_GOOGLE_CLIENT_ID in frontend/.env.local"

This message appears when clicking "Continue with Google" button.

---

## Why This Happens

The GoogleLoginButton component checks if `VITE_GOOGLE_CLIENT_ID` is configured:

```javascript
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
const isConfigured = clientId && clientId !== 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com'

if (!isConfigured) {
  // Show "Configure VITE_GOOGLE_CLIENT_ID..." button instead of Google button
}
```

**This error appears when:**
1. `.env.local` file doesn't exist
2. `VITE_GOOGLE_CLIENT_ID` is not set in `.env.local`
3. Frontend dev server hasn't restarted after adding `.env.local`
4. Placeholder value still in env

---

## Solution

### Step 1: Create/Check `frontend/.env.local`

**File:** `frontend/.env.local`

```env
# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=29489975186-m79qiv11a069j0dn3drq4dvr0nvf818j.apps.googleusercontent.com
```

**✅ File should exist** in `frontend/` directory (same level as `package.json`)

### Step 2: Verify the File

```bash
# Check file exists
ls -la frontend/.env.local

# Check content (should NOT be empty)
cat frontend/.env.local

# Output should contain:
# VITE_GOOGLE_CLIENT_ID=29489975186-m79qiv11a069j0dn3drq4dvr0nvf818j.apps.googleusercontent.com
```

### Step 3: Restart Frontend Dev Server

**IMPORTANT: You MUST restart the dev server!**

```bash
# Stop current dev server (Ctrl+C in terminal)

# Navigate to frontend
cd frontend

# Clear node_modules cache (optional but recommended)
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:3001
➜  press h + enter to show help
```

### Step 4: Check Environment Variable is Loaded

Open browser console (F12) and run:

```javascript
// In browser console
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)

// Should output:
// 29489975186-m79qiv11a069j0dn3drq4dvr0nvf818j.apps.googleusercontent.com
```

**If it shows `undefined`:**
- Dev server wasn't restarted
- Go back to Step 3

---

## Complete Workflow

### When You Click "Continue with Google":

```
┌─────────────────────────────────────────────┐
│  1. Frontend checks VITE_GOOGLE_CLIENT_ID   │
│     (from .env.local)                       │
└──────────────┬──────────────────────────────┘
               │
        ┌──────▼──────┐
        │ Is it set?  │
        └──┬───────┬──┘
        YES│      NO│
           │        │
    ┌──────▼─┐   ┌──▼──────────────────┐
    │ Show   │   │ Show error message: │
    │ Google │   │ "Configure          │
    │button  │   │ VITE_GOOGLE_CLIENT  │
    └────┬───┘   │ _ID..."             │
         │       └─────────────────────┘
    ┌────▼────────────────────────┐
    │ User clicks Google button   │
    └────┬─────────────────────────┘
         │
    ┌────▼────────────────────────────────────┐
    │ 2. Frontend passes CLIENT_ID to Google  │
    │    window.google.accounts.id.initialize │
    │    (uses VITE_GOOGLE_CLIENT_ID)         │
    └────┬─────────────────────────────────────┘
         │
    ┌────▼───────────────────────────────────┐
    │ 3. Google popup opens                  │
    │    User authenticates                  │
    │    Google returns ID token             │
    └────┬──────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────────┐
    │ 4. Frontend sends token to backend:      │
    │    POST /api/oauth/verify-google-token   │
    │    { idToken, role }                     │
    └────┬───────────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────────┐
    │ 5. Backend verifies token using:         │
    │    - GOOGLE_CLIENT_ID (from .env)        │
    │    - GOOGLE_CLIENT_SECRET (from .env)    │
    │    - GOOGLE_REDIRECT_URI (from .env)     │
    └────┬───────────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────┐
    │ 6. Backend creates/logs in user       │
    │    Returns JWT token                  │
    └────┬──────────────────────────────────┘
         │
    ┌────▼────────────────────────────────┐
    │ 7. Frontend stores token + redirects│
    │    to role selection or dashboard   │
    └─────────────────────────────────────┘
```

---

## What Each Environment Variable Does

### Frontend - `.env.local`

| Variable | Purpose | Used When |
|----------|---------|-----------|
| `VITE_GOOGLE_CLIENT_ID` | Google client ID | Initializing Google Sign-In button and authentication |

### Backend - `.env`

| Variable | Purpose | Used When |
|----------|---------|-----------|
| `GOOGLE_CLIENT_ID` | Google client ID | Verifying ID tokens from frontend |
| `GOOGLE_CLIENT_SECRET` | OAuth secret | Securely verifying tokens with Google's servers |
| `GOOGLE_REDIRECT_URI` | OAuth redirect | Callback after user authenticates |
| `FRONTEND_URL` | Frontend URL | Redirecting user after OAuth flow |

---

## Verification Checklist

- ✅ File `frontend/.env.local` exists
- ✅ Contains `VITE_GOOGLE_CLIENT_ID=...`
- ✅ Dev server restarted (`npm run dev`)
- ✅ Browser console shows correct CLIENT_ID
- ✅ Backend `.env` has `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- ✅ Backend running on port 5000
- ✅ Backend .env has `FRONTEND_URL=http://localhost:3001`

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Forgot to restart dev server | Kill terminal and run `npm run dev` again |
| Used `REACT_APP_GOOGLE_CLIENT_ID` instead of `VITE_` | Change to `VITE_GOOGLE_CLIENT_ID` (Vite requires VITE_ prefix) |
| `.env` instead of `.env.local` | Use `.env.local` (git-ignored, won't expose secrets) |
| Wrong backend port in GoogleLoginButton | Ensure backend is on port 5000 (`http://localhost:5000/api/oauth/verify-google-token`) |
| Backend doesn't have Google credentials | Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` to `backend/.env` |
| Frontend and backend CLIENT_ID mismatch | Both should use same Google Client ID |

---

## Quick Debug Steps

1. **Check env file exists:**
   ```bash
   cat frontend/.env.local
   ```

2. **Check env file is loaded in browser:**
   ```javascript
   // In browser console
   console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID)
   ```

3. **Check backend has credentials:**
   ```bash
   cat backend/.env | grep GOOGLE
   ```

4. **Test backend OAuth endpoint:**
   ```bash
   curl -X POST http://localhost:5000/api/oauth/verify-google-token \
     -H "Content-Type: application/json" \
     -d '{"idToken":"test"}'
   ```

---

## Still Not Working?

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh page** (Ctrl+F5)
3. **Check console for JavaScript errors** (F12 → Console tab)
4. **Check Network tab** for API calls
5. **Restart both frontend and backend servers**
6. **Verify Google OAuth credentials** are correct in Google Cloud Console

---

## Reference

- Frontend env loading: Vite requires `VITE_` prefix
- Backend uses standard `.env` with `process.env.GOOGLE_CLIENT_ID`
- Google OAuth docs: https://developers.google.com/identity/protocols/oauth2/web-server-flow
- Vite env docs: https://vitejs.dev/guide/env-and-modes.html
