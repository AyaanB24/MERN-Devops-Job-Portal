# 🚀 Postman Testing Guide & Mock Data

> ⚠️ **CRITICAL NOTE BEFORE TESTING** ⚠️
> Currently, your backend only has the `authRoutes` fully implemented. If you try to test the Jobs, Companies, Applications, or Admin endpoints right now, you will get a **`404 Route Not Found`** error. 
> 
> Use this document as your blueprint. As you build each controller and route, use the exact JSON payloads below to verify they work perfectly in Postman!

---

## 🔑 1. Authentication Module

### A. Register a Candidate
* **Endpoint:** `POST http://localhost:5000/api/auth/register`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
```json
{
  "name": "Alex Candidate",
  "email": "alex.candidate@example.com",
  "password": "securepassword123",
  "role": "candidate"
}
```

### B. Register a Recruiter
* **Endpoint:** `POST http://localhost:5000/api/auth/register`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
```json
{
  "name": "Sarah Recruiter",
  "email": "sarah.recruiter@example.com",
  "password": "securepassword123",
  "role": "recruiter"
}
```

### C. Login (Get your Token!)
* **Endpoint:** `POST http://localhost:5000/api/auth/login`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
```json
{
  "email": "sarah.recruiter@example.com",
  "password": "securepassword123"
}
```
*(Copy the `token` from the response. You will need it for the steps below!)*

### D. Get Profile
* **Endpoint:** `GET http://localhost:5000/api/auth/profile`
* **Headers:** `Authorization: Bearer <PASTE_TOKEN_HERE>`
* **Body:** *none*

---

## 🏢 2. Companies Module
*(Requires Recruiter Token)*

### A. Create a Company
* **Endpoint:** `POST http://localhost:5000/api/companies`
* **Headers:** `Authorization: Bearer <RECRUITER_TOKEN>`, `Content-Type: application/json`
* **Body (raw JSON):**
```json
{
  "companyName": "Tech Innovators Inc.",
  "description": "Leading the future of AI and web technologies.",
  "website": "https://techinnovators.example.com"
}
```
*(Save the `companyId` returned in the response!)*

### B. Update Company
* **Endpoint:** `PUT http://localhost:5000/api/companies/<COMPANY_ID>`
* **Headers:** `Authorization: Bearer <RECRUITER_TOKEN>`, `Content-Type: application/json`
* **Body (raw JSON):**
```json
{
  "description": "Leading the future of AI, Web, and Mobile technologies."
}
```

---

## 💼 3. Jobs Module

### A. Create a Job
*(Requires Recruiter Token)*
* **Endpoint:** `POST http://localhost:5000/api/jobs`
* **Headers:** `Authorization: Bearer <RECRUITER_TOKEN>`, `Content-Type: application/json`
* **Body (raw JSON):**
```json
{
  "title": "Senior Frontend Developer",
  "description": "We are looking for an expert in React, Redux, and Tailwind CSS.",
  "salary": 120000,
  "location": "Remote",
  "jobType": "Full-time",
  "experience": "3-5 years",
  "company": "<PASTE_COMPANY_ID_HERE>"
}
```
*(Save the `jobId` returned in the response!)*

### B. Get All Jobs
*(Public - No Token Required)*
* **Endpoint:** `GET http://localhost:5000/api/jobs`
* **Body:** *none*

### C. Update a Job
*(Requires Recruiter Token)*
* **Endpoint:** `PUT http://localhost:5000/api/jobs/<JOB_ID>`
* **Headers:** `Authorization: Bearer <RECRUITER_TOKEN>`, `Content-Type: application/json`
* **Body (raw JSON):**
```json
{
  "salary": 130000
}
```

---

## 📝 4. Applications Module

### A. Apply for a Job
*(Requires Candidate Token)*
* **Endpoint:** `POST http://localhost:5000/api/applications`
* **Headers:** `Authorization: Bearer <CANDIDATE_TOKEN>`, `Content-Type: application/json`
* **Body (raw JSON):**
```json
{
  "job": "<PASTE_JOB_ID_HERE>",
  "coverLetter": "I have 4 years of experience in React and would love to join your team. Please find my resume attached to my profile."
}
```
*(Save the `applicationId` returned in the response!)*

### B. Get Applications (For a specific job)
*(Requires Recruiter Token)*
* **Endpoint:** `GET http://localhost:5000/api/applications?job=<JOB_ID>`
* **Headers:** `Authorization: Bearer <RECRUITER_TOKEN>`
* **Body:** *none*

### C. Update Application Status
*(Requires Recruiter Token)*
* **Endpoint:** `PUT http://localhost:5000/api/applications/<APPLICATION_ID>/status`
* **Headers:** `Authorization: Bearer <RECRUITER_TOKEN>`, `Content-Type: application/json`
* **Body (raw JSON):**
```json
{
  "status": "accepted" 
}
```
*(You can test with "accepted" or "rejected")*

---

## 👑 5. Admin Module
*(Requires Admin Token - Ensure you manually change a user's role to 'admin' in MongoDB Compass for testing)*

### A. View Dashboard Analytics
* **Endpoint:** `GET http://localhost:5000/api/admin/analytics`
* **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`
* **Body:** *none*

### B. Delete a Malicious User
* **Endpoint:** `DELETE http://localhost:5000/api/admin/users/<USER_ID>`
* **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`
* **Body:** *none*
