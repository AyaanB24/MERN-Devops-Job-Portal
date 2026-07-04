# Phase 4: Role-Based Authorization Middleware

This phase implemented the Authorization middleware to handle Role-Based Access Control (RBAC). It enables protecting specific endpoints based on user roles (`candidate`, `recruiter`, `admin`).

---

## 📂 File Architecture

Below are the new and modified files during this phase:

```
backend/src/
├── middleware/
│   └── roleMiddleware.js (Created)
└── routes/
    └── authRoutes.js (Modified)
```

---

## 📝 Detailed File Breakdown

### 1. `backend/src/middleware/roleMiddleware.js` (Created)
*   **Purpose**: Restricts endpoint access to specific user roles.
*   **Key Responsibilities**:
    *   Accepts a list of permitted roles (`...allowedRoles`) using rest parameters.
    *   Checks if `req.user` exists (ensuring it runs *after* the `protect` authentication middleware).
    *   Compares `req.user.role` against the list of `allowedRoles`.
    *   Calls `next()` to authorize access, or responds with `403 Forbidden` if the user's role is not authorized.

### 2. `backend/src/routes/authRoutes.js` (Modified)
*   **Purpose**: Exposes and protects test endpoints to verify role-based access.
*   **Key Responsibilities**:
    *   Imported the `authorize` helper from `roleMiddleware.js`.
    *   Added `GET /api/auth/admin-only` (restricted to `admin`).
    *   Added `GET /api/auth/recruiter-only` (restricted to `recruiter`).

---

## 💡 Interview Highlights (Core Concepts)

### 🔑 1. Authentication vs. Authorization

*   **Authentication (AuthN):** *Who are you?*
    *   Verifies the identity of a user (e.g., via username/password login or verifying a JWT signature).
    *   Answers the question: "Is this token valid, and does this user exist in our system?"
*   **Authorization (AuthZ):** *What are you allowed to do?*
    *   Determines a user's permissions and access privileges once they are authenticated.
    *   Answers the question: "Does this authenticated user have the authority to access this specific resource or perform this action?"

### 🛡️ 2. Role-Based Access Control (RBAC) Implementation
*   **Decoupled Middleware:** We isolate RBAC checks into `roleMiddleware.js` so authorization logic is clean and reusable across different routes.
*   **Closure/Currying Pattern:** The `authorize(...allowedRoles)` function returns a standard Express middleware function. This allows us to pass roles dynamically in route definitions (e.g., `authorize('recruiter', 'admin')`).
*   **HTTP 403 Forbidden:** When a user is authenticated but lacks the necessary role permissions, we return `403 Forbidden` rather than `401 Unauthorized`. `401` implies the client needs to log in, whereas `403` implies the server understands who they are but they do not have permission.

---

## 🧪 Testing Guide

Follow these steps to verify that the role-based middleware properly protects routes.

### 🏃 Step 1: Start the Backend Server
```bash
cd backend
npm run dev
```

### 🔑 Step 2: Register/Create Users with Different Roles
If you don't already have users with `candidate`, `recruiter`, and `admin` roles, register them now:

#### Register a Recruiter:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Recruiter", "email": "recruiter@example.com", "password": "securepassword123", "role": "recruiter"}'
```

#### Register a Candidate:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Candidate", "email": "candidate@example.com", "password": "securepassword123", "role": "candidate"}'
```

#### Register an Admin:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Super Admin", "email": "admin@example.com", "password": "securepassword123", "role": "admin"}'
```

---

### 🪙 Step 3: Login to Obtain JWT Tokens
Login with the accounts to obtain their unique tokens.

#### Login Recruiter:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "recruiter@example.com", "password": "securepassword123"}'
```
*Copy the recruiter's JWT token.*

#### Login Candidate:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "candidate@example.com", "password": "securepassword123"}'
```
*Copy the candidate's JWT token.*

#### Login Admin:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "securepassword123"}'
```
*Copy the admin's JWT token.*

---

### 🛡️ Step 4: Test Authorization Endpoints

#### Test Case 1: Recruiter accesses Recruiter-only route (Authorized)
```bash
curl -X GET http://localhost:5000/api/auth/recruiter-only \
  -H "Authorization: Bearer RECRUITER_TOKEN"
```
**Expected Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Access granted: Welcome Recruiter!"
}
```

#### Test Case 2: Candidate accesses Recruiter-only route (Unauthorized)
```bash
curl -X GET http://localhost:5000/api/auth/recruiter-only \
  -H "Authorization: Bearer CANDIDATE_TOKEN"
```
**Expected Response (`403 Forbidden`):**
```json
{
  "success": false,
  "message": "Forbidden: Role 'candidate' does not have permission to access this resource"
}
```

#### Test Case 3: Recruiter/Candidate accesses Admin-only route (Unauthorized)
```bash
curl -X GET http://localhost:5000/api/auth/admin-only \
  -H "Authorization: Bearer RECRUITER_TOKEN"
```
**Expected Response (`403 Forbidden`):**
```json
{
  "success": false,
  "message": "Forbidden: Role 'recruiter' does not have permission to access this resource"
}
```

#### Test Case 4: Admin accesses Admin-only route (Authorized)
```bash
curl -X GET http://localhost:5000/api/auth/admin-only \
  -H "Authorization: Bearer ADMIN_TOKEN"
```
**Expected Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Access granted: Welcome Admin!"
}
```

---

## 📬 Testing with Postman

1. **Obtain Tokens:** Perform a `POST` request to `/api/auth/login` for the Candidate, Recruiter, and Admin. Copy all tokens.
2. **Access Recruiter-Only Route as Recruiter:**
   - Create a `GET` request to `http://localhost:5000/api/auth/recruiter-only`.
   - Under the **Authorization** tab, select **Bearer Token** and paste the **Recruiter's Token**.
   - Click **Send**. You should get a `200 OK` with the success message.
3. **Access Recruiter-Only Route as Candidate:**
   - Replace the token in the **Authorization** tab with the **Candidate's Token**.
   - Click **Send**. You should get a `403 Forbidden` response.
4. **Access Admin-Only Route as Admin:**
   - Create a `GET` request to `http://localhost:5000/api/auth/admin-only`.
   - Under the **Authorization** tab, select **Bearer Token** and paste the **Admin's Token**.
   - Click **Send**. You should get a `200 OK` with the success message.

---

## 🛠️ Troubleshooting & Fixes

### 🐛 Issue: `TypeError: authorize is not a function`
During early testing, the application crashed with the following error:
```
TypeError: authorize is not a function
    at Object.<anonymous> (D:\Job-Portal-Devops\backend\src\routes\authRoutes.js:23:36)
```

#### Cause:
The middleware file `src/middleware/roleMiddleware.js` was created as an empty (0 bytes) file. When `authRoutes.js` tried to import and use the `authorize` function, it received `undefined`, triggering the TypeError upon server initialization.

#### Fix:
We populated `src/middleware/roleMiddleware.js` with the correct currying function logic to export `authorize` properly:
```javascript
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    return next();
  };
};

module.exports = { authorize };
```
After writing the middleware logic and ensuring `module.exports` matches the destructuring import in the route files, the Node server restarts and runs successfully.


