# Phase 20 - Admin Module & Polish

## Overview
Built the complete Admin Module for the MERN Job Portal, fulfilling the final set of requirements. This phase provides the platform owner with an overview of system activity and the ability to moderate users and job postings. It also includes global application polish such as skeleton loading states and toast notifications.

## What Was Done

### 1. Admin Module Backend
- **Admin Endpoints**: The backend already possessed `/api/admin/analytics` and `/api/admin/users`.
- **Job Moderation**: Modified the `deleteJob` controller in `jobController.js` and the corresponding route definition in `jobRoutes.js`. The endpoint now permits an `admin` to bypass IDOR restrictions and delete any job listing to moderate the platform.

### 2. Admin Module Frontend
- **State & API**:
  - Created `adminApi.js` to handle `/api/admin/*` endpoints and call `deleteJobAsAdmin`.
  - Created `adminSlice.js` to manage `analytics` and `users` state.
  - Registered `adminReducer` in `rootReducer.js`.
- **Admin Dashboard (`AdminDashboardPage.jsx`)**: Displays high-level analytics (Total Users, Jobs, Applications, Companies) using skeleton loaders while fetching data, alongside quick-access links to management pages.
- **User Management (`AdminUserManagementPage.jsx`)**: A paginated datatable displaying all registered users (name, email, role, date joined). Admins can delete users from this interface.
- **Job Moderation (`AdminJobManagementPage.jsx`)**: Fetches all jobs across the platform regardless of the creator. Admins can review job titles and company names and remove any listings that violate platform policies.

### 3. Application Polish
- **Toast Notifications (`react-hot-toast`)**:
  - Installed and integrated `react-hot-toast` at the top level (`App.jsx`).
  - Added global, non-intrusive success and error toast messages for destructive actions (e.g., deleting users, deleting jobs) and critical creations (e.g., posting a new job).
  - Also added toasts when recruiters accept/reject candidate applications.
- **Loaders & Error Handling**:
  - Implemented skeleton screens across all new admin pages to improve perceived performance during data fetches.
  - Handled generic API failure states gracefully using standard Redux Toolkit rejections displayed in UI banners.
- **Responsive Design**: Ensured all datatables in the admin pages use `overflow-x-auto` to scroll horizontally on small screens. Used mobile-first grid layouts (`grid-cols-1 md:grid-cols-2`) for dashboard quick links and analytics widgets.

## Architecture Decisions
- **Reusing Job Endpoints for Moderation**: Instead of creating a separate `/api/admin/jobs/:id` endpoint for deletion, we adjusted the existing `/api/jobs/:id` delete logic to check if `req.user.role === 'admin'`. This keeps the API surface area small while enabling moderation.
- **No Local Job Slice Syncing on Delete**: When an admin deletes a job, instead of trying to manually pluck it out of the `jobSlice` array, we simply re-fetch the current page of `fetchJobsList()`. This guarantees the pagination state (total pages, current items) remains perfectly synchronized with the server.

## Commit Message
```
feat(admin): complete Admin Module and frontend polish (Phase 20)

- Built AdminDashboardPage showing platform analytics.
- Created AdminUserManagementPage for paginated user deletion.
- Created AdminJobManagementPage for global job moderation.
- Updated backend job controller to permit admins to bypass IDOR on job deletion.
- Integrated react-hot-toast for global success/error notifications.
- Applied responsive design and skeleton loaders across admin views.
```
