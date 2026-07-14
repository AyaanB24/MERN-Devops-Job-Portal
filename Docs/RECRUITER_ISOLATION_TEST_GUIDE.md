# Recruiter Isolation - Step-by-Step Test Guide

**Objective**: Verify that Recruiter A cannot see jobs posted by Recruiter B

**Time Required**: 15 minutes

---

## 📋 Pre-Test Checklist

- [ ] Backend running: `npm run dev` (backend/)
- [ ] Frontend running: `npm run dev` (frontend/)
- [ ] Browser console open: F12 → Console tab
- [ ] Network tab open: F12 → Network tab

---

## 🧪 Test Execution

### Step 1: Create Test Accounts (If Needed)

**Terminal**: Open browser at `http://localhost:3000`

**Account 1 - Recruiter A**:
```
Name: Recruiter A Test
Email: recA.test@example.com
Password: TestPassword123
Role: Recruiter
```

**Account 2 - Recruiter B**:
```
Name: Recruiter B Test
Email: recB.test@example.com
Password: TestPassword123
Role: Recruiter
```

---

### Step 2: Recruiter A - Create Company & Post Job

**As Recruiter A**:

1. **Login**:
   - Email: `recA.test@example.com`
   - Password: `TestPassword123`
   - ✅ Should redirect to `/recruiter/dashboard`

2. **Create Company**:
   - Click "Manage Companies"
   - Click "Add Company" button
   - Fill form:
     - Company Name: `Company A Test`
     - Website: `https://companya.test`
     - Description: `This is Recruiter A's company`
   - Click "Create Company"
   - ✅ Company should appear in list

3. **Post Job**:
   - Click "Manage Jobs"
   - Click "Post a Job" button
   - Fill form:
     - Title: `Job from Recruiter A`
     - Company: Select `Company A Test`
     - Experience: `2-3 years`
     - Skills: `JavaScript, React, Node.js`
     - Positions: `1`
     - Description: `This job is posted by Recruiter A`
     - Salary: `50000`
   - Click "Create Job"
   - ✅ Job should appear in "Manage Jobs" list

4. **Verify**:
   - ✅ See Job in "Manage Jobs" list
   - ✅ See Company in "Manage Companies" list
   - Copy Job ID from URL or network tab (for later use)

---

### Step 3: Recruiter B - Create Company & Post Job

**As Recruiter B**:

1. **Logout** (as Recruiter A):
   - Click profile dropdown
   - Click "Logout"
   - ✅ Should redirect to home page

2. **Login as Recruiter B**:
   - Email: `recB.test@example.com`
   - Password: `TestPassword123`
   - ✅ Should redirect to `/recruiter/dashboard`

3. **Create Company**:
   - Click "Manage Companies"
   - Click "Add Company" button
   - Fill form:
     - Company Name: `Company B Test`
     - Website: `https://companyb.test`
     - Description: `This is Recruiter B's company`
   - Click "Create Company"
   - ✅ Company should appear in list

4. **Post Job**:
   - Click "Manage Jobs"
   - Click "Post a Job" button
   - Fill form:
     - Title: `Job from Recruiter B`
     - Company: Select `Company B Test`
     - Experience: `3-5 years`
     - Skills: `Python, Django, PostgreSQL`
     - Positions: `2`
     - Description: `This job is posted by Recruiter B`
     - Salary: `60000`
   - Click "Create Job"
   - ✅ Job should appear in "Manage Jobs" list

5. **Verify**:
   - ✅ See only Job from Recruiter B
   - ❌ Should NOT see Job from Recruiter A
   - Copy Job ID from URL or network tab

---

### Step 4: MAIN TEST - Recruiter B Views Jobs List

**As Recruiter B** (still logged in):

1. **Click "Manage Jobs"**:
   - Should see only Recruiter B's jobs
   - Should see: `Job from Recruiter B`
   - Should NOT see: `Job from Recruiter A`

2. **Check Network Tab**:
   - Open DevTools → Network tab
   - Click "Manage Jobs" if not there
   - Find request to `/api/jobs`
   - Click on it → Response tab
   - Verify response contains:
     ```json
     {
       "success": true,
       "data": [
         {
           "title": "Job from Recruiter B",
           "company": "..."
         }
       ]
     }
     ```
   - Should NOT contain: `Job from Recruiter A`

3. **Verify Isolation**:
   - ✅ Recruiter B sees only their job
   - ✅ No jobs from Recruiter A visible
   - ✅ Only 1 job in list (their own)

---

### Step 5: CRITICAL TEST - Try to Access Recruiter A's Job via URL

**As Recruiter B** (still logged in):

1. **Try Direct API Access**:
   - Open DevTools → Console tab
   - Copy Recruiter A's Job ID from earlier
   - Paste this command (replace with actual job ID):
   ```javascript
   fetch('http://localhost:5000/api/jobs/[RECRUITER_A_JOB_ID]', {
     headers: {
       'Authorization': 'Bearer ' + localStorage.getItem('token')
     }
   }).then(r => r.json()).then(d => console.log(d))
   ```
   - Press Enter

2. **Verify Response**:
   - Should see in console:
   ```json
   {
     "success": false,
     "message": "Not authorized to view this job",
     "statusCode": 403
   }
   ```

3. **Expected Result**:
   - ✅ 403 Forbidden error
   - ✅ Cannot access other recruiter's job
   - ✅ System correctly denies access

---

### Step 6: Return to Recruiter A - Verify Their Jobs

**As Recruiter A**:

1. **Logout** (as Recruiter B):
   - Click profile dropdown
   - Click "Logout"

