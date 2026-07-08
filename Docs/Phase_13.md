# Phase 13: API Documentation

This document details the complete API reference for the Authentication, Job, and Admin modules of the MERN Job Portal backend.

---

## 🗺️ Phase Roadmap

| Step | Objective | Status |
| :--- | :--- | :---: |
| **1** | API Documentation Strategy & Design | ✅ Done |
| **10** | **Auth Module API Documentation** | ✅ Done |
| **11** | **Job Module API Documentation** | ✅ Done |
| **12** | **Admin Module API Documentation** | ✅ Done |

---

## 🌐 1. Industry Standards Adopted

* **Specification**: OpenAPI 3.0.0 standards are used to design and format these endpoint descriptions.
* **Security Scheme**: Bearer Authentication (JWT). Headers must include: `Authorization: Bearer <token>`.
* **Consistent Envelope**: All success responses return `{ success: true, message, data }` and error responses return `{ success: false, message, errors }`.

---

## 📂 2. Folder Structure

We use the **Code-First JSDoc** approach (Option A). Route files are decorated with JSDoc tags, and an interactive UI is served at `/api-docs` using `swagger-ui-express` and `swagger-jsdoc`.

```text
backend/
├── src/
│   ├── app.js                          # Mounts the /api-docs swagger router
│   ├── config/
│   │   └── swagger.js                  # Configures swagger-jsdoc options
│   └── routes/
│       ├── authRoutes.js               # Route mapping & swagger specs for Auth
│       ├── jobRoutes.js                # Route mapping & swagger specs for Jobs
│       └── adminRoutes.js              # Route mapping & swagger specs for Admin
Docs/
└── Phase_13.md                         # This markdown spec document
```

---

## 🔐 Step 10: Auth API Documentation

### 1. Register User
* **Method**: `POST`
* **URL**: `/api/auth/register`
* **Auth Requirement**: None (Public)
* **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "password": "securePassword123",
    "role": "candidate" // Option: "candidate" (default) or "recruiter"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "id": "64b8f05e9a4e9b89f81a74d2",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "role": "candidate"
    }
  }
  ```
* **Error Cases**:
  * **400 Bad Request (Validation Failure)**:
    ```json
    {
      "success": false,
      "message": "Validation failed",
      "errors": [
        { "field": "password", "message": "Password must be at least 6 characters long" }
      ]
    }
    ```
  * **409 Conflict (Duplicate Email)**:
    ```json
    {
      "success": false,
      "message": "Duplicate value: 'jane.doe@example.com' already exists for 'email'"
    }
    ```

---

### 2. Login User
* **Method**: `POST`
* **URL**: `/api/auth/login`
* **Auth Requirement**: None (Public)
* **Request Body**:
  ```json
  {
    "email": "jane.doe@example.com",
    "password": "securePassword123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "64b8f05e9a4e9b89f81a74d2",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "role": "candidate"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
* **Error Cases**:
  * **400 Bad Request**: Missing email or password.
  * **401 Unauthorized**: Invalid email or password.

---

### 3. Get User Profile
* **Method**: `GET`
* **URL**: `/api/auth/profile`
* **Auth Requirement**: Bearer Token (Any logged-in Candidate, Recruiter, or Admin)
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Profile retrieved successfully",
    "data": {
      "id": "64b8f05e9a4e9b89f81a74d2",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "role": "candidate",
      "skills": ["JavaScript", "Node.js"],
      "bio": "Software developer",
      "resume": ""
    }
  }
  ```
* **Error Cases**:
  * **401 Unauthorized**: Token missing, expired, or invalid.

---

## 💼 Step 11: Job API Documentation

### 1. Create Job
* **Method**: `POST`
* **URL**: `/api/jobs`
* **Auth Requirement**: Bearer Token (Role: `recruiter` only)
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "title": "Node.js Backend Developer",
    "description": "Build high-performance REST APIs.",
    "salary": 1400000,
    "location": "Bangalore",
    "experience": "1-3 years", // Must match: '0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years'
    "jobType": "Full-time",    // Option: 'Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'
    "skills": ["Node.js", "Express", "MongoDB"],
    "company": "64b8f05e9a4e9b89f81a74e3" // ObjectId reference to Company
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Job created successfully",
    "data": {
      "id": "64b8f05e9a4e9b89f81a74f4",
      "title": "Node.js Backend Developer",
      "description": "Build high-performance REST APIs.",
      "salary": 1400000,
      "location": "Bangalore",
      "experience": "1-3 years",
      "jobType": "Full-time",
      "skills": ["Node.js", "Express", "MongoDB"],
      "company": "64b8f05e9a4e9b89f81a74e3",
      "createdBy": "64b8f05e9a4e9b89f81a74d2",
      "isActive": true
    }
  }
  ```
* **Error Cases**:
  * **400 Bad Request**: Validation error (e.g., negative salary, bad experience range).
  * **401 Unauthorized**: Invalid or missing token.
  * **403 Forbidden**: User is logged in but does not have the `recruiter` role.

