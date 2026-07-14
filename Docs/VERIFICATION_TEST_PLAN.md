# Verification Test Plan - Task 4 Complete

**Date**: July 14, 2026  
**Status**: All critical fixes implemented  
**Session**: Context transfer verification

## 📋 System Status Check

### ✅ Backend Services
- Port 5000: LISTENING (backend API)
- MongoDB: Connected
- Auth routes: Configured with validation
- Job routes: Configured with authorization
- Application routes: Configured with authorization

### ✅ Frontend Services
- Port 3000: LISTENING (React dev server)
- Store files: All created (`authStore.js` added)
- Token initialization: Module-level (not wrapped in IIFE)
- Axios defaults: Set on app startup

---

## 🧪 Test Scenarios

### Test 1: User Registration & Token Initialization
**Objective**: Verify registration returns token and initializes axios headers

**Steps**:
1. Navigate to `http://localhost:3000/register`
2. Click "Job Seeker" role
3. Fill form:
   - Name: `Test Candidate 001`
   - Email: `test.candidate.001@example.com`
   - Password: `TestPassword123`
   - Confirm: `TestPassword123`
4. Click "Create Account"

**Expected Results**:
- ✓ Registration succeeds
- ✓ Token appears in localStorage
- ✓ Axios Authorization header is set
- ✓ Redirects to `/candidate/dashboard`
- ✓ Console shows: `✓ Redirecting to candidate dashboard`

**Browser Console Check**:
```
✓ Token initialized at module level
✓ Axios Authorization header set: Bearer <token>
✓ Redirecting to candidate dashboard
```

---

### Test 2: Recruiter Registration & Role-Based Redirect
**Objective**: Verify recruiter signup redirects to recruiter dashboard

**Steps**:
1. Navigate to `http://localhost:3000/register`
2. Click "Recruiter" role
3. Fill form:
   - Name: `Test Recruiter 001`
   - Email: `test.recruiter.001@example.com`
   - Password: `TestPassword123`
   - Confirm: `TestPassword123`
4. Click "Create Account"

**Expected Results**:
- ✓ Registration succeeds
- ✓ Token stored in localStorage
- ✓ Redirects to `/recruiter/dashboard`
- ✓ Console shows: `✓ Redirecting to recruiter dashboard`

---

### Test 3: Recruiter Isolation - Job Creation
**Objective**: Verify only company owners can create jobs

**Setup**: Create 2 recruiter accounts (Rec1, Rec2)

**Test Rec1**:
1. Login as `test.recruiter.001@example.com`
2. Go to "Manage Companies"
3. Create company:
   - Name: `Test Company 001`
   - Website: `https://testcompany001.com`
   - Description: `Test company for recruiter 1`
4. Go to "Manage Jobs"
5. Post job:
   - Title: `Senior Developer`
   - Company: `Test Company 001`
   - Experience: `2-3 years`
   - Skills: `JavaScript, React, Node.js`
   - Position: `2`

**Expected Results**:
- ✓ Job created successfully
- ✓ Job visible in recruiter's job list
- ✓ Job belongs to Test Company 001

**Test Rec2**:
1. Logout
2. Login as `test.recruiter.002@example.com` (create if needed)
3. Go to "Manage Jobs"

**Expected Results**:
- ✓ Rec2's job list is EMPTY (cannot see Rec1's jobs)
- ✓ Rec2 can only see jobs from companies they own
- ✓ No cross-recruiter visibility

---

### Test 4: Job Access Control
**Objective**: Verify recruiters cannot view/edit jobs from other companies

**Setup**: From Test 3, we have Rec1's job

**Test Rec2 Access**:
1. As Rec2, try direct API call:
   ```
   GET /api/jobs/[rec1-job-id]
   ```
2. Expected response:
   ```json
   {
     "success": false,
     "message": "Not authorized to view this job"
   }
   Status: 403
   ```

**Test Rec2 Update**:
1. As Rec2, try:
   ```
   PUT /api/jobs/[rec1-job-id]
   { "title": "Hacked Title" }
   ```
2. Expected response:
   ```json
   {
     "success": false,
     "message": "Not authorized to update this job"
   }
   Status: 403
   ```

---

### Test 5: Application Isolation
**Objective**: Verify recruiters only see applications for their own jobs

**Setup**:
- Rec1 has job posting
- Candidate applies to Rec1's job

**Test Rec1 View**:
1. Login as Rec1
2. Navigate to job applications
3. Click on job to view applications

