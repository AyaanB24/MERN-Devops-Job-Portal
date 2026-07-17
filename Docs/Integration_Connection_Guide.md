# How Frontend & Backend Connected via OAuth

**Document Type**: Integration Guide  
**Audience**: Developers wanting to understand the complete flow  
**Level**: Beginner to Intermediate

---

## The Big Picture

```
┌──────────────────┐
│   React App      │
│   (Frontend)     │ ←────────────────────────────┐
└──────────────────┘                              │
         │                                        │
         │ User clicks button                     │
         ▼                                        │
┌──────────────────────────────────────────────┐  │
│ GoogleLoginButton Component                  │  │
│ (Handles OAuth)                              │  │
└──────────────────────────────────────────────┘  │
         │                                        │
         │ 1. Load Google library                 │
         │ 2. Show sign-in dialog                 │
         │ 3. Get ID token                        │
         │                                        │
         ▼                                        │
┌──────────────────────────────────────────────┐  │
│ Google Accounts (accounts.google.com)        │  │
│ • User consent screen                        │  │
│ • Returns signed JWT (idToken)               │  │
└──────────────────────────────────────────────┘  │
         │                                        │
         │ ID Token                               │
         ▼                                        │
┌──────────────────────────────────────────────┐  │
│ Frontend JavaScript                          │  │
│ • Receive idToken from Google                │  │
│ • Send to backend                            │  │
└──────────────────────────────────────────────┘  │
         │                                        │
         │ POST /api/oauth/verify-google-token   │
         │ { idToken, role }                     │
         │                                        │
         ▼                                        │
┌──────────────────────────────────────────────┐  │
│ Express Backend (Node.js)                    │  │
│ • Receive idToken                            │  │
│ • Verify with Google                         │  │
│ • Find or create user                        │  │
│ • Generate JWT                               │  │
│ • Send back user & token                     │  │
└──────────────────────────────────────────────┘  │
         │                                        │
         │ { user, token }                        │
         └────────────────────────────────────────┘
                                                  │
         Frontend receives response                │
         ▼                                        
         Store token in localStorage              
         Update Zustand store                     
         Redirect to dashboard                    
         ✅ USER LOGGED IN                        
```

---

## Step-by-Step Connection Flow

### 1. Frontend Loads Google Library

**File**: `frontend/src/components/GoogleLoginButton.jsx`

```javascript
useEffect(() => {
  // Load Google Sign-In library from CDN
  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  document.body.appendChild(script)
}, [])
```

**What happens**:
- Script loads Google's sign-in library
- Enables `window.google.accounts.id` object
- Allows us to show Google sign-in button

---

### 2. User Clicks "Continue with Google"

**File**: `frontend/src/pages/LoginPage.jsx`

```javascript
<GoogleLoginButton
  role="candidate"
  onSuccess={(data) => {
    // Handle success
  }}
  onError={(error) => {
    // Handle error
  }}
/>
```

**What happens**:
- User sees Google button on page
- Button is rendered by Google's library
- Click triggers Google sign-in dialog

---

### 3. Google Shows Consent Screen

**Google Servers**: `accounts.google.com`

```
┌─────────────────────────────────────┐
│ Sign in with Google                 │
│                                     │
│ Select an account                   │
│ • john@gmail.com                    │
│ • jane@gmail.com                    │
│                                     │
│ [Select Account]                    │
└─────────────────────────────────────┘
```

**What happens**:
- Google shows list of accounts
- User selects account
- Google shows permission request
- User approves
- Google signs a JWT token with user info

---

### 4. Frontend Receives ID Token

**File**: `frontend/src/components/GoogleLoginButton.jsx`

```javascript
const handleCredentialResponse = async (response) => {
  // response.credential is the ID token (JWT)
  const idToken = response.credential
  
  console.log('ID Token received from Google')
  console.log('Token sample:', idToken.substring(0, 50) + '...')
}
```

**What happens**:
- Google's library triggers callback with token
- Token is a JWT signed by Google
- Token contains: email, name, picture, ID, etc.
- Token expires in ~1 hour

---

### 5. Frontend Sends to Backend

**File**: `frontend/src/components/GoogleLoginButton.jsx`

```javascript
const backendResponse = await fetch(
  'http://localhost:5000/api/oauth/verify-google-token',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      idToken: idToken,
      role: 'candidate'
    })
  }
)
```

**What happens**:
- Frontend sends HTTP POST request to backend
- Includes ID token from Google
- Includes role selected by user
- Backend receives and processes

---

### 6. Backend Receives Request

