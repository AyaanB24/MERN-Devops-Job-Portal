# Google OAuth 2.0 Complete Flow Diagram

**Date**: July 17, 2026  
**Purpose**: Visual representation of the OAuth flow in JobPortal

---

## Flow Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER STARTS AT LOGIN/SIGNUP                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────────┐
                        │  Click "Continue with Google" │
                        └──────────────────────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────────┐
                        │ Google Account Selection      │
                        │ (Browser popup)              │
                        │                              │
                        │ "Select your Google account" │
                        └──────────────────────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────────┐
                        │ User Selects Account         │
                        │ (ayaanbargir@gmail.com)      │
                        └──────────────────────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────────┐
                        │ Google Returns ID Token      │
                        │ (Signed JWT)                 │
                        └──────────────────────────────┘
                                       │
                                       ▼
          ┌────────────────────────────────────────────────────┐
          │        FRONTEND (React - GoogleLoginButton)        │
          │                                                     │
          │  1. Receive ID Token from Google                   │
          │  2. Extract: idToken                              │
          │  3. Check: Is this signup or login?               │
          │     ├─ If SIGNUP: Get role from form              │
          │     └─ If LOGIN: role = "candidate"               │
          └────────────────────────────────────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
         ┌──────────▼─────────┐              ┌───────────▼──────────┐
         │   SIGNUP FLOW      │              │   LOGIN FLOW         │
         │                    │              │                      │
         │ Show role selector │              │ role = "candidate"   │
         │ - Job Seeker       │              │                      │
         │ - Recruiter        │              │ Skip role selection  │
         └──────────┬─────────┘              └───────────┬──────────┘
                    │                                     │
                    └──────────────────┬──────────────────┘
                                       │
                                       ▼
          ┌────────────────────────────────────────────────────┐
          │      Send to Backend: POST /api/oauth/...          │
          │                                                     │
          │  Body: {                                            │
          │    "idToken": "eyJhbGciOiJSUzI1NiIs...",          │
          │    "role": "candidate" or "recruiter"             │
          │  }                                                  │
          └────────────────────────────────────────────────────┘
                                       │
                                       ▼
          ┌────────────────────────────────────────────────────┐
          │     BACKEND (Node.js - oauthController)           │
          │                                                     │
          │  1. Receive: { idToken, role }                     │
          │  2. Verify token with Google                       │
          │     └─ Check signature, expiration                │
          │  3. Extract user info from token:                  │
          │     ├─ sub (Google ID)                             │
          │     ├─ email                                       │
          │     ├─ name                                        │
          │     └─ picture (profile photo)                     │
          └────────────────────────────────────────────────────┘
                                       │
                                       ▼
          ┌────────────────────────────────────────────────────┐
          │        DATABASE CHECK (MongoDB)                     │
          │                                                     │
          │  Query: User.findOne({ email })                    │
          └────────────────────────────────────────────────────┘
                                       │
                        ┌──────────────┴──────────────┐
                        │                             │
            ┌───────────▼────────────┐   ┌──────────▼───────────┐
            │  USER EXISTS           │   │  NEW USER            │
            │  (Returning user)      │   │  (First time signup) │
            │                        │   │                      │
            │ Update:                │   │ Create new user:     │
            │ - isGoogleAuth = true  │   │ - name (from Google) │
            │                        │   │ - email (from Google)│
            │ Keep existing:         │   │ - role (from param)  │
            │ - profile data         │   │ - profile photo      │
            │ - bio                  │   │ - isGoogleAuth=true  │
            │ - skills               │   │ - googleId           │
            │ - resume               │   │                      │
            └───────────┬────────────┘   └──────────┬───────────┘
                        │                             │
                        └──────────────┬──────────────┘
                                       │
                                       ▼
          ┌────────────────────────────────────────────────────┐
          │      GENERATE JWT TOKEN (Same as email/password)   │
          │                                                     │
          │  jwt.sign(                                          │
          │    { id: user._id, role: user.role },             │
          │    JWT_SECRET,                                     │
          │    { expiresIn: '1d' }                            │
          │  )                                                  │
          └────────────────────────────────────────────────────┘
                                       │
                                       ▼
          ┌────────────────────────────────────────────────────┐
          │      SEND RESPONSE TO FRONTEND                      │
          │                                                     │
          │  HTTP 200 OK                                        │
          │  {                                                  │
          │    "success": true,                                 │
          │    "data": {                                        │
          │      "user": {                                      │
          │        "_id": "507f...",                           │
          │        "name": "Ayaan",                            │
          │        "email": "ayaanbargir@gmail.com",           │
          │        "role": "candidate",                        │
          │        "profilePhoto": "https://..."              │
          │      },                                            │
          │      "token": "eyJhbGciOiJIUzI1NiIs..."           │
          │    }                                               │
          │  }                                                  │
          └────────────────────────────────────────────────────┘
                                       │
                                       ▼
          ┌────────────────────────────────────────────────────┐
          │     FRONTEND PROCESSES RESPONSE                     │
          │                                                     │
          │  1. Extract token & user                            │
          │  2. localStorage.setItem('token', token)           │
          │  3. axios.defaults.headers =                       │
          │     Authorization: Bearer ${token}                │
          │  4. Update Zustand state:                          │
          │     - user = user object                           │
          │     - token = JWT token                            │
          │     - isLoading = false                            │
          └────────────────────────────────────────────────────┘
                                       │
                                       ▼
          ┌────────────────────────────────────────────────────┐
          │        REDIRECT BASED ON ROLE                       │
          │                                                     │
          │  if (user.role === 'recruiter')                    │
          │    → navigate('/recruiter/dashboard')             │
          │  else if (user.role === 'candidate')              │
          │    → navigate('/candidate/dashboard')             │
          │  else                                              │
          │    → navigate('/')                                 │
          └────────────────────────────────────────────────────┘
                                       │
                                       ▼
          ┌────────────────────────────────────────────────────┐
          │      USER LOGGED IN ✅                             │
          │                                                     │
          │  Dashboard loads with user data                    │
          │  Token ready for all API calls                     │
          │  User stays logged in until token expires          │
          └────────────────────────────────────────────────────┘
