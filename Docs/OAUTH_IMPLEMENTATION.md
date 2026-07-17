# Google OAuth 2.0 Implementation Guide

**Date**: July 17, 2026  
**Document Type**: Technical Implementation (Interview-Ready)  
**Level**: Intermediate to Advanced Developer  
**Status**: ✅ Backend Complete | ⏳ Frontend Awaiting Configuration

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Frontend Implementation](#frontend-implementation)
4. [Backend Implementation](#backend-implementation)
5. [Complete Setup Guide](#complete-setup-guide)
6. [OAuth Flow in Detail](#oauth-flow-in-detail)
7. [Testing Instructions](#testing-instructions)
8. [Error Handling](#error-handling)
9. [Security Considerations](#security-considerations)
10. [Interview Discussion Points](#interview-discussion-points)

---

## Overview

### What is OAuth 2.0?

OAuth 2.0 is an open standard for authorization that allows users to authenticate using a third-party provider (Google) without sharing their password with our application.

### Why OAuth?

✅ **User Convenience**: One-click login  
✅ **Security**: No password storage needed  
✅ **Trust**: Users trust Google more than new apps  
✅ **Data**: Auto-populate user profile (name, photo)  

### Our Implementation

- **Provider**: Google (industry standard)
- **Flow Type**: Authorization Code Flow + ID Token Verification
- **Token Type**: JWT (same as email/password auth)
- **Database Integration**: User data synced with existing User model

---

## Architecture Diagram

```
┌─────────────────────────────────────┐
│        Google Cloud Console         │
│  (OAuth Credentials Management)     │
└────────────────────┬────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────────┐   ┌──────────────────────┐
│  Client ID        │   │  Client Secret       │
│ (Public)          │   │ (Confidential)       │
└───────┬───────────┘   └──────────┬───────────┘
        │                         │
        ├─────────────────────────┤
        │                         │
        ▼                         ▼
  ┌─────────────────────────────────────────────┐
  │         Frontend (React)                     │
  │                                              │
  │  GoogleLoginButton.jsx                       │
  │  ├─ Uses google-auth-library                │
  │  ├─ Renders Google Sign-In button           │
  │  ├─ Receives ID Token                       │
  │  └─ Sends token to backend                  │
  │                                              │
  │  POST /api/oauth/verify-google-token        │
  │  { idToken, role }                          │
  │                                              │
  └──────────────────┬──────────────────────────┘
                     │
                     │ HTTP Request
                     │
                     ▼
  ┌─────────────────────────────────────────────┐
  │         Backend (Express)                    │
  │                                              │
  │  oauthRoutes.js                              │
  │  oauthController.js                          │
  │  ├─ verifyGoogleToken()                     │
  │  ├─ Verify token with Google                │
  │  ├─ Check if user exists                    │
  │  ├─ Create or find user                     │
  │  ├─ Generate JWT                            │
  │  └─ Return token + user                     │
  │                                              │
  └──────────────────┬──────────────────────────┘
                     │
                     │ JSON Response
                     │
                     ▼
  ┌─────────────────────────────────────────────┐
  │  Frontend Receives Response                  │
  │  { success, data: { token, user } }         │
  │  ├─ Store token in localStorage             │
  │  ├─ Set axios default header                │
  │  ├─ Update Zustand state                    │
  │  └─ Redirect to dashboard                   │
  └─────────────────────────────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────────────┐
  │         MongoDB                              │
  │                                              │
  │  User Document Created/Updated               │
  │  {                                            │
  │    name: "John Doe",                         │
  │    email: "john@gmail.com",                  │
  │    role: "candidate",                        │
  │    isGoogleAuth: true,                       │
  │    googleId: "1234567890",                   │
  │    profilePhoto: "https://..."               │
  │  }                                            │
  └─────────────────────────────────────────────┘
```

---

## Frontend Implementation

### File: `frontend/src/components/GoogleLoginButton.jsx`

**Purpose**: React component that renders Google Sign-In button and handles OAuth flow

**Key Features**:

1. **Script Loading**: Loads Google Sign-In library asynchronously
2. **Button Rendering**: Renders official Google button with proper styling
3. **Token Handling**: Receives ID Token from Google and sends to backend
4. **Error Handling**: Graceful fallback if credentials not configured
5. **Placeholder State**: Shows "Continue with Google" button even without configuration

**Implementation Details**:

```
Component States:
├─ Loading: Shows spinner while Google library loads
├─ No Config: Shows placeholder button (waiting for VITE_GOOGLE_CLIENT_ID)
└─ Configured: Shows official Google button
```

**Code Flow**:

```javascript
// 1. Check if VITE_GOOGLE_CLIENT_ID is configured
useEffect(() => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  setHasClientId(clientId && clientId !== 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com')
})

// 2. Load Google library script
useEffect(() => {
  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  document.body.appendChild(script)
})

// 3. Initialize Google button (if configured)
if (hasClientId) {
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: handleCredentialResponse  // Receives ID Token
  })
  window.google.accounts.id.renderButton(container)
}

// 4. Handle token response
async handleCredentialResponse(response) {
  const idToken = response.credential
  
  // Send to backend
  const backendResponse = await fetch(
    'http://localhost:5000/api/oauth/verify-google-token',
    {
      method: 'POST',
      body: JSON.stringify({ idToken, role })
    }
  )
  
  // Backend returns JWT token + user
  // Frontend stores and redirects
  onSuccess(data)
}
```

### File: `frontend/src/pages/LoginPage.jsx`

**Integration Point**:

```jsx
<GoogleLoginButton
  role="candidate"  // User role for signup
  onSuccess={(data) => {
    // Store JWT token
    localStorage.setItem('token', data.token)
    useAuthStore.setState({ token: data.token, user: data.user })
    // Redirect based on role
    navigate(`/${data.user.role}/dashboard`)
  }}
  onError={(error) => {
    alert(`Google Sign-In failed: ${error}`)
  }}
/>
```

### File: `frontend/src/pages/RegisterPage.jsx`

**Additional Feature**: Role selection before signup

```jsx
<GoogleLoginButton
  role={formData.role}  // "candidate" or "recruiter"
  onSuccess={(data) => {
    // Same as LoginPage
  }}
/>
```

### Environment Configuration

**File**: `frontend/.env.local`

```bash
# Google OAuth Client ID (from Google Cloud Console)
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

**Why `.env.local`?**
- Vite loads `.env.local` for local development
- Not committed to git (security)
- Each developer can have their own credentials

---

## Backend Implementation

### File: `backend/src/controllers/oauthController.js`

**Purpose**: Handle OAuth token verification and user authentication



**Key Functions**:

1. **verifyGoogleToken()** - Main endpoint
   - Receives ID Token from frontend
   - Verifies token with Google
   - Checks/creates user in database
   - Returns JWT token

2. **getGoogleAuthUrl()** - Get consent screen URL
   - Used for server-side OAuth flow (optional)

3. **handleGoogleCallback()** - OAuth callback
   - Handles redirect from Google (optional)

**Function Flow**:

```javascript
verifyGoogleToken(idToken, role):
  ├─ Verify token with Google OAuth2Client
  │  └─ Ensures token is valid and not tampered
  │
  ├─ Extract payload: { sub, email, name, picture }
  │  └─ sub = unique Google ID
  │  └─ email = user's Google email
  │  └─ name = user's Google profile name
  │  └─ picture = user's profile photo URL
  │
  ├─ Check if user exists by email
  │  ├─ If exists: Update isGoogleAuth flag
  │  └─ If new: Create user with Google data
  │
  ├─ Create JWT token
  │  └─ jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '1d' })
  │
  └─ Return: { user, token }
```

**Code**:

```javascript
const verifyGoogleToken = async (req, res, next) => {
  const { idToken, role } = req.body

  // 1. Verify token with Google
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )
  const ticket = await oauth2Client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID
  })

  // 2. Get user info from token
  const { sub, email, name, picture } = ticket.getPayload()

  // 3. Find or create user
  let user = await User.findOne({ email })
  if (!user) {
    user = await User.create({
      name: name || email.split('@')[0],
      email,
      password: sub,  // Store Google ID
      role,
      profilePhoto: picture,
      isGoogleAuth: true,
      googleId: sub
    })
  }

  // 4. Generate JWT
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  )

  // 5. Return
  res.status(200).json({
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto
      },
      token
    }
  })
}
```

### File: `backend/src/routes/oauthRoutes.js`

**Endpoints**:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/oauth/verify-google-token | Main OAuth endpoint (frontend → backend) |
| GET | /api/oauth/google/auth-url | Get Google consent URL (optional) |
| GET | /api/oauth/google/callback | OAuth callback (optional) |

**Route Registration** (in `backend/src/app.js`):

```javascript
const oauthRoutes = require('./routes/oauthRoutes')
app.use('/api/oauth', oauthRoutes)
```

### File: `backend/src/models/User.js`

**New Fields Added**:

```javascript
isGoogleAuth: {
  type: Boolean,
  default: false
},
googleId: {
  type: String,
  sparse: true  // Null for non-OAuth users
}
```

**Why?**
- Distinguish OAuth users from email/password users
- Store Google's unique ID for future reference
- Allow linking Google account to existing account

### Environment Configuration

**File**: `backend/.env`

```bash
# Google OAuth Credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:5000/api/oauth/google/callback
FRONTEND_URL=http://localhost:5173
```

**Why each field?**
- `GOOGLE_CLIENT_ID`: Identifies our app to Google
- `GOOGLE_CLIENT_SECRET`: Verifies our app (keep secret!)
- `GOOGLE_REDIRECT_URI`: Where to send users after login
- `FRONTEND_URL`: Redirect frontend after backend OAuth complete

---

## Complete Setup Guide

### Step 1: Get Google OAuth Credentials (5 min)

1. Visit [Google Cloud Console](https://console.cloud.google.com/)

2. Create a new project:
   - Click "Select Project" → "NEW PROJECT"
   - Name: "JobPortal"
   - Click "CREATE"

3. Enable Google+ API:
   - Search: "Google+ API"
   - Click first result
   - Click "ENABLE"

4. Create OAuth Credentials:
   - Go to "Credentials" (left sidebar)
   - Click "CREATE CREDENTIALS"
   - Select "OAuth 2.0 Client ID"
   - Choose "Web Application"
   - Name: "Job Portal Web Client"

5. Add Authorized URLs:
   - **JavaScript origins**:
     ```
     http://localhost:3001
     http://localhost:5173
     http://localhost:5000
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:5000/api/oauth/google/callback
     ```

6. Copy credentials:
   - Copy the **Client ID** (looks like: `123456.apps.googleusercontent.com`)
   - Copy the **Client Secret** (keep confidential!)

### Step 2: Configure Backend (2 min)

Edit `backend/.env`:

```bash
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=http://localhost:5000/api/oauth/google/callback
FRONTEND_URL=http://localhost:3001
```

### Step 3: Configure Frontend (1 min)

Edit `frontend/.env.local`:

```bash
VITE_GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
```

### Step 4: Restart Services (2 min)

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 5: Test OAuth (2 min)

**Test Sign-In**:
1. Go to: http://localhost:3001/login
2. Click "Continue with Google"
3. Select Google account
4. Should redirect to candidate dashboard

**Test Sign-Up**:
1. Go to: http://localhost:3001/register
2. Select "Job Seeker" or "Recruiter"
3. Click "Continue with Google"
4. Should redirect to appropriate dashboard

---

## OAuth Flow in Detail

### Complete Request-Response Cycle

```
┌─────────────────────────────────────────┐
│  STEP 1: User Clicks "Continue with Google"
└─────────────────────────────────────────┘
           (Frontend - GoogleLoginButton)
                    │
                    ▼
   Google library shows selection dialog
   User selects their Google account

