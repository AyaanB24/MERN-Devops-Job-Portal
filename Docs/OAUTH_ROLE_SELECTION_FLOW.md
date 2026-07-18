# OAuth Role Selection Flow

**Date**: July 17, 2026  
**Status**: ✅ Implemented  
**Flow Type**: Login vs Signup Role Handling

---

## Overview

The OAuth implementation now distinguishes between:
- **Login**: User logs in without role preset → Redirect to role selection
- **Signup**: User signs up with role preset → Direct to dashboard

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│              USER CLICKS "Continue with Google"              │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
     ┌──▼─────────────┐      ┌───▼──────────────┐
     │   LOGIN PAGE   │      │   SIGNUP PAGE    │
     │  (role=null)   │      │  (role preset)   │
     └──┬─────────────┘      └───┬──────────────┘
        │                        │
        ▼                        ▼
   Google OAuth             Google OAuth
   (No role)                (Role selected)
        │                        │
        ▼                        ▼
   Backend Receives         Backend Receives
   idToken, role=null       idToken, role="candidate/recruiter"
        │                        │
        ▼                        ▼
   Backend Creates User      Backend Creates User
   with role="candidate"     with selected role
        │                        │
        ▼                        ▼
   Returns JWT Token         Returns JWT Token
        │                        │
        ▼                        ▼
   Frontend Stores           Frontend Stores
   in sessionStorage         in localStorage
        │                        │
        ▼                        ▼
   ┌─────────────────────┐   ┌──────────────────┐
   │ ROLE SELECTION PAGE │   │ DASHBOARD        │
   │ User chooses:       │   │ - Candidate dash │
   │ ✓ Job Seeker        │   │ - Recruiter dash │
   │ ✓ Recruiter         │   │ - Admin dash     │
   └────────┬────────────┘   └──────────────────┘
            │
            ▼
   User clicks role
            │
            ▼
   Backend updates user.role
   PUT /api/auth/update-oauth-role
            │
            ▼
   Frontend redirects
   based on selected role
            │
            ▼
   ┌──────────────────┐
   │ DASHBOARD        │
   │ - Candidate dash │
   │ - Recruiter dash │
   └──────────────────┘
```

---

## File Changes

### Frontend Changes

**GoogleLoginButton.jsx**:
- Added `role` parameter (can be null or string)
- If `role=null` (login) → Redirect to `/oauth-select-role`
- If `role="candidate"/"recruiter"` (signup) → Call onSuccess callback
- Store OAuth data in `sessionStorage` for role selection page

**LoginPage.jsx**:
- Changed: `role="candidate"` → `role={null}`
- GoogleLoginButton now doesn't use onSuccess callback
- Instead, redirects to role selection page

**RegisterPage.jsx**:
- Still passes `role={formData.role}` (preset from form)
- GoogleLoginButton uses onSuccess callback
- Direct redirect to dashboard

**OAuthRoleSelectionPage.jsx** (NEW):
- Shows two role options: Job Seeker | Recruiter
- User selects role
- Backend endpoint updates role
- Redirect to appropriate dashboard

**App.jsx**:
- Added import for `OAuthRoleSelectionPage`
- Added route: `/oauth-select-role`

### Backend Changes

**authController.js**:
- Added `updateOAuthRole()` function
- Updates user.role in database
- Returns updated user

**authRoutes.js**:
- Added route: `PUT /api/auth/update-oauth-role`
- Protected route (requires authentication)
- Calls `updateOAuthRole` controller

---

## Step-by-Step Flows

### Flow 1: Login with Role Selection

```
USER FLOW:
1. Click "Continue with Google" on LOGIN page
2. Select Google account
3. → Redirected to ROLE SELECTION PAGE
4. Choose "Job Seeker" or "Recruiter"
5. → Redirected to selected DASHBOARD

TECHNICAL FLOW:
1. GoogleLoginButton called with role=null
2. Google returns ID Token
3. Frontend sends: { idToken, role: "candidate", isSignup: false }
4. Backend creates user with role: "candidate" (default)
5. Frontend stores in sessionStorage
6. Frontend redirects to /oauth-select-role
7. User selects role
8. Frontend calls PUT /api/auth/update-oauth-role
9. Backend updates: user.role = selected role
10. Frontend redirects based on role
```

### Flow 2: Signup with Role Preset

```
USER FLOW:
1. Go to SIGNUP page
2. Select role: "Job Seeker" or "Recruiter"
3. Click "Continue with Google"
4. Select Google account
5. → Redirected directly to DASHBOARD (no role selection)

TECHNICAL FLOW:
1. GoogleLoginButton called with role="candidate" or "recruiter"
2. Google returns ID Token
3. Frontend sends: { idToken, role: selected, isSignup: true }
4. Backend creates user with selected role
5. Frontend calls onSuccess callback (from RegisterPage)
6. Frontend stores token in localStorage
7. Frontend redirects to dashboard based on role
8. (No role selection page shown)
```

### Flow 3: Return Login (Already Has Role)

```
USER FLOW:
1. User already has account
2. Logs in via Google
3. Backend finds existing user
4. Existing user already has role set
5. Returns role in response
6. Frontend redirects to dashboard

TECHNICAL FLOW:
1. GoogleLoginButton called with role=null
2. Backend finds user by email
3. User exists and has role already set
4. Returns JWT with user.role
5. Frontend handles in OnSuccess (even though not passed)
6. Redirects to dashboard without role selection
```

---

## Data Flow

### Login (Role Selection Path)

```
GoogleLoginButton (role=null)
    ↓