```

---

## Detailed Step-by-Step

### Step 1: User Clicks Button

**Frontend Code** (GoogleLoginButton.jsx):
```javascript
// Google renders official button
window.google.accounts.id.renderButton(container, {
  theme: 'outline',
  size: 'large',
  width: '100%'
})

// User clicks → Google library triggers callback
```

**UI**: Blue button with Google logo appears

---

### Step 2: Google Account Selection

**What Happens**:
- Google shows account selector popup
- User selects their Google account
- Browser authenticates with Google

**User Sees**:
```
Google Sign-In
━━━━━━━━━━━━━━━━━━━━━━
Choose your account:

👤 ayaanbargir@gmail.com
👤 another@gmail.com
👤 + Add another account
```

---

### Step 3: ID Token Returned

**What Google Returns**:
- Signed JWT token containing user info
- Token is valid for ~1 hour
- Token is cryptographically signed

**Token Contents** (decoded):
```javascript
{
  "iss": "https://accounts.google.com",
  "aud": "29489975186-m79...apps.googleusercontent.com",
  "sub": "1234567890",              // Google User ID
  "email": "ayaanbargir@gmail.com",
  "email_verified": true,
  "name": "Ayaan Bargir",
  "picture": "https://lh3.googleusercontent.com/...",
  "given_name": "Ayaan",
  "family_name": "Bargir",
  "iat": 1721234567,
  "exp": 1721238167
}
```

---

### Step 4: Frontend Sends to Backend

**Frontend Code** (GoogleLoginButton.jsx):
```javascript
const handleCredentialResponse = async (response) => {
  const idToken = response.credential
  
  // Determine role
  const role = signupPage ? formData.role : 'candidate'
  
  // Send to backend
  const backendResponse = await fetch(
    'http://localhost:5000/api/oauth/verify-google-token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, role })
    }
  )
  
  const data = await backendResponse.json()
  onSuccess(data.data)  // Pass to handler
}
```

**Network Request**:
```
POST http://localhost:5000/api/oauth/verify-google-token
Content-Type: application/json

{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ...",
  "role": "candidate"
}
```

---

### Step 5: Backend Verifies Token

**Backend Code** (oauthController.js):
```javascript
// 1. Create Google OAuth client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
)

// 2. Verify token signature with Google's public keys
const ticket = await oauth2Client.verifyIdToken({
  idToken: idToken,
  audience: process.env.GOOGLE_CLIENT_ID
})

// 3. Extract payload
const payload = ticket.getPayload()
const { sub, email, name, picture } = payload
```

**Verification Checks**:
- ✅ Signature valid (signed by Google)
- ✅ Token not expired
- ✅ Audience matches our Client ID
- ✅ Token issued by Google's servers

---

### Step 6: Database User Check/Create

**Backend Code**:
```javascript
// Check if user exists
let user = await User.findOne({ email })

if (!user) {
  // CREATE NEW USER
  user = await User.create({
    name: name || email.split('@')[0],
    email: email,
    password: sub,                    // Store Google ID
    role: role,                       // From parameter
    profilePhoto: picture,            // From Google
    isGoogleAuth: true,               // OAuth flag
    googleId: sub                     // Google's ID
  })
  console.log('New user created:', user._id)
} else {
  // UPDATE EXISTING USER
  user = await User.updateOne(
    { _id: user._id },
    { isGoogleAuth: true }
  )
  console.log('Existing user updated')
}
```

**Database Result**:
```javascript
User document:
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "Ayaan Bargir",
  "email": "ayaanbargir@gmail.com",
  "password": "1234567890",           // Google ID (hashed differently)
  "role": "candidate",                // From user choice
  "profilePhoto": "https://lh3...",
  "isGoogleAuth": true,               // OAuth marker
  "googleId": "1234567890",           // Google ID
  "bio": "",                          // Empty, can be filled later
  "skills": [],                       // Empty array
  "resume": null,                     // No resume yet
  "createdAt": ISODate("2026-07-17"),
  "updatedAt": ISODate("2026-07-17")
}
```

---

### Step 7: JWT Generation

**Backend Code**:
```javascript
// Generate JWT token (same as email/password)
const token = jwt.sign(
  {
    id: user._id,
    role: user.role
  },
  process.env.JWT_SECRET,
  { expiresIn: '1d' }
)
```

**Generated Token** (for future API calls):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsInJvbGUiOiJjYW5kaWRhdGUiLCJpYXQiOjE3MjEyMzQ1NjcsImV4cCI6MTcyMTMyMDk2N30.signature
```

