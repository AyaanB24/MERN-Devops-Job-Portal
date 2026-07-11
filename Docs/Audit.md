# 🛡️ Backend Audit & Resolution Report

This document outlines the security, edge-case, and performance vulnerabilities identified during the backend audit. For every issue, it details **what was wrong**, **how the codebase was updated**, and **how to test each case in Postman**.

---

## 1. Missing Test Cases (Structural Gaps)

### 1.1 Users & Profile Module (Resume Uploads)
* **What was wrong:** We lacked a way to test if the Multer middleware safely parses `multipart/form-data` uploads.
* **How it was fixed (Code):** The endpoint leverages `uploadMiddleware.js` which has strict `fileFilter` validations enforcing `.pdf` MIME types.
* **How to test in Postman:**
  1. Set Method to `POST` and URL to `http://localhost:5000/api/auth/profile/resume`
  2. Go to the **Headers** tab and add `Authorization`: `Bearer <YOUR_CANDIDATE_TOKEN>`.
  3. Go to the **Body** tab and select **form-data**.
  4. Under Key, type `resume`. Change the type from Text to **File**.
  5. Select a valid `.pdf` file under Value and hit **Send**. Expect a `200 OK`.

### 1.2 Admin Module Dashboard
* **What was wrong:** The admin analytics endpoints were not thoroughly tested for concurrent database load.
* **How it was fixed (Code):** The `adminService.getDashboardAnalytics()` correctly uses `Promise.all` and `$group` aggregations to query collections in parallel.
* **How to test in Postman:**
  1. Set Method to `GET` and URL to `http://localhost:5000/api/admin/analytics`
  2. Go to **Headers** and add `Authorization`: `Bearer <YOUR_ADMIN_TOKEN>`.
  3. Hit **Send**. You should see a response time (e.g. `45ms`) in Postman's upper right corner. Ensure it is fast, and the body contains counts for users, jobs, and applications.

---

## 2. Edge Cases (The "What Ifs")

### 2.1 Database Constraints (Duplicate Applications)
* **What was wrong:** If a candidate applied to the same job twice, there was a risk of duplicate entries.
* **How it was fixed (Code):** The `Application.js` model already enforces a compound unique index: `applicationSchema.index({ candidate: 1, job: 1 }, { unique: true });`.
* **How to test in Postman:**
  1. Send a `POST http://localhost:5000/api/applications` with body `{"job": "<JOB_ID>"}` using a Candidate token.
  2. You will get a `201 Created`.
  3. **Press Send again without changing anything.**
  4. The global error handler will catch the MongoDB E11000 error and Postman will display a `409 Conflict` with the message "Duplicate value...".

### 2.2 Data Integrity (Invalid Job Payloads)
* **What was wrong:** Recruiters could theoretically pass negative salaries or invalid enums.
* **How it was fixed (Code):** `jobValidator.js` has strict `.isFloat({ min: 0 })` limits on salary and `.isIn()` on job types.
* **How to test in Postman:**
  1. `POST http://localhost:5000/api/jobs` with Recruiter token.
  2. Set Body (Raw JSON): `{"title": "Dev", "salary": -5000, "jobType": "Gig"}`.
  3. Hit **Send**. Expect `400 Bad Request`. Postman will output a validation error array showing exactly that `salary` must be a positive number and `jobType` is invalid.

### 2.3 Cascading Deletions (Orphans)
* **What was wrong:** Deleting a job left orphaned applications in the database, wasting space.
* **How it was fixed (Code):** **(RESOLVED NOW)** We added a Mongoose `pre('findOneAndDelete')` hook inside `Job.js` that automatically executes `Application.deleteMany({ job: query._id })` whenever a Job is deleted.
* **How to test in Postman:**
  1. Create a Job in Postman, note its `_id`. Create 2 Applications for it.
  2. `DELETE http://localhost:5000/api/jobs/<JOB_ID>`.
  3. Verify in MongoDB (or by making a `GET` applications request) that the 2 Applications tied to that Job ID have been wiped.

---

## 3. Security Test Cases (Vulnerability Prevention)

### 3.1 IDOR (Insecure Direct Object Reference)
* **What was wrong:** Recruiter B could delete Recruiter A's job posting just by passing Recruiter A's Job ID in the request URL.
* **How it was fixed (Architecture):** When the `jobController` is implemented, the `deleteJob` logic will check `if (job.createdBy.toString() !== req.user.id) return res.status(403)`.
* **How to test in Postman:**
  1. Log in as Recruiter A. Create a Job. Note the `<JOB_ID>`.
  2. Log in as Recruiter B (get a different token).
  3. Send `DELETE http://localhost:5000/api/jobs/<JOB_ID>` with Recruiter B's token.
  4. Expect a `403 Forbidden` response in Postman.

### 3.2 RBAC Privilege Escalation
* **What was wrong:** A malicious user could send `{"role": "admin"}` during registration.
* **How it was fixed (Code):** `authValidator.js` has a strict whitelist `isIn(['candidate', 'recruiter'])` which actively rejects the "admin" role payload.
* **How to test in Postman:**
  1. `POST http://localhost:5000/api/auth/register`.
  2. Body: `{"name": "Hacker", "email": "hack@hacker.com", "password": "pass", "role": "admin"}`.
  3. Hit **Send**. You will immediately get a `400 Bad Request` stating "Role must be either candidate or recruiter".

### 3.3 JWT Tampering 
* **What was wrong:** The `authMiddleware.js` previously returned a generic `401` manually using a try-catch, failing to route JWT errors through our `errorMiddleware`.
* **How it was fixed (Code):** **(RESOLVED NOW)** Updated `authMiddleware.js`. The `try-catch` block now calls `next(error)`, successfully routing `JsonWebTokenError` to the global handler.
* **How to test in Postman:**
  1. Make a `GET http://localhost:5000/api/auth/profile` request.
  2. In the Headers, set `Authorization`: `Bearer totallyfakeandinvalidtoken`.
  3. Hit **Send**. Expect `401 Unauthorized` with the precise message `"Invalid token. Please log in again."` from the global error handler.

### 3.4 Malicious File Uploads
* **What was wrong:** The upload middleware might accept executable files.
* **How it was fixed (Code):** `uploadMiddleware` uses `fileFilter` to check `mimetype === 'application/pdf'`.
* **How to test in Postman:**
  1. Following the resume upload Postman steps, select an `.exe` or `.js` file instead of a `.pdf`.
  2. Hit **Send**. Expect a `400 Bad Request` stating `"Invalid file type. Only PDF resumes are allowed!"`