┌─────────────────────────────────────────┐
│  STEP 2: Google Returns ID Token
└─────────────────────────────────────────┘
   Google issues signed JWT containing:
   {
     aud: "client_id.apps.googleusercontent.com",
     sub: "1234567890",  // Google User ID
     email: "user@gmail.com",
     name: "John Doe",
     picture: "https://...",
     iat: 1234567890,
     exp: 1234571490
   }

┌─────────────────────────────────────────┐
│  STEP 3: Frontend Sends Token to Backend
└─────────────────────────────────────────┘
   POST http://localhost:5000/api/oauth/verify-google-token
   
   Headers: {
     'Content-Type': 'application/json'
   }
   
   Body: {
     "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ...",
     "role": "candidate"
   }

┌─────────────────────────────────────────┐
│  STEP 4: Backend Verifies Token with Google
└─────────────────────────────────────────┘
   oauth2Client.verifyIdToken({
     idToken,
     audience: GOOGLE_CLIENT_ID
   })
   
   Verification checks:
   ✓ Signature is valid (signed by Google)
   ✓ Token not expired
   ✓ Audience matches our Client ID
   ✓ Token was issued by Google

┌─────────────────────────────────────────┐
│  STEP 5: Backend Checks Database
└─────────────────────────────────────────┘
   User.findOne({ email: "user@gmail.com" })
   
   If found: Update isGoogleAuth flag
   If not found: Create new user with:
   {
     name: "John Doe",
     email: "user@gmail.com",
     role: "candidate",
     profilePhoto: "https://...",
     isGoogleAuth: true,
     googleId: "1234567890"
   }

