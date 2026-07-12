# Phase 19 - Recruiter Module

## Overview
Built the complete Recruiter Module for the MERN Job Portal. This phase allows users with the 'recruiter' role to create their company profiles, post new jobs, manage their job listings, and view/evaluate incoming candidate applications.

## What Was Done

### 1. Backend Updates
- **`jobController.js`**: Enhanced the `getJobs` controller to support a `createdBy` filter in the query string. This enables fetching only the jobs posted by a specific recruiter.

### 2. State Management & API Layer
- **Company Management**:
  - Created `companyApi.js` to handle `/api/companies` endpoints.
  - Created `companySlice.js` to manage the recruiter's active company profile.
  - Registered `companyReducer` into the global `rootReducer.js`.
- **Job Management (`jobSlice.js` & `jobApi.js`)**:
  - Added `createNewJob` async thunk and `createJob` API method.
  - Added `fetchRecruiterJobs` to fetch paginated jobs filtered by the current recruiter's ID.
- **Application Management (`applicationSlice.js` & `applicationApi.js`)**:
  - Added `fetchJobApplicants` to get all applications tied to a specific job ID.
  - Added `updateApplicantStatus` to allow the recruiter to accept or reject candidates.

### 3. UI Components & Pages
- **`RecruiterDashboardPage.jsx`**: A specialized landing page that highlights pending actions—such as a prompt to setup a company profile before attempting to post jobs—and provides quick action links.
- **`CompanyManagementPage.jsx`**: A form for creating and updating company details like Name, Website, and Description.
- **`CreateJobPage.jsx`**: A comprehensive form capturing all required details to post a new job (Title, Location, Salary, Type, Experience, Skills, Description). It enforces that a company profile exists first.
- **`ManageJobsPage.jsx`**: A data table displaying all active job postings by the recruiter. Includes quick links to view applicants for each job.
- **`ViewApplicantsPage.jsx`**: Shows a detailed list of all candidates who applied to a specific job. Recruiters can read cover letters, view resumes, and update the application status to "Accepted" or "Rejected".

### 4. Routing Integration
- Updated `src/routes/index.jsx` to replace placeholders with the newly built Recruiter components. All these routes are secured within the `<ProtectedRoute allowedRoles={['recruiter']}>` component.

## Architecture Decisions
- **Company Enforcement**: We chose to force the recruiter to have a valid company profile fetched into Redux before allowing access to `CreateJobPage` or rendering job creation UI. This prevents backend validation errors and ensures all jobs are linked to a company.
- **Shared Application Slice**: The `applicationSlice` handles both candidate and recruiter flows. Candidates fetch their own applications, while recruiters fetch applications by Job ID. We utilized the same `items` array for both views to keep state management simple, as they are never active simultaneously.

## Commit Message
```
feat(recruiter): implement Recruiter Module (Phase 19)

- Built RecruiterDashboard and CompanyManagementPage for profile setup.
- Developed CreateJobPage and ManageJobsPage to handle job posting flows.
- Created ViewApplicantsPage allowing recruiters to accept/reject candidates.
- Added companySlice and expanded job/application slices for recruiter API endpoints.
- Updated backend jobController to support createdBy filtering.
- Secured recruiter routes in application router.
```