**Expected Results**:
- ✓ Rec1 can see candidate's application
- ✓ Can update application status
- ✓ See all applications for their jobs

**Test Rec2 Access**:
1. As Rec2, try API call:
   ```
   GET /api/applications?job=[rec1-job-id]
   ```
2. Expected response:
   ```json
   {
     "success": false,
     "message": "Not authorized to view applications for this job"
   }
   Status: 403
   ```

---

### Test 6: Candidate Experience - Normal Flow
**Objective**: Verify candidates can browse and apply to all jobs

**Steps**:
1. Navigate to `http://localhost:3000/jobs`

**Expected Results**:
- ✓ See all jobs from all recruiters
- ✓ Can click on job to view details
- ✓ Can apply to jobs

**Test Application**:
1. Click "Apply" on a job
2. Add cover letter
3. Click "Submit Application"

**Expected Results**:
- ✓ Application submitted successfully
- ✓ Redirected to candidate dashboard
- ✓ Application appears in "My Applications"

---

### Test 7: Login & Token Persistence
**Objective**: Verify token persists and works on page refresh

**Steps**:
1. Login as any user
2. Press F5 to refresh page

**Expected Results**:
- ✓ User stays logged in (not redirected to /login)
- ✓ Token loads from localStorage
- ✓ Profile loads automatically
- ✓ Dashboard renders with user data

---

### Test 8: Authorization Headers
**Objective**: Verify all API calls include Authorization header

**Browser DevTools - Network Tab**:
1. Login
2. Open DevTools → Network tab
3. Make API calls (get jobs, post job, etc.)
4. Click on request → Headers tab

**Expected Results**:
- ✓ Every request has: `Authorization: Bearer <token>`
- ✓ No 401 Unauthorized errors
- ✓ No failed requests due to missing token

---

## 📊 Test Results Summary

| Test # | Scenario | Status | Notes |
|--------|----------|--------|-------|
| 1 | Candidate Registration | ⏳ Pending | Check token & redirect |
| 2 | Recruiter Registration | ⏳ Pending | Check token & redirect |
| 3 | Recruiter Isolation | ⏳ Pending | Cross-recruiter visibility |
| 4 | Job Access Control | ⏳ Pending | 403 for unauthorized access |
| 5 | Application Isolation | ⏳ Pending | Recruiter/candidate views |
| 6 | Candidate Browse & Apply | ⏳ Pending | Job listing & applications |
| 7 | Login & Persistence | ⏳ Pending | Token on refresh |
| 8 | Authorization Headers | ⏳ Pending | All requests have token |

---

## 🔐 Security Checklist

- [ ] No 401 Unauthorized errors
- [ ] Recruiters cannot see other recruiters' jobs
- [ ] Recruiters cannot access other companies' applications
- [ ] Candidates can see all jobs (no isolation)
- [ ] Token persists across page refreshes
- [ ] Token removed on logout
- [ ] All API requests include Authorization header
- [ ] IDOR vulnerabilities fixed (company ownership checks)
- [ ] 403 Forbidden for unauthorized access attempts

---

## 📝 Files Modified in This Session

1. **`frontend/src/store/authStore.js`** (CREATED)
   - Token initialized at module level
   - Axios headers set on startup
   - Full auth flow implementation

2. **`backend/src/controllers/jobController.js`** (PREVIOUSLY MODIFIED)
   - Company ownership verification
   - Recruiter job isolation

3. **`backend/src/controllers/applicationController.js`** (PREVIOUSLY MODIFIED)
   - Application isolation for recruiters
   - Company ownership checks

---

## 🚀 Deployment Steps

1. Restart backend: `npm run dev` (in backend directory)
2. Restart frontend: `npm run dev` (in frontend directory)
3. Clear browser cache: Ctrl+Shift+Delete
4. Clear localStorage: Run `localStorage.clear()` in console
5. Visit `http://localhost:3000`

---

## 📞 Support

If any test fails:

1. Check browser console for errors
2. Check backend logs for 401/403 errors
3. Verify token is in localStorage
4. Verify MongoDB is connected
5. Check API responses in Network tab
6. Review error messages from API

---

## ✅ Sign-Off

- Task 4 (Recruiter Isolation): **COMPLETE**
- authStore.js: **CREATED**
- All authorization checks: **IMPLEMENTED**
- Ready for testing: **YES**

**Timestamp**: July 14, 2026
**Status**: Ready for QA