---

### Step 8: Backend Response

**Response Sent**:
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Ayaan Bargir",
      "email": "ayaanbargir@gmail.com",
      "role": "candidate",
      "profilePhoto": "https://lh3.googleusercontent.com/...",
      "createdAt": "2026-07-17T14:02:32.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Step 9: Frontend State Update

**Frontend Code** (LoginPage.jsx / RegisterPage.jsx):
```javascript
<GoogleLoginButton
  onSuccess={(data) => {
    // 1. Store token in browser storage
    localStorage.setItem('token', data.token)
    
    // 2. Set axios default header for future requests
    axios.defaults.headers.common['Authorization'] 
      = `Bearer ${data.token}`
    
    // 3. Update Zustand store
    useAuthStore.setState({
      token: data.token,
      user: data.user,
      isLoading: false
    })
    
    // 4. Redirect based on role
    if (data.user?.role === 'recruiter') {
      navigate('/recruiter/dashboard')
    } else {
      navigate('/candidate/dashboard')
    }
  }}
  onError={(error) => {
    alert(`Google Sign-In failed: ${error}`)
  }}
/>
```

**Local Storage**:
```javascript
localStorage: {
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Zustand Store**:
```javascript
{
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    _id: "507f1f77bcf86cd799439011",
    name: "Ayaan Bargir",
    email: "ayaanbargir@gmail.com",
    role: "candidate",
    profilePhoto: "https://..."
  },
  isLoading: false,
  error: null
}
```

---

### Step 10: Dashboard Redirect

**What Happens**:
```javascript
if (user.role === 'recruiter') {
  // Navigate to recruiter dashboard
  → /recruiter/dashboard
} else if (user.role === 'candidate') {
  // Navigate to candidate dashboard  
  → /candidate/dashboard
} else {
  // Fallback
  → /
}
```

**Dashboard Loads**:
- Header shows user name & profile photo
- Token in localStorage ready for all API calls
- User stays logged in for 1 day (JWT expiration)
- Can apply for jobs, update profile, etc.

---

## Return Login / Subsequent Visits

### If User Closes Browser & Comes Back

```
1. User visits http://localhost:3001
   ↓
2. React App initializes
   ↓
3. authStore checks localStorage
   ↓
4. If token exists → Send GET /api/auth/profile
   Headers: Authorization: Bearer {token}
   ↓
5. Backend validates token, returns user
   ↓
6. User logged in automatically ✅
   (No need to login again)
```

---

## Error Cases

### Case 1: Origin Mismatch (YOUR CURRENT ERROR)

**Error Message**:
```
Error 400: origin_mismatch
Access blocked: Authorisation error
You can't sign in to this app because it doesn't comply 
with Google's OAuth 2.0 policy.
```

**Cause**: Frontend URL not registered in Google Cloud Console

**Solution**:
1. Go to Google Cloud Console
2. Find OAuth 2.0 credentials
3. Edit → Add Authorized JavaScript origins
4. Add: `http://localhost:3001`
5. Save & wait 1-2 minutes

---

### Case 2: Invalid Token

**Backend Response**:
```json
{
  "success": false,
  "message": "Invalid Google token",
  "statusCode": 401
}
```

**Causes**:
- Token expired
- Token tampered with
- GOOGLE_CLIENT_ID doesn't match

**Solution**: Verify credentials in .env files

---

### Case 3: Missing Client ID

**Backend Response**:
```json
{
  "success": false,
  "message": "OAuth service not configured",
  "statusCode": 503
}
```

**Cause**: GOOGLE_CLIENT_ID not set in backend/.env

**Solution**: Add credentials to backend/.env

---

## Summary

```
User Click
    ↓
Google Popup
    ↓
Select Account
    ↓
ID Token Returned
    ↓
Frontend → Backend
    ↓
Backend Verifies with Google
    ↓
User Check/Create in MongoDB
    ↓
Generate JWT Token
    ↓
Send Back to Frontend
    ↓
Frontend Stores Token
    ↓
Redirect to Dashboard
    ↓
✅ LOGGED IN
```

---

**Document Version**: 1.0  
**Status**: ✅ Ready for Reference  
**Last Updated**: July 17, 2026