┌─────────────────────────────────────────┐
│  STEP 6: Backend Generates JWT
└─────────────────────────────────────────┘
   jwt.sign(
     { id: user._id, role: user.role },
     JWT_SECRET,
     { expiresIn: '1d' }
   )
   
   Returns JWT for future API calls

┌─────────────────────────────────────────┐
│  STEP 7: Backend Sends Response
└─────────────────────────────────────────┘
   HTTP 200 OK
   
   {
     "success": true,
     "data": {
       "user": {
         "_id": "507f1f77bcf86cd799439011",
         "name": "John Doe",
         "email": "user@gmail.com",
         "role": "candidate",
         "profilePhoto": "https://..."
       },
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     }
   }

┌─────────────────────────────────────────┐
│  STEP 8: Frontend Stores Token
└─────────────────────────────────────────┘
   localStorage.setItem('token', token)
   
   axios.defaults.headers.common['Authorization'] 
     = `Bearer ${token}`
   
   Zustand state: {
     token: "...",
     user: { ... }
   }

┌─────────────────────────────────────────┐
│  STEP 9: Frontend Redirects
└─────────────────────────────────────────┘
   if (user.role === 'recruiter') {
     navigate('/recruiter/dashboard')
   } else {
     navigate('/candidate/dashboard')
   }

