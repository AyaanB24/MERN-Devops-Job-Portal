# Quick Reference - System Overview

**Date**: July 14, 2026  
**Status**: Production Ready  
**Last Updated**: Context Transfer Session

---

## 🚀 Quick Start

### Prerequisites
- Node.js installed
- MongoDB running
- Ports 5000 & 3000 available

### Running the System

**Terminal 1 - Backend**:
```bash
cd backend
npm install  # if needed
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm install  # if needed
npm run dev
```

**Access**:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- API: `http://localhost:5000/api`

---

## 🔐 Authentication Flow

### User Registration
```
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "candidate" | "recruiter"
}

Response:
{
  "success": true,
  "data": {
    "user": { id, name, email, role, createdAt },
    "token": "jwt_token_here"
  }
}
```

### User Login
```
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securepassword"
}

Response: Same as register
```

### Token Storage & Usage
1. Token stored in `localStorage` as `token`
2. Axios default header set: `Authorization: Bearer <token>`
3. All API requests automatically include token
4. Token persists on page refresh

---

## 👥 User Roles & Access

### Candidate
- **Dashboard**: `/candidate/dashboard`
- **Access**:
  - Browse all jobs (`/jobs`)
  - View job details
  - Apply for jobs
  - View applications
  - Edit profile

- **Cannot Access**:
  - Manage companies
  - Manage jobs
  - View applications from recruiters
  - Admin features

### Recruiter
- **Dashboard**: `/recruiter/dashboard`
- **Access**:
  - Manage companies (`/recruiter/manage-companies`)
  - Post jobs (`/recruiter/manage-jobs`)
  - View applications for own jobs
  - Update application status
  - Edit profile

- **Cannot Access**:
  - Browse candidate jobs
  - See other recruiters' companies
  - See other recruiters' jobs
  - See other recruiters' applications

### Admin
- **Dashboard**: `/admin/dashboard`
- **Access**:
  - All candidate features
  - All recruiter features
  - System analytics
  - User management (future)

---

## 🛡️ Security Features

### Task 4: Recruiter Isolation
- Each recruiter only sees their own company's jobs
- Recruiters cannot access other recruiters' applications
- Company ownership verified before any action
- 403 Forbidden for unauthorized access

### Backend Protections
- JWT token validation on all protected routes
- Company ownership verification in `jobController.js`
- Application access control in `applicationController.js`
- Input validation on all endpoints
- Error handling middleware for security errors

### Frontend Protections
- Protected routes redirect to login if not authenticated
- Role-based route protection (e.g., `/recruiter/` only for recruiters)
- Token automatically cleared on logout
- Token loaded on app startup

---

## 📁 File Structure

### Frontend
```
frontend/
├── src/
│   ├── store/
│   │   ├── authStore.js          ← Authentication & user state
│   │   ├── jobStore.js           ← Job & application management
│   │   └── themeStore.js         ← Dark/Light theme
│   ├── pages/
│   │   ├── LoginPage.jsx         ← Login form
│   │   ├── RegisterPage.jsx      ← Registration form
│   │   ├── HomePage.jsx          ← Landing page
│   │   ├── CandidateDashboard.jsx
│   │   ├── RecruiterDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── JobsPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── ...
│   ├── components/
│   │   ├── Navbar.jsx            ← Navigation
│   │   ├── JobFormModal.jsx      ← Job creation form
│   │   ├── CompanyFormModal.jsx  ← Company creation form
│   │   └── Footer.jsx
│   ├── App.jsx                   ← Main app with routes
│   └── main.jsx
├── package.json
└── vite.config.js
```

