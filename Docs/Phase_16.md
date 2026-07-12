# Phase 16 — Authentication & Routing

## What Was Built

| File | Purpose |
|---|---|
| `services/apiClient.js` | Axios instance with JWT injection + global 401/403 handling |
| `services/authApi.js` | Pure async functions for `/auth/register`, `/auth/login`, `/auth/profile` |
| `features/auth/authSlice.js` | Redux slice — user state, 3 thunks, selectors |
| `store/rootReducer.js` | Assembles all Redux slices |
| `store/store.js` | Creates the Redux store |
| `routes/ProtectedRoute.jsx` | RBAC guard — blocks unauthenticated users + wrong roles |
| `routes/GuestRoute.jsx` | Guest guard — blocks authenticated users from login/register |
| `routes/index.jsx` | All app routes wired with guards |
| `features/auth/LoginPage.jsx` | Login UI — dispatches `login` thunk |
| `features/auth/RegisterPage.jsx` | Register UI — dispatches `register` thunk with role |
| `App.jsx` | Boots session from localStorage on every app load |
| `main.jsx` | Wraps app in Redux `<Provider>` |

---

## Why Each Decision Was Made

**Feature-based file placement** — Auth files live in `features/auth/`, not a flat `components/` folder. Scales cleanly; deleting a feature means deleting one folder.

**`apiClient.js` as the only Axios instance** — All API calls go through one place. Change the base URL or token strategy once, it applies everywhere.

**`loadUserFromToken` thunk** — Fires on `App.jsx` mount. If a token exists in localStorage, it calls `GET /api/auth/profile` to rehydrate the Redux state silently. Users stay logged in across page refreshes.

**Local form state, not Redux** — Form inputs (`email`, `password`) live in `useState`. Redux holds domain data, not transient UI state.

**`ProtectedRoute` uses `<Outlet />`** — Follows React Router v6 nested routing pattern. All child routes inherit the guard without repeating it.

**`GuestRoute` role-redirects** — A logged-in recruiter hitting `/login` goes to `/recruiter/dashboard`, not `/` — intentional, not an afterthought.

---

## Data Flow

```
App mounts
  → dispatch(loadUserFromToken)
    → GET /api/auth/profile (if token exists)
      → Redux: { user, token, isAuthenticated: true }

User logs in
  → LoginPage dispatch(login({ email, password }))
    → POST /api/auth/login
      → token saved to localStorage + Redux state updated
        → useEffect detects isAuthenticated → navigate to dashboard

User hits /recruiter/dashboard without login
  → ProtectedRoute: isAuthenticated = false → <Navigate to="/login" />

User hits /admin/dashboard as a candidate
  → ProtectedRoute: role = 'candidate', allowedRoles = ['admin'] → <Navigate to="/unauthorized" />
```

---

## Steps to Test

### 1. Start the dev server
```bash
cd frontend
npm run dev
```

### 2. Test Registration
1. Go to `http://localhost:5173/register`
2. Fill in name, email, password — select **Recruiter**
3. Submit → should redirect to `/recruiter/dashboard`
4. Open Redux DevTools → confirm `auth.user`, `auth.token`, `auth.isAuthenticated: true`
5. Check **Application** tab in DevTools → `token` key in localStorage

### 3. Test Login
1. Logout (clear localStorage manually or use the logout action)
2. Go to `/login`, enter credentials
3. Submit → redirected to the correct role dashboard

### 4. Test Session Persistence
1. Log in → close and reopen the tab
2. Navigate directly to `/candidate/dashboard`
3. Should still be logged in (no redirect to `/login`)

### 5. Test Route Guards
| Action | Expected Result |
|---|---|
| Visit `/login` while logged in | Redirect to role dashboard |
| Visit `/admin/dashboard` as candidate | Redirect to `/unauthorized` |
| Visit `/recruiter/dashboard` without login | Redirect to `/login` |
| Submit login form → success | Redirect to role dashboard |

### 6. Test 401 Handling
1. Manually set a fake/expired token in localStorage
2. Navigate to any protected page
3. `apiClient` interceptor fires → clears token → redirects to `/login`

> **Tip:** Install the **Redux DevTools** browser extension to inspect dispatched actions and state changes in real time.