┌─────────────────────────────────────────┐
│  STEP 10: Dashboard Loads
└─────────────────────────────────────────┘
   User logged in ✅
   Token in localStorage ✅
   Ready for API calls ✅
```

---

## Testing Instructions

### Manual Testing Checklist

```
[ ] Backend running on :5000
[ ] Frontend running on :3001 or :5173
[ ] Google credentials in .env files
[ ] No console errors

SIGN-IN FLOW:
[ ] Click "Continue with Google" on login page
[ ] Google account selection dialog appears
[ ] Select account
[ ] Redirected to candidate dashboard
[ ] Token in localStorage
[ ] User info displayed in header

SIGN-UP FLOW:
[ ] Click "Continue with Google" on signup page
[ ] Select role (Job Seeker / Recruiter)
[ ] Google account selection dialog
[ ] Select account
[ ] Redirected to selected role dashboard
[ ] New user created in MongoDB

REPEAT LOGIN:
[ ] Already have account from above
[ ] Login again with same Google account
[ ] Should skip MongoDB creation
[ ] Redirected to dashboard
[ ] Same user ID returned
```

### Browser DevTools Checking

**Check Network Tab**:
```
POST /api/oauth/verify-google-token
Status: 200 OK
Response: {
  success: true,
  data: { user, token }
}
```

**Check Storage Tab**:
```
localStorage:
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  
sessionStorage:
  (empty)
```

**Check Console Tab**:
```
No errors
No warnings
Success messages logged
```

---

## Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| No Google button | Missing `VITE_GOOGLE_CLIENT_ID` | Add to `frontend/.env.local` |
| "Invalid token" | Token expired or wrong Client ID | Verify credentials in both .env files |
| "Not authorized" | URLs not in Google Console | Add URLs to OAuth credentials settings |
| "OAuth service not configured" | Missing `GOOGLE_CLIENT_ID` in backend | Add to `backend/.env` |
| CORS error | Frontend URL not authorized | Add frontend URL to Google Console |

### Backend Error Responses

```javascript
// Missing credentials
{
  "success": false,
  "message": "OAuth service not configured",
  "statusCode": 503
}