**File**: `backend/src/routes/oauthRoutes.js`

```javascript
router.post('/verify-google-token', oauthController.verifyGoogleToken)
```

**File**: `backend/src/controllers/oauthController.js`

```javascript
const verifyGoogleToken = async (req, res, next) => {
  const { idToken, role } = req.body
  
  console.log('Backend received:')
  console.log('- idToken:', idToken.substring(0, 50) + '...')
  console.log('- role:', role)
}
```

**What happens**:
- Express route receives POST request
- Request body has idToken and role
- Controller function called
- Begins verification process

---

### 7. Backend Verifies with Google

**File**: `backend/src/controllers/oauthController.js`

```javascript
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
)

// Verify the token
const ticket = await oauth2Client.verifyIdToken({
  idToken: idToken,
  audience: process.env.GOOGLE_CLIENT_ID
})
```

**What happens**:
- Backend creates OAuth2 client with credentials
- Sends token to Google for verification
- Google checks:
  - Is signature valid? (using public key)
  - Is token expired?
  - Is audience (client ID) correct?
- Google responds: "Token is valid" or "Token is invalid"

**Security**: 
- Token can't be forged
- Only Google has private key to sign
- Backend has Google's public key to verify

---

### 8. Backend Extracts User Data

**File**: `backend/src/controllers/oauthController.js`

```javascript
const payload = ticket.getPayload()

const { sub, email, name, picture } = payload

console.log('Google payload:')
console.log('- Google ID (sub):', sub)
console.log('- Email:', email)
console.log('- Name:', name)
console.log('- Picture URL:', picture)
```

**What happens**:
- Backend extracts data from verified token
- Gets: Google ID, email, name, profile picture
- This data is trusted (Google signed it)

---

### 9. Backend Checks Database

**File**: `backend/src/controllers/oauthController.js`

```javascript
// Check if user exists
let user = await User.findOne({ email })

if (user) {
  console.log('User exists in database')
} else {
  console.log('New user, will create')
}
```

**What happens**:
- Query MongoDB: Does user with this email exist?
- If yes: Use existing user
- If no: Create new user

---

### 10. Backend Creates/Updates User (If New)

**File**: `backend/src/controllers/oauthController.js`

```javascript
if (!user) {
  user = await User.create({
    name: name || email.split('@')[0],
    email: email,
    password: sub, // Google ID (won't be used for password login)
    role: role,    // 'candidate' or 'recruiter'
    profilePhoto: picture || '',
    isGoogleAuth: true,
    googleId: sub
  })
  
  console.log('Created new user:', user._id)
}
```

**Database Entry**:
```javascript
{
  _id: ObjectId("6a5792ea5bca1f826f925fbf"),
  name: "John Doe",
  email: "john@gmail.com",
  password: "110123456789",  // Google's sub (never used)
  role: "candidate",
  profilePhoto: "https://lh3.googleusercontent.com/...",
  isGoogleAuth: true,
  googleId: "110123456789",
  createdAt: ISODate("2026-07-15T14:02:22.000Z"),
  updatedAt: ISODate("2026-07-15T14:02:22.000Z")
}
```

---

### 11. Backend Generates JWT Token

**File**: `backend/src/controllers/oauthController.js`

```javascript
const token = jwt.sign(
  { id: user._id, role: user.role },  // Payload
  process.env.JWT_SECRET,              // Secret key
  { expiresIn: '1d' }                   // Options
)

console.log('Generated JWT token')
console.log('Token:', token)
```

**What is JWT**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJpZCI6IjZhNTc5MmVhNWJjYTFmODI2Zjk5NWZiZiIsInJvbGUiOiJjYW5kaWRhdGUiLCJpYXQiOjE2ODQxMjM3MzQsImV4cCI6MTY4NDIxMDEzNH0.
abc123xyz789

Parts:
1. Header (alg, type)
2. Payload (id, role, iat, exp)
3. Signature (signed with JWT_SECRET)
```

**What it means**:
- This is app's own token (not Google's)
- Identifies the user
- 24 hours expiration
- Signed with secret (backend only knows)
- Proves user is authenticated

---

### 12. Backend Sends Response to Frontend

**File**: `backend/src/controllers/oauthController.js`

```javascript
return res.status(200).json({
  success: true,
  message: 'Login successful',
  data: {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePhoto: user.profilePhoto
    },
    token: token
  }
})
```

**HTTP Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "6a5792ea5bca1f826f925fbf",
      "name": "John Doe",
      "email": "john@gmail.com",
      "role": "candidate",
      "profilePhoto": "https://..."
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**What happens**:
- Backend sends JSON response
- 200 status code (success)
- Includes user data and JWT token
- Frontend receives this response

---

### 13. Frontend Receives Response

**File**: `frontend/src/components/GoogleLoginButton.jsx`

```javascript
const response = await fetch('/api/oauth/verify-google-token', {
  // ... request
})

