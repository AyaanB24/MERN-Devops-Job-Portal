# Phase 3: Authentication Middleware & Profile Retrieval

This phase implemented the route protection middleware that decodes and validates JSON Web Tokens (JWT), retrieves the associated user from the database, and exposes a protected `/profile` endpoint to fetch authenticated user information.

---

## 📂 File Architecture

Below are the new and modified files during this phase:

```
backend/src/
├── middleware/
│   └── authMiddleware.js (Created)
├── routes/
│   └── authRoutes.js (Modified)
└── controllers/
    └── authController.js (Modified)
```

---

## 📝 Detailed File Breakdown

### 1. `backend/src/middleware/authMiddleware.js` (Created)
*   **Purpose**: Protects specific routes from unauthorized access by validating the JWT.
*   **Key Responsibilities**:
    *   Inspects the HTTP request headers for an `Authorization` field starting with `Bearer`.
    *   Extracts and decodes the token using the application's `JWT_SECRET`.
    *   Queries MongoDB to find the matching user profile (`User.findById(decoded.id)`) and excludes the sensitive password hash (`.select('-password')`).
    *   Attaches the user document to `req.user` to share the authentication context with subsequent route handlers.
    *   Calls `next()` to proceed or responds with a `401 Unauthorized` status if the token is missing, expired, or invalid.

### 2. `backend/src/controllers/authController.js` (Modified)
*   **Purpose**: Added the `getProfile` handler to serve user information.
*   **Key Responsibilities**:
    *   Extracts the pre-fetched user details from `req.user` (populated by the `protect` middleware).
    *   Returns a `200 OK` JSON response containing the authenticated user's profile details.

### 3. `backend/src/routes/authRoutes.js` (Modified)
*   **Purpose**: Maps the user profile route to its corresponding middleware and controller.
*   **Key Responsibilities**:
    *   Registers the `GET /profile` endpoint.
    *   Chains the `protect` middleware before the `authController.getProfile` handler to ensure only authenticated users can access the endpoint.

---

## 💡 Interview Highlights (Core Concepts)

### 🛡️ 1. Stateless Authentication Pipeline
Express middleware acts as a gatekeeper. By chaining `protect` before our profile controller, we decouple route security from business logic. The request flows through signature validation and database checks before ever hitting the controller, keeping our route handlers thin and single-purpose.

### 🧩 2. Request-scoped State Context (`req.user`)
Express handles each incoming request as an isolated transaction. Attaching the retrieved user to the `req` object dynamically ensures that any downstream middleware or controllers have immediate, secure access to the authenticated user's identity without performing duplicate database lookups.

### ⚙️ 3. Token Verification and Security Checks
During the verification step:
*   We ensure the token format is exactly `Bearer <token>`.
*   We handle token expirations and signature tampering errors gracefully by returning a generic `401 Unauthorized` message.
*   We query the database to ensure the user still exists, preventing revoked or deleted users with unexpired tokens from gaining access.

---

## 🧪 Testing Guide

Follow these steps to run and test the complete authentication and profile retrieval flow.

### 🏃 Step 1: Start the Backend Server
Make sure MongoDB is running, then start the server in your terminal:
```bash
cd backend
npm run dev
```

### 🔑 Step 2: Login to Get a JWT
Login with your registered user credentials to generate a token:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "candidate@example.com", "password": "securepassword123"}'
```

**Expected Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "name": "Interview Candidate",
      "email": "candidate@example.com",
      "role": "candidate",
      "_id": "64a4d6f8fc13ae2bb4501234",
      "createdAt": "2026-07-04T15:00:00.000Z",
      "updatedAt": "2026-07-04T15:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YTRkNmY4ZmMxM2FlMmJiNDUwMTIzNCIsInJvbGUiOiJjYW5kaWRhdGUiLCJpYXQiOjE2ODg0ODI4MDAsImV4cCI6MTY4ODU2OTIwMH0.signature"
  }
}
```
*Copy the `token` string value from the response.*

---

### 👤 Step 3: Fetch Profile with the Bearer Token
Make a request to the protected profile route, passing the token in the `Authorization` header:

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_COPIED_TOKEN_HERE"
```

**Expected Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "64a4d6f8fc13ae2bb4501234",
    "name": "Interview Candidate",
    "email": "candidate@example.com",
    "role": "candidate",
    "profilePhoto": "",
    "resume": "",
    "skills": [],
    "bio": "",
    "createdAt": "2026-07-04T15:00:00.000Z",
    "updatedAt": "2026-07-04T15:00:00.000Z"
  }
}
```

---

### ❌ Step 4: Test Unauthorized Access
Verify that request protection is functioning as expected by testing failures:

#### A. Without an Authorization Header:
```bash
curl -X GET http://localhost:5000/api/auth/profile
```
**Expected Response (`401 Unauthorized`):**
```json
{
  "success": false,
  "message": "Not authorized, no token provided"
}
```

#### B. With a Tampered/Malformed Token:
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer invalidtokenstring"
```
**Expected Response (`401 Unauthorized`):**
```json
{
  "success": false,
  "message": "Not authorized, token failed or expired"
}
```

---

## 📬 Testing with Postman

### 1. Retrieve the JWT Token
1. Open Postman and make your successful `POST` request to `http://localhost:5000/api/auth/login`.
2. Locate the `token` string value under the JSON response and copy it.

### 2. Configure the Profile Request
1. Open a new request tab by clicking the **`+`** button.
2. Select **`GET`** from the HTTP method dropdown.
3. Enter the request URL: `http://localhost:5000/api/auth/profile`
4. Click on the **Authorization** tab directly below the URL bar.
5. In the **Type** dropdown, select **Bearer Token**.
6. Paste your copied JWT token in the **Token** text box on the right.
7. Click the **Send** button. You should receive a status code of **`200 OK`** containing your profile object.

### 3. Verify Access Failures in Postman
1. Toggle to the **Headers** tab, find the `Authorization` key, and uncheck it to temporarily disable it.
2. Click **Send**; you will receive a **`401 Unauthorized`** response code.
