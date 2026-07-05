# Final Backend Test Guide — MERN Job Portal

This document provides a complete, ordered, end-to-end testing walkthrough for all backend modules implemented in Phases 1–11. Follow each section in order, as later tests depend on data created in earlier steps.

---

## 🛠️ Prerequisites

Before testing, ensure the following are running:

1. **MongoDB** is running locally:
   ```bash
   mongod
   ```
2. **Backend server** is running:
   ```bash
   cd backend
   npm run dev
   ```
3. **Postman** or `cURL` is available.

**Base URL:** `http://localhost:5000`

---

## 📋 Test Execution Order

```
1. Health Check
2. Register Users (candidate, recruiter, admin)
3. Login & Obtain JWT Tokens
4. Profile Retrieval
5. Role-Based Access Control
6. Resume Upload
7. Schema Model Validation Tests (Node scripts)
8. Admin Dashboard Analytics
```

---

## ✅ Section 1: Health Check

Verify the server is running and responding.

```bash
curl http://localhost:5000/
```

**Expected Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Job Portal API Running"
}
```

---

## ✅ Section 2: User Registration

Register all three user roles. These will be used throughout the remaining tests.

### 2.1 Register a Candidate
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Candidate", "email": "candidate@example.com", "password": "securepassword123", "role": "candidate", "bio": "Aspiring developer"}'
```

**Expected Response (`201 Created`):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "name": "John Candidate",
    "email": "candidate@example.com",
    "role": "candidate",
    "_id": "..."
  }
}
```

---

### 2.2 Register a Recruiter
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Recruiter", "email": "recruiter@example.com", "password": "securepassword123", "role": "recruiter"}'
```

**Expected Response (`201 Created`):** Same structure as above.

---

### 2.3 Register an Admin
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Super Admin", "email": "admin@example.com", "password": "securepassword123", "role": "admin"}'
```

**Expected Response (`201 Created`):** Same structure as above.

---

### 2.4 Test Duplicate Email (Should Fail)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Duplicate", "email": "candidate@example.com", "password": "anypassword"}'
```

**Expected Response (`400 Bad Request`):**
```json
{
  "success": false,
  "message": "Email is already registered"
}
```

---

## ✅ Section 3: Login & JWT Tokens

> **Important:** Copy each token — you'll need all three for subsequent tests.

### 3.1 Login as Candidate
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
    "user": { "name": "John Candidate", "role": "candidate", ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
📌 **Save as:** `CANDIDATE_TOKEN`

---

### 3.2 Login as Recruiter
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "recruiter@example.com", "password": "securepassword123"}'
```
📌 **Save as:** `RECRUITER_TOKEN`

---

### 3.3 Login as Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "securepassword123"}'
```
📌 **Save as:** `ADMIN_TOKEN`

---

### 3.4 Test Wrong Credentials (Should Fail)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "candidate@example.com", "password": "wrongpassword"}'
```

**Expected Response (`401 Unauthorized`):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## ✅ Section 4: Profile Retrieval (Authentication Middleware)

### 4.1 Fetch Profile with Valid Token
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer CANDIDATE_TOKEN"
```

**Expected Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "name": "John Candidate",
    "email": "candidate@example.com",
    "role": "candidate",
    ...
  }
}
```

---

### 4.2 Fetch Profile Without Token (Should Fail)
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

---

### 4.3 Fetch Profile with Tampered Token (Should Fail)
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

## ✅ Section 5: Role-Based Access Control (RBAC Middleware)

### 5.1 Admin accesses Admin-only route (Authorized)
```bash
curl -X GET http://localhost:5000/api/auth/admin-only \
  -H "Authorization: Bearer ADMIN_TOKEN"
```
**Expected:** `200 OK` — `"Access granted: Welcome Admin!"`

---

### 5.2 Candidate accesses Admin-only route (Forbidden)
```bash
curl -X GET http://localhost:5000/api/auth/admin-only \
  -H "Authorization: Bearer CANDIDATE_TOKEN"
```
**Expected Response (`403 Forbidden`):**
```json
{
  "success": false,
  "message": "Forbidden: Role 'candidate' does not have permission to access this resource"
}
```

---

### 5.3 Recruiter accesses Recruiter-only route (Authorized)
```bash
curl -X GET http://localhost:5000/api/auth/recruiter-only \
  -H "Authorization: Bearer RECRUITER_TOKEN"
```
**Expected:** `200 OK` — `"Access granted: Welcome Recruiter!"`

---

### 5.4 Candidate accesses Recruiter-only route (Forbidden)
```bash
curl -X GET http://localhost:5000/api/auth/recruiter-only \
  -H "Authorization: Bearer CANDIDATE_TOKEN"
```
**Expected:** `403 Forbidden`

---

## ✅ Section 6: Resume Upload (Multer Middleware)

### 6.1 Upload a Valid PDF
> Ensure you have a `.pdf` file available on your machine.

```bash
curl -X POST http://localhost:5000/api/auth/profile/resume \
  -H "Authorization: Bearer CANDIDATE_TOKEN" \
  -F "resume=@C:/path/to/your/resume.pdf"
