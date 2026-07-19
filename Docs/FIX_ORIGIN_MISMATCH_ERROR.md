# Fix: Error 400 - origin_mismatch

## Problem

```
Access blocked: Authorisation error
Error 400: origin_mismatch
You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy.
If you're the app developer, register the JavaScript origin in the Google Cloud Console.
```

**What this means:** The origin (URL domain) where you're accessing the app from doesn't match what's registered in Google Cloud Console.

---

## Root Cause

**In Google Cloud Console**, you registered something like:
```
Authorized JavaScript origins:
- http://localhost:3001
```

**But you're accessing from:**
```
http://localhost  (port 80, not 3001)
http://192.168.1.100
http://your-domain.com
(or any other different origin)
```

---

## Solution

### Step 1: Identify Your Current Access URL

What URL are you using in your browser?

- ❓ `http://localhost` (port 80)
- ❓ `http://localhost:80`
- ❓ `http://localhost:3001` (port 3001)
- ❓ `http://192.168.x.x` (Docker/VM IP)
- ❓ `http://your-machine-name.local`
- ❓ Some other URL

**Note this down - we'll need it!**

### Step 2: Add Origin to Google Cloud Console

Go to: https://console.cloud.google.com/

1. Select your project (MERN-Job-Portal or similar)
2. Go to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID (Web client)
4. Under "Authorized JavaScript origins", click **+ ADD URI**

**Add BOTH:**
```
http://localhost:3001
http://localhost:80
http://localhost
```

Or if using Docker with different IP:
```
http://localhost
http://192.168.1.100
http://your-ip:80
```

5. **Save**

---

## For Docker Users

If you're running in Docker containers, your origin is likely:
- `http://localhost` (nginx on port 80)
- NOT `http://localhost:3001` (that's the dev server port)

### Add to Google Cloud Console:
```
Authorized JavaScript origins:
- http://localhost
- http://localhost:80
```

### Also update backend `.env`:
```env
# backend/.env
GOOGLE_REDIRECT_URI=http://localhost:5000/api/oauth/google/callback
FRONTEND_URL=http://localhost
```

---

## Complete Setup for All Scenarios

### Local Development (npm run dev)

**Google Cloud Console:**
```
Authorized JavaScript origins:
- http://localhost:3001
- http://localhost:3000
- http://127.0.0.1:3001
```

**frontend/.env.local:**
```
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

**backend/.env:**
```
GOOGLE_REDIRECT_URI=http://localhost:5000/api/oauth/google/callback
FRONTEND_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3001
```

### Docker Containers (nginx on port 80)

**Google Cloud Console:**
```
Authorized JavaScript origins:
- http://localhost
- http://localhost:80
```

**frontend/.env.local:**
```
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

**backend/.env:**
```
GOOGLE_REDIRECT_URI=http://localhost:5000/api/oauth/google/callback
FRONTEND_URL=http://localhost
CORS_ORIGIN=http://localhost
```

### Production (yourdomain.com)

**Google Cloud Console:**
```
Authorized JavaScript origins:
- https://yourdomain.com
- https://www.yourdomain.com
```

**backend/.env:**
```
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/oauth/google/callback
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

---

## Step-by-Step: Update Google Cloud Console

### Access Google Cloud Console

1. Go to: https://console.cloud.google.com/
2. Login with your Google account
3. Select your project from the dropdown

### Find OAuth Credentials

1. In left sidebar: **APIs & Services**
2. Click **Credentials**
3. Under "OAuth 2.0 Client IDs", find your Web client
4. Click on it to open details

### Add JavaScript Origins

1. Scroll to **Authorized JavaScript origins**
2. Click **+ ADD URI**
3. Enter your origin (e.g., `http://localhost`)
4. Click **Add URI** again for each origin
5. Click **Save** at bottom

### Verify It Worked

1. The page should show your origins in the list
2. Restart your frontend (dev server or Docker)
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try signing in again

---

## Common Origins to Add

| Scenario | Origins |
|----------|---------|
| Local dev | `http://localhost:3001`<br>`http://localhost:3000`<br>`http://127.0.0.1:3001` |
| Docker dev | `http://localhost`<br>`http://localhost:80` |
| Docker with IP | `http://192.168.1.100`<br>`http://192.168.1.100:80` |
| Production | `https://yourdomain.com`<br>`https://www.yourdomain.com` |

---

## Important: Authorized Redirect URIs Too

Make sure `Authorized redirect URIs` also includes:

```
http://localhost:5000/api/oauth/google/callback
```

(Backend port 5000)

---

## Debug Steps

### Check What Origin Is Being Used

Open browser console (F12) and run:

```javascript
console.log(window.location.origin)
```

This shows the exact origin being used.

### Check Backend Configuration

```bash
# In backend container
grep GOOGLE_REDIRECT_URI .env
grep FRONTEND_URL .env
```

### Check Frontend Configuration

```bash
# In browser console
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)
```

---

## After Fixing in Google Cloud Console

1. **Restart frontend** (if dev server) or **rebuild Docker image**
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Hard refresh page** (Ctrl+F5)
4. **Try signing in again**

---

## Still Not Working?

### Checklist

- ✅ Origin added to Google Cloud Console "Authorized JavaScript origins"
- ✅ Browser is accessing from that exact origin
- ✅ Frontend restarted/rebuilt
- ✅ Browser cache cleared
- ✅ Page hard-refreshed (Ctrl+F5)
- ✅ Backend running on port 5000
- ✅ FRONTEND_URL in backend/.env matches the origin
- ✅ GOOGLE_REDIRECT_URI in backend/.env is correct

### Additional Debug

Check browser Network tab (F12 → Network):
1. Look for the request to Google
2. Check the request URL/origin
3. Compare with what's in Google Cloud Console

Check backend logs:
```bash
docker logs jobportal_backend
# or
npm run dev (backend)
```

Look for OAuth verification errors

---

## Example: My Setup

**I'm running Docker on localhost**

```
Browser: http://localhost (port 80)
Backend: http://localhost:5000 (inside Docker)
```

**Google Cloud Console:**
```
Authorized JavaScript origins:
- http://localhost
- http://localhost:80

Authorized redirect URIs:
- http://localhost:5000/api/oauth/google/callback
```

**backend/.env:**
```
FRONTEND_URL=http://localhost
GOOGLE_REDIRECT_URI=http://localhost:5000/api/oauth/google/callback
CORS_ORIGIN=http://localhost
```

**This works! ✅**

---

## Reference

- Google OAuth Docs: https://developers.google.com/identity/protocols/oauth2/web-server-flow
- Google Cloud Console: https://console.cloud.google.com/
- OAuth 2.0 Origins: https://developers.google.com/identity/protocols/oauth2/web-server-flow#prerequisites
