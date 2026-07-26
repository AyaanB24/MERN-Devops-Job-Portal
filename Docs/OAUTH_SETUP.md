# Quick OAuth Setup to See "Continue with Google" Button

## What You Need to Do

### Step 1: Get Google OAuth Credentials (2 minutes)

1. Go to: https://console.cloud.google.com/
2. Create a new project (name it "Job Portal")
3. Search for "Google+ API" and click "Enable"
4. Go to "Credentials" on the left
5. Click "Create Credentials" → "OAuth Client ID"
6. Select "Web Application"
7. Add these to "Authorized JavaScript origins":
   ```
   http://localhost:5173
   http://localhost:5000
   ```
8. Add this to "Authorized redirect URIs":
   ```
   http://localhost:5000/api/oauth/google/callback
   ```
9. Click "Create"
10. Copy your **Client ID** (you'll need this)

### Step 2: Add Client ID to Frontend (1 minute)

Create file: `frontend/.env.local`

Add this line:
```
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

(Replace `YOUR_CLIENT_ID_HERE` with the Client ID from Step 1)

### Step 3: Restart Frontend (1 minute)

Stop frontend (Ctrl+C in terminal)

Then restart:
```bash
cd frontend
npm run dev
```

## Done! ✅

Now when you go to:
- **Login page**: `http://localhost:5173/login` 
- **Register page**: `http://localhost:5173/register`

You should see the "Continue with Google" button below the form.

## Testing

1. Click "Continue with Google"
2. Select your Google account
3. Click "Allow"
4. Should redirect to dashboard

---

## What Each File Does

- **Backend**: `backend/src/controllers/oauthController.js` - Verifies Google tokens
- **Frontend**: `frontend/src/components/GoogleLoginButton.jsx` - Shows Google button
- **Routes**: Already configured in both frontend and backend

## Troubleshooting

**Don't see the button?**
- Check `frontend/.env.local` has VITE_GOOGLE_CLIENT_ID
- Restart frontend server
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console for errors (F12)

**Getting OAuth error?**
- Make sure URLs are added to Google Cloud Console
- Make sure Client ID in .env.local matches Google Console
- Wait 5 minutes for Google to update

---

That's it! You now have Google OAuth set up. 🎉