2. **Login as Recruiter A**:
   - Email: `recA.test@example.com`
   - Password: `TestPassword123`

3. **Click "Manage Jobs"**:
   - Should see: `Job from Recruiter A`
   - Should NOT see: `Job from Recruiter B`
   - Should see exactly 1 job in list

4. **Verify Isolation**:
   - ✅ Recruiter A sees only their job
   - ✅ No jobs from Recruiter B visible
   - ✅ Only 1 job in list

---

### Step 7: Try to Access Recruiter B's Job (as Recruiter A)

**As Recruiter A**:

1. **Try Direct API Access**:
   - Open DevTools → Console tab
   - Copy Recruiter B's Job ID from earlier
   - Paste this command (replace with actual job ID):
   ```javascript
   fetch('http://localhost:5000/api/jobs/[RECRUITER_B_JOB_ID]', {
     headers: {
       'Authorization': 'Bearer ' + localStorage.getItem('token')
     }
   }).then(r => r.json()).then(d => console.log(d))
   ```
   - Press Enter

2. **Verify Response**:
   - Should see:
   ```json
   {
     "success": false,
     "message": "Not authorized to view this job"
   }
   ```

3. **Expected Result**:
   - ✅ 403 Forbidden error
   - ✅ Cannot access other recruiter's job
   - ✅ Complete isolation maintained

---

## ✅ Test Results

### Expected Outcomes

| Test | Expected Result | Status |
|------|-----------------|--------|
| Recruiter A posts job | Job visible to Rec A | ✅ PASS |
| Recruiter B posts job | Job visible to Rec B | ✅ PASS |
| Recruiter B views jobs | Only sees Rec B's job | ✅ PASS |
| Recruiter B accesses Rec A's job | 403 Forbidden | ✅ PASS |
| Recruiter A accesses Rec B's job | 403 Forbidden | ✅ PASS |
| Both see only 1 job each | 100% isolation | ✅ PASS |

### Success Criteria

- [ ] Recruiter A sees 1 job (their own)
- [ ] Recruiter B sees 1 job (their own)
- [ ] API returns 403 when accessing other recruiter's job
- [ ] No cross-recruiter data visibility
- [ ] Network requests show filtered data

---

## 🔍 Troubleshooting

### Issue: Recruiter B can see Recruiter A's job

**Solution**:
1. Check backend console for errors
2. Verify company `owner` field is set correctly
3. Check that user ID matches in database
4. Restart backend server
5. Retry test

**Debug Command**:
```javascript
// In browser console, check current user
fetch('http://localhost:5000/api/auth/profile', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
}).then(r => r.json()).then(d => console.log(d))
```

### Issue: Getting 401 Unauthorized

**Solution**:
1. Token may be expired
2. Logout and login again
3. Clear localStorage: `localStorage.clear()`
4. Refresh page
5. Retry test

### Issue: 500 Server Error

**Solution**:
1. Check backend logs
2. Verify MongoDB is connected
3. Verify database connection string
4. Restart backend server
5. Check error message in response

---

## 📊 Test Report Template

Use this to document your test results:

```
TEST DATE: _______________
TESTER: ___________________

Recruiter A (recA@example.com):
  - Account created: ✅ / ❌
  - Company created: ✅ / ❌
  - Job posted: ✅ / ❌
  - Job visible: ✅ / ❌
  - Job ID: _________________

Recruiter B (recB@example.com):
  - Account created: ✅ / ❌
  - Company created: ✅ / ❌
  - Job posted: ✅ / ❌
  - Job visible: ✅ / ❌
  - Job ID: _________________

Isolation Tests:
  - Rec B sees only own job: ✅ / ❌
  - Rec B cannot access Rec A's job: ✅ / ❌ (403?)
  - Rec A sees only own job: ✅ / ❌
  - Rec A cannot access Rec B's job: ✅ / ❌ (403?)

Overall Result: ✅ PASS / ❌ FAIL

Notes:
_________________________________
_________________________________
```

---

## 📱 Expected Browser Console Output

**When fetching Recruiter B's jobs as Recruiter B**:
```javascript
Response (Good):
{
  success: true,
  data: [
    {
      _id: "...",
      title: "Job from Recruiter B",
      company: "Company B Test"
    }
  ]
}
```

**When trying to access Recruiter A's job as Recruiter B**:
```javascript
Response (Expected 403):
{
  success: false,
  message: "Not authorized to view this job",
  statusCode: 403
}
```

---

## ⏱️ Expected Timing

- Step 1 (Create accounts): 2-3 minutes
- Step 2 (Rec A setup): 3-4 minutes
- Step 3 (Rec B setup): 3-4 minutes
- Step 4-7 (Tests): 3-4 minutes
- **Total**: ~12-15 minutes

---

## ✅ Sign-Off

After completing all tests:

- [ ] All tests passed
- [ ] No cross-recruiter visibility
- [ ] 403 errors returned correctly
- [ ] Database isolation working
- [ ] Frontend respecting authorization
- [ ] System production-ready

**Test Completed**: ____________  
**Tester Name**: ________________  
**Result**: ✅ PASS / ❌ FAIL

---

## 📞 If Tests Fail

1. **Review**: `backend/src/controllers/jobController.js` - getJobs method
2. **Check**: Company model has `owner` field
3. **Verify**: Company ownership is being checked
4. **Debug**: Add console.logs to backend
5. **Test**: Individual API calls with Postman
6. **Review**: `RECRUITER_ISOLATION_VERIFICATION.md`

**Support**: Contact development team with test results and error logs