---

### 2. Get Jobs
* **Method**: `GET`
* **URL**: `/api/jobs`
* **Auth Requirement**: None (Public)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "64b8f05e9a4e9b89f81a74f4",
        "title": "Node.js Backend Developer",
        "salary": 1400000,
        "location": "Bangalore",
        "jobType": "Full-time"
      }
    ]
  }
  ```

---

### 3. Get Job By ID
* **Method**: `GET`
* **URL**: `/api/jobs/:id`
* **Auth Requirement**: None (Public)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "64b8f05e9a4e9b89f81a74f4",
      "title": "Node.js Backend Developer",
      "description": "Build high-performance REST APIs.",
      "salary": 1400000,
      "location": "Bangalore",
      "experience": "1-3 years",
      "jobType": "Full-time",
      "skills": ["Node.js", "Express", "MongoDB"],
      "company": {
        "id": "64b8f05e9a4e9b89f81a74e3",
        "companyName": "TechCorp"
      }
    }
  }
  ```
* **Error Cases**:
  * **400 Bad Request**: Invalid ID syntax (not a valid ObjectId).
  * **404 Not Found**: Job with specified ID does not exist.

---

### 4. Update Job
* **Method**: `PUT`
* **URL**: `/api/jobs/:id`
* **Auth Requirement**: Bearer Token (Role: `recruiter` owner only)
* **Headers**: `Authorization: Bearer <token>`
* **Request Body** (All fields optional):
  ```json
  {
    "salary": 1500000,
    "location": "Remote"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Job updated successfully",
    "data": {
      "id": "64b8f05e9a4e9b89f81a74f4",
      "title": "Node.js Backend Developer",
      "salary": 1500000,
      "location": "Remote"
    }
  }
  ```
* **Error Cases**:
  * **401 Unauthorized**: Missing/invalid token.
  * **403 Forbidden**: Recruiter is authenticated but does not own this job listing.
  * **404 Not Found**: Job not found.

---

### 5. Delete Job
* **Method**: `DELETE`
* **URL**: `/api/jobs/:id`
* **Auth Requirement**: Bearer Token (Role: `recruiter` owner only)
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Job deleted successfully"
  }
  ```
* **Error Cases**:
  * **401 Unauthorized**: Token missing or expired.
  * **403 Forbidden**: User is not the owner recruiter of the job.
  * **404 Not Found**: Job not found.

---

### 6. Search Job
* **Method**: `GET`
* **URL**: `/api/jobs/search`
* **Query Parameters**:
  * `keyword` (Optional) - String matching title or description (e.g. `Node`)
  * `location` (Optional) - String matching location (e.g. `Bangalore`)
* **Auth Requirement**: None (Public)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "id": "64b8f05e9a4e9b89f81a74f4",
        "title": "Node.js Backend Developer",
        "location": "Bangalore"
      }
    ]
  }
  ```

---

## 🛠️ Step 12: Admin API Documentation

### 1. Manage Users (List / Delete)
* **Method & URL**:
  * `GET /api/admin/users` (List all users)
  * `DELETE /api/admin/users/:id` (Delete a user)
* **Auth Requirement**: Bearer Token (Role: `admin` only)
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK - GET)**:
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "id": "64b8f05e9a4e9b89f81a74d2",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "role": "candidate"
      }
    ]
  }
  ```
* **Success Response (200 OK - DELETE)**:
  ```json
  {
    "success": true,
    "message": "User deleted successfully by Admin"
  }
  ```
* **Error Cases**:
  * **401 Unauthorized**: Invalid or missing token.
  * **403 Forbidden**: User does not possess the `admin` role.
  * **404 Not Found** (on DELETE): Target user does not exist.

---

### 2. Manage Jobs (Delete any Job listing)
* **Method**: `DELETE`
* **URL**: `/api/admin/jobs/:id`
* **Auth Requirement**: Bearer Token (Role: `admin` only)
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Job deleted successfully by Admin"
  }
  ```
* **Error Cases**:
  * **401/403**: Authentication or authorization issues.
  * **404 Not Found**: Job does not exist.

---

### 3. Dashboard Analytics
* **Method**: `GET`
* **URL**: `/api/admin/analytics`
* **Auth Requirement**: Bearer Token (Role: `admin` only)
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Analytics fetched successfully",
    "data": {
      "users": {
        "total": 12,
        "recruiters": 4,
        "candidates": 8
      },
      "jobs": {
        "total": 6,
        "active": 5,
        "inactive": 1
      },
      "applications": {
        "total": 10,
        "byStatus": {
          "pending": 4,
          "accepted": 4,
          "rejected": 2
        }
      }
    }
  }
  ```
* **Error Cases**:
  * **401 Unauthorized**: Invalid/missing token.
  * **403 Forbidden**: User is not an admin.