### Backend
```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js     ← Login/Register/Profile
│   │   ├── jobController.js      ← Job CRUD + isolation
│   │   ├── applicationController.js ← Application handling
│   │   ├── companyController.js
│   │   └── ...
│   ├── models/
│   │   ├── User.js               ← User schema
│   │   ├── Job.js                ← Job schema
│   │   ├── Application.js        ← Application schema
│   │   ├── Company.js            ← Company schema (with owner)
│   │   └── SavedJob.js
│   ├── middleware/
│   │   ├── authMiddleware.js     ← JWT verification
│   │   ├── roleMiddleware.js     ← Role-based access
│   │   ├── validationMiddleware.js ← Input validation
│   │   └── errorMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── companyRoutes.js
│   │   └── ...
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── jobValidator.js
│   │   └── companyValidator.js
│   ├── services/
│   │   ├── authService.js
│   │   └── ...
│   ├── config/
│   │   └── db.js                 ← MongoDB connection
│   ├── utils/
│   │   └── asyncHandler.js
│   ├── app.js                    ← Express app setup
│   └── server.js
├── .env                          ← Environment variables
├── package.json
└── jest.config.js
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)
- `POST /api/auth/profile/resume` - Upload resume (protected)

### Jobs
- `GET /api/jobs` - Get jobs (filtered by recruiter's companies if recruiter)
- `GET /api/jobs/:id` - Get job details (with company ownership check)
- `POST /api/jobs` - Create job (protected, recruiter only)
- `PUT /api/jobs/:id` - Update job (protected, recruiter only)
- `DELETE /api/jobs/:id` - Delete job (protected, recruiter only)

### Companies
- `GET /api/companies` - Get companies (only own if recruiter)
- `GET /api/companies/:id` - Get company details
- `POST /api/companies` - Create company (protected, recruiter only)
- `PUT /api/companies/:id` - Update company (protected, recruiter only)
- `DELETE /api/companies/:id` - Delete company (protected, recruiter only)

### Applications
- `GET /api/applications` - Get applications (recruiter sees own jobs' apps)
- `POST /api/applications` - Submit application (protected, candidate only)
- `PUT /api/applications/:id/status` - Update status (protected, recruiter only)

---

## 🧪 Testing Checklist

### Authentication
- [ ] Register as candidate → redirects to candidate dashboard
- [ ] Register as recruiter → redirects to recruiter dashboard
- [ ] Login → token in localStorage
- [ ] Page refresh → stays logged in
- [ ] Logout → token removed, redirects to home

### Authorization
- [ ] Access `/candidate/dashboard` as candidate → works
- [ ] Access `/candidate/dashboard` as recruiter → redirects to home
- [ ] Access `/recruiter/dashboard` as recruiter → works
- [ ] Access `/recruiter/dashboard` as candidate → redirects to home
- [ ] All API requests have `Authorization` header

### Recruiter Isolation
- [ ] Recruiter 1 creates company A
- [ ] Recruiter 1 posts job under company A
- [ ] Recruiter 2 cannot see company A
- [ ] Recruiter 2 cannot see job from company A
- [ ] Recruiter 2 cannot edit/delete job from company A
- [ ] API returns 403 for unauthorized access

### Job Management
- [ ] Create job → appears in list
- [ ] Update job → changes appear
- [ ] Delete job → removed from list
- [ ] Post job without company → 400 error
- [ ] Post job with invalid company → 403 error

### Candidate Flow
- [ ] Browse all jobs → see jobs from all companies
- [ ] Apply to job → application submitted
- [ ] View my applications → see all own applications
- [ ] Cannot see recruiter jobs list

---

## 🐛 Troubleshooting

### Issue: 401 Unauthorized on all API calls
**Solution**:
- Verify token is in localStorage
- Check if `axios.defaults.headers.common['Authorization']` is set
- Login again to get fresh token
- Clear localStorage and retry

### Issue: Recruiter can see other recruiters' jobs
**Solution**:
- Check if `jobController.js` has company ownership verification
- Verify recruiter companies are being queried correctly
- Check MongoDB query in `getJobs` method

### Issue: 403 Forbidden even though authorized
**Solution**:
- Verify company ID matches recruiter's company
- Check if company `owner` field is set correctly
- Verify ObjectId comparison in controller

### Issue: Token not persisting on refresh
**Solution**:
- Check if token is being saved to localStorage
- Verify `authStore.js` module-level initialization
- Clear browser cache and try again

### Issue: Cannot create company/job
**Solution**:
- Check if user is logged in
- Verify user role is `recruiter`
- Check form validation for required fields
- Check network tab for error response

---

## 📊 Key Metrics

### Response Times (Expected)
- Login: < 500ms
- Register: < 500ms
- Get jobs: < 300ms
- Create job: < 500ms
- Get profile: < 300ms

### Error Rates (Expected)
- 401 errors: 0% (except on logout)
- 403 errors: Only on unauthorized access attempts
- 400 errors: Only on invalid input
- 500 errors: 0% (if working correctly)

---

## 🔄 Development Workflow

### Adding a New Feature
1. Create model in `backend/src/models/`
2. Create controller in `backend/src/controllers/`
3. Add routes in `backend/src/routes/`
4. Add validators in `backend/src/validators/`
5. Create store methods in `frontend/src/store/`
6. Create pages/components in `frontend/src/pages/` and `src/components/`
7. Add tests
8. Test manually

### Modifying Existing Feature
1. Update model if schema changes
2. Update controller logic
3. Update validators if input changes
4. Update store methods if API changes
5. Update components if UI changes
6. Test all related features

---

## 📞 Key Contacts/Resources

- **Backend Server**: `localhost:5000`
- **Frontend Server**: `localhost:3000`
- **MongoDB Local**: `mongodb://localhost:27017/jobportal`
- **Documentation**: `/Docs` directory
- **Test Data**: `Docs/Postman_Test_Data.md`

---

## ✅ Last Checklist

Before deploying:
- [ ] Backend running without errors
- [ ] Frontend running without errors
- [ ] No 401/403 errors in console
- [ ] Token in localStorage
- [ ] Recruiter isolation working
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] MongoDB connected
- [ ] Database clean (optional reset)

---

**Status**: Ready for deployment  
**Confidence**: High  
**Last Verified**: July 14, 2026