idToken received from Google
    ↓
POST /api/oauth/verify-google-token
  { idToken, role: "candidate", isSignup: false }
    ↓
Backend:
  - Verifies token with Google
  - Creates user with role: "candidate"
  - Returns JWT + user
    ↓
Frontend receives:
  { token, user: { _id, email, role: "candidate", ... } }
    ↓
sessionStorage.setItem('oauthData', JSON.stringify(data))
    ↓
navigate('/oauth-select-role')
    ↓
RoleSelectionPage shows two buttons:
  [Job Seeker] [Recruiter]
    ↓
User clicks role
    ↓
PUT /api/auth/update-oauth-role
  { role: "recruiter" }
  Authorization: Bearer {token}
    ↓
Backend updates:
  User.findByIdAndUpdate(id, { role: "recruiter" })
    ↓
Frontend receives updated user
    ↓
localStorage.setItem('token', token)
    ↓
navigate(`/${role}/dashboard`)
```

### Signup (Direct Path)

```
GoogleLoginButton (role="recruiter")
    ↓
idToken received from Google
    ↓
POST /api/oauth/verify-google-token
  { idToken, role: "recruiter", isSignup: true }
    ↓
Backend:
  - Verifies token with Google
  - Creates user with role: "recruiter"
  - Returns JWT + user
    ↓
Frontend receives:
  { token, user: { _id, email, role: "recruiter", ... } }
    ↓
onSuccess callback triggered
    ↓
localStorage.setItem('token', token)
useAuthStore.setState({ token, user })
    ↓
navigate('/recruiter/dashboard')
    ↓
(No role selection page)
```

---

## Component Interactions

### GoogleLoginButton Props

```javascript
// LOGIN PAGE
<GoogleLoginButton
  role={null}  // ← No preset role
  onSuccess={...}  // ← Not used for login
/>

// SIGNUP PAGE
<GoogleLoginButton
  role={formData.role}  // ← "candidate" or "recruiter"
  onSuccess={(data) => {
    // Handle success
    localStorage.setItem('token', data.token)
    navigate('/candidate/dashboard')
  }}
/>
```

### RoleSelectionPage Logic

```javascript
// Get OAuth data from sessionStorage
const oauthData = JSON.parse(sessionStorage.getItem('oauthData'))

// User clicks role button
const handleRoleSelection = async (role) => {
  // 1. Make API call to update role
  const response = await fetch(
    '/api/auth/update-oauth-role',
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${oauthData.token}`
      },
      body: JSON.stringify({ role })
    }
  )
  
  // 2. Store token in localStorage
  localStorage.setItem('token', oauthData.token)
  
  // 3. Update Zustand store
  useAuthStore.setState({ token, user })
  
  // 4. Redirect to dashboard
  navigate(`/${role}/dashboard`)
}
```

---

## Backend Endpoint

### PUT /api/auth/update-oauth-role

**Protected Route**: Yes (requires Bearer token)

**Request**:
```json
{
  "role": "candidate" | "recruiter"
}
```

**Response Success**:
```json
{
  "success": true,
  "message": "Role updated successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Ayaan Bargir",
      "email": "ayaanbargir@gmail.com",
      "role": "recruiter",  // ← Updated role
      "profilePhoto": "https://...",
      ...
    }
  }
}
```

**Response Error**:
```json
{
  "success": false,
  "message": "Valid role (candidate or recruiter) is required"
}
```

---

## User Experience

### Scenario 1: Existing User Logs In via Google

```
1. User (already registered) goes to /login
2. Clicks "Continue with Google"
3. Selects Google account
4. Taken to ROLE SELECTION PAGE
5. Selects their role (might be different from previous)
6. ✅ Logged into dashboard with new role
```

### Scenario 2: New User Signs Up via Google

```
1. User (first time) goes to /register
2. Selects role: "Job Seeker"
3. Clicks "Continue with Google"
4. Selects Google account
5. ✅ Logged into candidate dashboard immediately
6. No role selection needed (already chose)
```

### Scenario 3: User Changes Role

```
1. User already logged in as "Candidate"
2. Logs out
3. Goes to /login
4. Clicks "Continue with Google"
5. Selects Google account
6. Taken to ROLE SELECTION PAGE
7. Selects "Recruiter" instead
8. ✅ Logged into recruiter dashboard
9. Same account, different role
```

---

## Security Considerations

✅ **Token Verification**: OAuth token verified with Google before processing  
✅ **Protected Route**: `/update-oauth-role` requires valid JWT  
✅ **Session Storage**: OAuth data stored temporarily (not persisted)  
✅ **Role Validation**: Backend validates role is "candidate" or "recruiter"  
✅ **Single User**: Each email can only have one account  

---

## Summary

| Aspect | Login | Signup |
|--------|-------|--------|
| Role Parameter | null | preset |
| After OAuth | Role selection page | Direct dashboard |
| User Selection | After OAuth | Before OAuth |
| Backend Default | "candidate" | User choice |
| Frontend Flow | oauth → role select → dashboard | oauth → dashboard |
| Data Storage | sessionStorage → localStorage | localStorage |

---

**Status**: ✅ Complete & Tested  
**Last Updated**: July 17, 2026  
**Document Version**: 1.0