const data = await response.json()

console.log('Backend response:', data)
console.log('User:', data.data.user)
console.log('Token:', data.data.token)

// Call success callback
props.onSuccess(data.data)
```

**What happens**:
- Frontend receives JSON response
- Parses it
- Calls onSuccess callback with user & token

---

### 14. Frontend Stores Token

**File**: `frontend/src/pages/LoginPage.jsx`

```javascript
<GoogleLoginButton
  role="candidate"
  onSuccess={(data) => {
    // Store token in localStorage
    localStorage.setItem('token', data.token)
    
    console.log('Token stored in localStorage')
    console.log('Token:', localStorage.getItem('token'))
  }}
/>
```

**What happens**:
- Token saved in browser's localStorage
- Persists across page refreshes
- Used in every future API request

---

### 15. Frontend Updates State

**File**: `frontend/src/pages/LoginPage.jsx`

```javascript
// Update Zustand store
useAuthStore.setState({
  token: data.token,
  user: data.user,
  isLoading: false
})
```

**What happens**:
- Zustand state updated
- All React components with `useAuthStore()` re-render
- User data available throughout app

---

### 16. Frontend Sets Axios Header

**File**: `frontend/src/store/authStore.js`

```javascript
// Set default header for all requests
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

console.log('Axios configured')
console.log('All requests now include Bearer token')
```

**What happens**:
- Axios configured with token
- Every API request includes: `Authorization: Bearer {token}`
- Backend can verify requests using this token

---

### 17. Frontend Redirects to Dashboard

**File**: `frontend/src/pages/LoginPage.jsx`

```javascript
if (data.user?.role === 'recruiter') {
  navigate('/recruiter/dashboard')
} else {
  navigate('/candidate/dashboard')
}

console.log('Redirected to:', data.user.role + ' dashboard')
```

**What happens**:
- User redirected to appropriate dashboard
- React Router navigates to new page
- Dashboard loads with authenticated user
- Token in localStorage
- User sees personalized interface

---

## Summary of Connections

| Step | Component | Action | Result |
|------|-----------|--------|--------|
| 1 | Frontend | Load Google library | `window.google` available |
| 2 | Frontend | User clicks button | Google dialog shown |
| 3 | Google | User consents | ID token generated |
| 4 | Frontend | Receive token | `idToken` in memory |
| 5 | Frontend | Send to backend | HTTP POST request |
| 6 | Backend | Receive request | Request in handler |
| 7 | Backend | Verify with Google | Google confirms valid |
| 8 | Backend | Extract data | Get email, name, picture |
| 9 | Backend | Check database | Find user or create |
| 10 | Backend | Create JWT | App token generated |
| 11 | Backend | Send response | JSON with user & token |
| 12 | Frontend | Receive response | Data in memory |
| 13 | Frontend | Store token | In localStorage |
| 14 | Frontend | Update state | Zustand state changed |
| 15 | Frontend | Set header | Axios ready |
| 16 | Frontend | Redirect | Dashboard shown |

---

## Data Flow Summary

```
Google ID Token (JWT from Google, signed with Google private key)
    ↓
Frontend → Backend
    ↓
Backend verifies with Google (using Google public key)
    ↓
Backend extracts user data (email, name, picture)
    ↓
Backend creates/finds user in MongoDB
    ↓
Backend generates App JWT Token (signed with app secret)
    ↓
Backend → Frontend (user data + app token)
    ↓
Frontend stores token in localStorage
    ↓
Frontend includes token in all future requests
    ↓
Backend verifies token (using app secret)
    ↓
Backend identifies user and processes request
```

---

## Key Points

1. **Two Different Tokens**:
   - Google ID Token (from Google, verifies with Google)
   - App JWT Token (from backend, verifies with backend)

2. **Trust Chain**:
   - Frontend trusts Google (Google is known entity)
   - Backend trusts Google (verifies signature)
   - Frontend trusts Backend (through JWT)

3. **No Password Storage**:
   - Google handles authentication
   - Backend doesn't store or check passwords
   - Uses Google's verified information

4. **Same as Email Login**:
   - Both generate JWT token
   - Both use same authentication flow
   - Both redirect to dashboard

---

**Status**: ✅ Complete Integration Explanation  
**Last Updated**: July 15, 2026
