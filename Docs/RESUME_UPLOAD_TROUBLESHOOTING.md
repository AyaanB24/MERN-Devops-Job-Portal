# Resume Upload Troubleshooting Guide

**Issue**: Resume not visible after upload  
**Status**: Investigating

---

## ✅ What's Implemented

### Backend
- ✅ File upload endpoint: `POST /api/auth/profile/resume`
- ✅ Multer middleware for file handling
- ✅ Resume path saved to `user.resume` field
- ✅ Static file serving for `/uploads` directory
- ✅ getCandidateProfile includes resume field

### Frontend
- ✅ Resume upload form in ProfilePage
- ✅ ResumeViewer component for displaying resume
- ✅ Resume preview on ProfilePage
- ✅ Resume visible on CandidateProfilePage (recruiter view)
- ✅ Auto-refresh after upload via `getProfile()`

---

## 🔍 Debugging Checklist

### Step 1: Check Browser Console
After uploading resume, open DevTools (F12) and check Console tab:

```
✓ Should see: "Resume upload response: { success: true, data: { filename: '...', path: '/uploads/resumes/...', user: { ..., resume: '/uploads/resumes/...' } } }"
✗ Should NOT see: errors or 4xx/5xx responses
```

### Step 2: Check Network Tab
After uploading resume:
1. Open DevTools → Network tab
2. Upload a file
3. Look for request to `POST /api/auth/profile/resume`
4. Status should be **200 OK**
5. Response should include updated user with `resume` field

### Step 3: Verify Database
Check if resume is saved in MongoDB:

```bash
# Connect to MongoDB
mongosh

# Use jobportal database
use jobportal

# Check user's resume field
db.users.findOne({ _id: ObjectId("your_user_id") })

# Should see: "resume": "/uploads/resumes/filename.pdf"
```

### Step 4: Check File System
Resume files should be in:
```
backend/uploads/resumes/filename.pdf
```

### Step 5: Test Static File Serving
In browser, try accessing resume directly:
```
http://localhost:5000/uploads/resumes/filename.pdf
```

Should download the file, not 404 error.

---

## 🚀 Step-by-Step Upload Process

### Frontend Flow
```
1. User selects file in ProfilePage
2. File stored in state: setResumeFile(file)
3. User clicks "Upload" button
4. handleResumeUpload() called
5. uploadResume(resumeFile) called from authStore
   ↓
6. POST /api/auth/profile/resume with FormData
7. Response received with updated user
8. Zustand store updated: set({ user: updatedUser })
9. getProfile() called to fetch fresh data
10. ResumeViewer renders with user.resume path
```

### Backend Flow
```
1. POST /api/auth/profile/resume received
2. authMiddleware.protect() validates token
3. uploadMiddleware (Multer) processes file
   - Saves to: backend/uploads/resumes/filename.pdf
   - Creates unique filename with timestamp
4. authController.uploadResumeFile()
   - Constructs path: /uploads/resumes/filename.pdf
   - Updates user: User.findByIdAndUpdate(..., { resume: path })
   - Returns updated user
5. Response with success + user data sent to frontend
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "Resume uploaded successfully" but not visible

**Possible Causes**:
1. Page not refreshed after upload
2. Zustand store not updated
3. getProfile() not called

**Fix**:
```javascript
// ProfilePage.jsx - already has this:
await uploadResume(resumeFile)
await getProfile()  // ← This is critical
alert('Resume uploaded successfully!')
```

### Issue 2: 404 when trying to view resume

**Possible Causes**:
1. Static file serving not configured
2. Resume file not saved to disk
3. Path mismatch (relative vs absolute)

**Check**:
```bash
# In backend directory
ls -la uploads/resumes/
# Should see uploaded files
```

### Issue 3: No resume showing in recruiter view

**Possible Causes**:
1. Resume field not included in getCandidateProfile
2. Candidate profile not loaded properly
3. ResumeViewer not rendering

**Fix**:
```javascript
// backend/src/controllers/authController.js
const candidate = await User.findById(candidateId).select('-password');
// ↑ This returns ALL fields including resume
```

### Issue 4: Resume upload shows error

**Possible Causes**:
1. File type not allowed
2. File size too large
3. Multer configuration issue

**Check Console**:
```
Should see error message like:
"Invalid file type. Only PDF, DOC, DOCX allowed!"
"File size exceeds maximum limit of 5MB"
```

---

## 📋 Manual Testing Steps

### Test 1: Upload Resume
```
1. Go to /profile
2. Click "Upload Resume"
3. Select PDF/DOC/DOCX file
4. Click "Upload" button
5. Success message appears
6. Open DevTools → Console
7. Check for logs confirming upload
```

### Test 2: See Resume on Own Profile
```
1. Go to /profile
2. Scroll to "Your Resume" section
3. Should show ResumeViewer with:
   - Candidate name
   - PDF preview
   - Download button
   - Fullscreen button