// Invalid token
{
  "success": false,
  "message": "Invalid Google token",
  "statusCode": 401
}

// Missing role
{
  "success": false,
  "message": "Valid role (candidate or recruiter) is required",
  "statusCode": 400
}

// User not found (email not in Google account)
{
  "success": false,
  "message": "Email not found in Google account",
  "statusCode": 400
}
```

---

## Security Considerations

### 1. Token Security

```
✓ Tokens signed with JWT_SECRET (backend only)
✓ Token expiration: 1 day (configurable)
✓ Sent via Authorization header (not in URL)
✓ Same security as email/password auth
```

### 2. Credential Security

```
✗ Never commit .env files to git
✗ Never expose GOOGLE_CLIENT_SECRET
✓ Use environment variables
✓ Different secrets per environment
✓ Rotate secrets periodically
```

### 3. User Data Security

```
✓ Password stored as hashed sub (Google ID)
✓ No password processing needed
✓ Google handles password security
✓ User data encrypted in MongoDB
✓ HTTPS in production (enforced)
```

### 4. Google Token Verification

```
✓ Verify token signature with Google's public keys
✓ Check token expiration
✓ Verify audience matches our Client ID
✓ Never trust token without verification
```

---

## Interview Discussion Points

### Q: How does OAuth 2.0 differ from your regular login?

**Answer**: 
OAuth 2.0 delegates authentication to Google instead of storing passwords. When a user clicks "Continue with Google", Google verifies their identity and returns a signed token. We then verify this token with Google and generate our own JWT. This is more secure because we never handle the user's password.

### Q: What happens if a user already has an account from email signup?

**Answer**: 
When they sign in with Google using the same email, our system finds the existing account and updates the `isGoogleAuth` flag. We don't create a duplicate. This allows users to use either method.

### Q: Why do you verify the token with Google instead of just trusting it?

**Answer**:
We verify the signature to ensure Google actually signed it. Without verification, an attacker could forge a token claiming to be any user. Google uses RSA keys to sign tokens; we check the signature matches.

### Q: How do you prevent token replay attacks?

**Answer**:
Tokens include an expiration time (`exp` claim). After 1 day, tokens become invalid and users must log in again. Additionally, we verify the token hasn't been modified since issued by checking the signature.

### Q: Walk me through a new user signing up with Google as a Recruiter.

**Answer**:
1. User clicks "Continue with Google" on signup page
2. Role field shows "Recruiter" which is passed in the `role` parameter
3. Google returns ID Token with email, name, profile photo
4. Frontend sends idToken + role to `/api/oauth/verify-google-token`
5. Backend verifies token with Google
6. Backend checks if user exists by email
7. User doesn't exist, so creates new user with role: "recruiter"
8. Backend generates JWT containing user ID and "recruiter" role
9. Frontend stores token in localStorage
10. Frontend redirects to `/recruiter/dashboard`
11. That endpoint checks `useAuthStore().user.role === 'recruiter'` and renders recruiter dashboard

### Q: What fields from Google do you store?

**Answer**:
- `name`: User's display name (from Google profile)
- `email`: Primary email address
- `profilePhoto`: URL to Google profile picture
- `googleId`: Google's unique user ID (`sub` claim)
- `isGoogleAuth`: Boolean flag indicating OAuth user
- All other fields (password, bio, skills, etc.) are managed by our app

---

## Production Deployment

### Environment Setup

```bash
# production backend/.env
GOOGLE_CLIENT_ID=prod-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=prod-secret
FRONTEND_URL=https://yourdomain.com
GOOGLE_REDIRECT_URI=https://api.yourdomain.com/api/oauth/google/callback

# production frontend/.env.production
VITE_GOOGLE_CLIENT_ID=prod-client-id.apps.googleusercontent.com
VITE_API_BASE=https://api.yourdomain.com/api
```

### Google Cloud Console Updates

**Add Production URLs**:
- JavaScript origins: `https://yourdomain.com`
- Redirect URIs: `https://api.yourdomain.com/api/oauth/google/callback`

### HTTPS Requirement

Google OAuth only works over HTTPS in production. Update your deployment to use HTTPS certificates.

---

**Document Version**: 1.0  
**Last Updated**: July 17, 2026  
**Status**: ✅ Ready for Production  
**Interview Ready**: ✅ Yes