```

**Expected Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "file": {
    "filename": "resume-1720000000000-123456789.pdf",
    "path": "D:\\...\\backend\\uploads\\resumes\\...",
    "size": 85432
  }
}
```
> ✅ Verify the file appears in `backend/uploads/resumes/`.

---

### 6.2 Upload Non-PDF File (Should Fail)
```bash
curl -X POST http://localhost:5000/api/auth/profile/resume \
  -H "Authorization: Bearer CANDIDATE_TOKEN" \
  -F "resume=@C:/path/to/image.png"
```

**Expected Response (`400 Bad Request`):**
```json
{
  "success": false,
  "message": "Invalid file type. Only PDF resumes are allowed!"
}
```

---

### 6.3 Upload Without Auth (Should Fail)
```bash
curl -X POST http://localhost:5000/api/auth/profile/resume \
  -F "resume=@C:/path/to/resume.pdf"
```
**Expected:** `401 Unauthorized`

---

## ✅ Section 7: Schema Model Validation (Node.js Scripts)

These scripts test Mongoose models directly, bypassing the HTTP layer.

### 7.1 Company Model Test
```bash
cd backend
node testCompany.js
```
**Expected:**
```
✅ Validation properly caught invalid URL format: ...
✅ Company created successfully: { companyName: 'Tech Corp ...', ... }
✅ Populated Owner Details: Jane Recruiter
```

---

### 7.2 Job Model Test
```bash
node testJob.js
```
**Expected:**
```
✅ Validation caught invalid experience enum: ...
✅ Job created successfully: Senior Node.js Developer
✅ Company: Tech Corp ...
✅ Created By: Jane Recruiter
```

---

### 7.3 Application Model Test
```bash
node testApplication.js
```
**Expected:**
```
✅ Application submitted: pending
✅ Duplicate application blocked by compound unique index.
✅ Status updated to: accepted
✅ Candidate: John Candidate
✅ Job: Senior Node.js Developer
```

---

### 7.4 Saved Jobs Model Test
```bash
node testSavedJob.js
```
**Expected:**
```
✅ Job saved at: 2026-07-05T...
✅ Duplicate save blocked by compound unique index.
✅ Saved jobs for John Candidate:
 - Senior Node.js Developer | Bangalore
✅ Job unsaved successfully.
```

---

### 7.5 User Profile Update Test
```bash
node testUserUpdate.js
```
**Expected:**
```
✅ Update Profile Succeeded.
Updated Bio: Enthusiastic software engineer ...
Updated Skills: [ 'JavaScript', 'Node.js', ... ]
Role unchanged (Whitelist verified): candidate
Email unchanged (Whitelist verified): candidate@example.com
```

---

## ✅ Section 8: Admin Dashboard Analytics

### 8.1 Run Analytics Test
```bash
node testAdminAnalytics.js
```
**Expected:**
```
📊 Admin Dashboard Analytics
================================
👥 Users
   Total: 3
   Recruiters: 1
   Candidates: 1

💼 Jobs
   Total: 1
   Active: 1
   Inactive: 0

📋 Applications
   Total: 2
   By Status: { pending: 1, accepted: 1, rejected: 0 }

🆕 Recent Jobs
   - Senior Node.js Developer | Bangalore | ₹1500000

✅ Analytics fetched successfully.
```

---

## 📊 Full Endpoint Reference

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/` | ❌ | All | Health check |
| `POST` | `/api/auth/register` | ❌ | All | Register a new user |
| `POST` | `/api/auth/login` | ❌ | All | Login, get JWT token |
| `GET` | `/api/auth/profile` | ✅ | All | Get authenticated user profile |
| `GET` | `/api/auth/admin-only` | ✅ | Admin | Admin RBAC test route |
| `GET` | `/api/auth/recruiter-only` | ✅ | Recruiter | Recruiter RBAC test route |
| `POST` | `/api/auth/profile/resume` | ✅ | All | Upload PDF resume |

---

## 📬 Postman Collection Setup

1. Create a new **Postman Collection** called `Job Portal Backend`.
2. Add a **Collection Variable** named `BASE_URL` = `http://localhost:5000`.
3. After running the Login request, add a **Tests** script to auto-save the token:
   ```javascript
   const res = pm.response.json();
   pm.collectionVariables.set("TOKEN", res.data.token);
   ```
4. In all protected requests, set the **Authorization** tab → **Bearer Token** → `{{TOKEN}}`.

---

## ✅ Final Checklist

| Test Area | Status |
| :--- | :---: |
| Server starts without errors | ☐ |
| Register (candidate, recruiter, admin) | ☐ |
| Duplicate email rejected | ☐ |
| Login returns valid JWT | ☐ |
| Wrong password rejected | ☐ |
| Profile accessible with valid token | ☐ |
| Profile blocked without token | ☐ |
| Admin route — admin access passes | ☐ |
| Admin route — candidate access fails | ☐ |
| Recruiter route — recruiter access passes | ☐ |
| PDF upload succeeds | ☐ |
| Non-PDF upload rejected | ☐ |
| Company schema validates correctly | ☐ |
| Job schema validates correctly | ☐ |
| Duplicate application blocked | ☐ |
| Saved job duplicate blocked | ☐ |
| User whitelist prevents email/role change | ☐ |
| Admin analytics returns correct metrics | ☐ |
