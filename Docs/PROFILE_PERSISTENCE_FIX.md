# Fix: Profile Data Empty After Login/Logout

## Problem

When you set your profile (bio, skills, resume) and then logout, the next time you login:
- Profile shows as **empty** (no bio, skills, or resume)
- Only after a **page refresh** does the profile data appear

**Timeline:**
1. User sets profile data (bio, skills, resume) ✅
2. User logs out
3. User logs in again
4. Profile page shows empty fields ❌
5. Page refresh (F5)
6. Profile data appears ✅

---

## Root Cause

**The problem is in the login/register flow:**

```
1. User submits login form
2. Backend returns response with basic user data:
   {
     success: true,
     data: {
       user: {
         id: "123",
         name: "John",
         email: "john@example.com",
         role: "candidate",
         bio: "",  ← Empty!
         skills: [],  ← Empty!
         resume: null  ← Empty!
       },
       token: "jwt_token"
     }
   }
3. Frontend stores this basic user data in Zustand store
4. Profile page renders with EMPTY bio, skills, resume
5. User refreshes page
6. getProfile() is called in ProfilePage.useEffect
7. Fetches COMPLETE user data from backend
8. Profile shows correctly ✅
```

**The issue:** Login/register endpoints don't return the complete profile data (bio, skills, resume) in the user object. Only basic auth data is included.

---

## Solution

**Call `getProfile()` immediately after login/register** to fetch the complete user profile data.

### Changes Made:

#### 1. LoginPage.jsx

**Added after successful login:**

```javascript
// Fetch complete profile data (includes bio, skills, resume, etc.)
// This is necessary because login response doesn't include all profile fields
try {
  await useAuthStore.getState().getProfile()
} catch (profileError) {
  console.warn('Could not fetch complete profile, but user is authenticated:', profileError)
  // User is still logged in, continue to dashboard
}
```

#### 2. RegisterPage.jsx

**Added after successful registration:**

```javascript
// Same getProfile() call as LoginPage
try {
  await useAuthStore.getState().getProfile()
} catch (profileError) {
  console.warn('Could not fetch complete profile, but user is authenticated:', profileError)
  // User is still registered, continue to dashboard
}
```

---

## How It Works Now

```
1. User submits login form
2. Backend returns basic user data (id, name, email, role)
3. Frontend stores in Zustand store
4. Frontend calls getProfile() immediately ← NEW!
5. getProfile() fetches complete data from /api/auth/profile
6. Frontend updates store with COMPLETE user data (includes bio, skills, resume)
7. User redirects to dashboard
8. Profile page renders with ALL data ✅
```

**Result:** Profile data is immediately available after login - no refresh needed! 🎉

---

## Data Flow Diagram

### Before (❌ Broken)

```
Login Form Submit
    ↓
Backend returns: { user: {id, name, email, role}, token }
    ↓
Store updated with basic user
    ↓
Redirect to Dashboard
    ↓
Profile Page renders
    ↓
Profile shows EMPTY (bio, skills missing) ❌
    ↓
User refreshes page
    ↓
getProfile() fetches from server
    ↓
Profile shows correctly ✅
```

### After (✅ Fixed)

```
Login Form Submit
    ↓
Backend returns: { user: {id, name, email, role}, token }
    ↓
Store updated with basic user
    ↓
IMMEDIATELY call getProfile() ← NEW!
    ↓
Backend returns: { user: {id, name, email, role, bio, skills, resume}, token }
    ↓
Store updated with COMPLETE user data
    ↓
Redirect to Dashboard
    ↓
Profile Page renders with ALL data ✅
```

---

## What getProfile() Does

**API Call:** `GET /api/auth/profile`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "candidate",
    "bio": "Full-stack developer",
    "skills": ["React", "Node.js", "MongoDB"],
    "resume": "/uploads/resumes/john-resume.pdf",
    "profilePhoto": "/uploads/photos/john.jpg",
    "createdAt": "2026-07-18T...",
    "updatedAt": "2026-07-18T..."
  }
}
```

**What changes in store:**
- ✅ Adds `bio` (was empty)
- ✅ Adds `skills` (was empty array)
- ✅ Adds `resume` (was null)
- ✅ Adds `profilePhoto` (was empty)

---

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/pages/LoginPage.jsx` | Added `getProfile()` call after successful login |
| `frontend/src/pages/RegisterPage.jsx` | Added `getProfile()` call after successful registration |

---

## Testing the Fix

### Test Case 1: Login and Check Profile Immediately

1. Create account / Login
2. Go to Profile page
3. Set bio: "My bio text"
4. Set skills: "React, Node.js"
5. Upload resume
6. Logout
7. Login again
8. **Check Profile page immediately**
9. ✅ Should show: bio, skills, resume (NO refresh needed!)

### Test Case 2: Register and Check Profile

1. Register as new candidate
2. Go to Profile page
3. ✅ Should show: bio (empty but present), skills (empty but present), resume upload ready

---

## Error Handling

If `getProfile()` fails (network error, unauthorized, etc.):

```javascript
try {
  await useAuthStore.getState().getProfile()
} catch (profileError) {
  // Log the error but don't break the flow
  console.warn('Could not fetch complete profile:', profileError)
  // User is still authenticated, dashboard will still load
  // ProfilePage will call getProfile() again on mount
}
```

This ensures:
- User can still login even if profile fetch fails
- Profile page can fetch profile data on mount as fallback
- No broken user experience

---

## Why This Fix Works

1. **Immediate data fetch:** Profile data loaded before redirect to dashboard
2. **Complete data available:** Profile page gets all fields (bio, skills, resume)
3. **No page refresh needed:** Data already in store when profile page mounts
4. **Graceful fallback:** If profile fetch fails, profile page's `getProfile()` on mount will try again
5. **Better UX:** Users see their data immediately without delay

---

## Similar Issue in Other Flows

This same pattern should be applied to:

✅ **LoginPage** - Fixed
✅ **RegisterPage** - Fixed
✅ **OAuthRoleSelectionPage** - Already handles this
❓ **GoogleLoginButton** - Already updates store directly

---

## Verification

After applying this fix, verify:

- ✅ After login, profile data is immediately available
- ✅ No empty bio/skills/resume on first login
- ✅ No need to refresh page to see profile data
- ✅ Logout and login again still works
- ✅ Profile page displays all user data immediately

---

## Summary

**Before:** Login → Empty profile → Refresh → Data appears
**After:** Login → getProfile() called → Data appears immediately ✅

This is a simple but crucial fix for seamless user experience!