```

### Test 3: See Resume on Recruiter View
```
1. As recruiter, go to /recruiter/manage-jobs
2. Click on a job
3. Click "View Applications"
4. Click "View Profile" on a candidate
5. Should see "Resume" section
6. ResumeViewer should show resume
```

### Test 4: Resume Persists After Refresh
```
1. Upload resume
2. See it on profile
3. Refresh page (F5)
4. Resume should still be visible
5. Check localStorage has token
```

---

## 🔐 Security Checks

✅ **File Type Validation**:
- Only PDF, DOC, DOCX allowed
- Checked by Multer fileFilter

✅ **File Size Limit**:
- Maximum 5MB
- Enforced by Multer limits

✅ **Path Sanitization**:
- Multer creates random filenames
- Prevents directory traversal attacks

✅ **Access Control**:
- Only authenticated users can upload
- Protected by authMiddleware

---

## 📊 Data Model

### User.resume Field
```javascript
resume: {
  type: String,
  default: ''  // Empty string if no resume
}
// Example value: "/uploads/resumes/filename-timestamp-random.pdf"
```

### Upload Response
```javascript
{
  success: true,
  message: "Resume uploaded successfully",
  data: {
    filename: "resume-1721234567-123456.pdf",
    path: "/uploads/resumes/resume-1721234567-123456.pdf",
    size: 245678,
    user: {
      _id: "...",
      name: "...",
      email: "...",
      resume: "/uploads/resumes/resume-1721234567-123456.pdf",
      // ... other fields
    }
  }
}
```

---

## 🧪 Testing Checklist

- [ ] Upload resume successfully
- [ ] See resume on own profile
- [ ] Refresh profile page - resume still visible
- [ ] Recruiter can view candidate resume
- [ ] Resume download button works
- [ ] Resume fullscreen mode works
- [ ] Multiple resume uploads work (replaces old one)
- [ ] Wrong file type rejected with error
- [ ] File too large rejected with error
- [ ] Resume field in database populated correctly
- [ ] Static file serving working

---

## 📞 Debug Commands

### Check Multer Configuration
```bash
# backend/src/middleware/uploadMiddleware.js
# Should show:
# - dest: './uploads/resumes'
# - limits: { fileSize: 5MB }
# - fileFilter for PDF, DOC, DOCX
```

### Verify Backend File Save
```bash
cd backend
ls -la uploads/resumes/
# Should show uploaded files with names like:
# resume-1721234567-123456.pdf
```

### Monitor Upload Endpoint
```bash
# Terminal 1: Start backend with logging
npm start

# Terminal 2: Upload file
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "resume=@/path/to/file.pdf" \
  http://localhost:5000/api/auth/profile/resume
```

---

## 🔗 Related Files

**Frontend**:
- `frontend/src/pages/ProfilePage.jsx` - Resume upload form
- `frontend/src/components/ResumeViewer.jsx` - Resume display
- `frontend/src/pages/CandidateProfilePage.jsx` - Recruiter view
- `frontend/src/store/authStore.js` - Upload action

**Backend**:
- `backend/src/controllers/authController.js` - uploadResumeFile()
- `backend/src/routes/authRoutes.js` - POST /profile/resume route
- `backend/src/middleware/uploadMiddleware.js` - Multer config
- `backend/src/app.js` - Static file serving

**Database**:
- `backend/src/models/User.js` - resume field

---

## ✨ Quick Checklist

Before debugging, ensure:
1. ✅ Backend running on port 5000
2. ✅ Frontend running on port 3001
3. ✅ MongoDB connected
4. ✅ User authenticated (has JWT token)
5. ✅ `uploads/resumes/` directory exists
6. ✅ File is PDF/DOC/DOCX and < 5MB

If all above are true but resume still not showing:
1. Check browser console for errors
2. Check network tab for API response
3. Check MongoDB for resume field value
4. Check if file exists on disk

---

**Last Updated**: July 17, 2026  
**Status**: Guide Complete
