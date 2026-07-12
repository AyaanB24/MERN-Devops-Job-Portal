# Phase 18 - Candidate Module

## Overview
Built the complete Candidate Module for the MERN Job Portal. This phase empowers users with the 'candidate' role to manage their professional profiles, upload resumes, apply for jobs directly from job listings, and track their application statuses via a dedicated dashboard.

## What Was Done

### 1. Backend Updates
- Exposed `PUT /api/auth/profile` and `POST /api/auth/resume` to allow candidates to update their bio, skills, and resume.
- Integrated `multer` on the backend to handle resume PDF uploads and serve them statically.
- Mapped existing `applicationController` methods to `applicationRoutes.js` and protected them with `authorize('candidate')`.

### 2. Redux State & API Layer
- **`authSlice` Updates:** Added `updateProfile` and `uploadResume` async thunks to push updates to the backend and reflect them in the current `auth.user` state.
- **`applicationApi.js` & `applicationSlice.js`:** Created an entirely new slice and service to handle job applications. 
  - `submitApplication`: POSTs a new application to a job.
  - `getApplicationsList`: GETs all applications made by the currently logged-in candidate.

### 3. UI Components & Pages
- **`CandidateDashboardPage.jsx`:** A personalized landing page showing application statistics (pending/accepted/rejected) and prompting the user to complete their profile if data is missing.
- **`CandidateProfilePage.jsx`:** A form to edit the user's `bio` and `skills`, plus a separate section to upload a PDF resume. Displays success/error banners appropriately.
- **`ApplicationsPage.jsx`:** A tracker displaying a list of all jobs the candidate has applied to, highlighting current status with colored badges.
- **`JobDetailPage.jsx` Integration:** Upgraded the static placeholder to an interactive Apply flow. If a candidate is logged in, they can reveal an inline form, optionally add a cover letter, and submit an application directly.

### 4. Routing Integration
- Replaced the placeholder components in `src/routes/index.jsx` with the actual Candidate page components inside the `<ProtectedRoute allowedRoles={['candidate']}>` wrapper.

## How to Test

### 1. Register & Profile Update
1. Create a new account and ensure you select the **Candidate** role during registration.
2. Log in and you will be directed to `/jobs` by default (or navigate to `/candidate/dashboard`).
3. Click "Edit Profile" or go to `/candidate/profile`.
4. Update your bio and skills. You should see a success message and your profile information update instantly on the page.
5. Upload a PDF resume (max 5MB). You should see the "Current resume on file" badge appear upon successful upload.

### 2. Job Application
1. Navigate to "Browse Jobs" (`/jobs`).
2. Click on a specific job.
3. On the right sidebar, click the "Apply Now" button.
4. (Optional) Enter a cover letter and submit.
5. You should see a success confirmation and a link to view your applications.

### 3. Dashboard & Tracking
1. Navigate to `/candidate/dashboard`. Check that your stats have updated correctly (e.g., Total Applied: 1, Pending: 1).
2. Go to "My Applications" (`/candidate/applications`).
3. Verify that your recently applied job is listed with a "pending" badge.

## Next Steps
In the next phase, we will focus on the Recruiter module, enabling employers to create job listings, manage their company profile, and review incoming candidate applications.
