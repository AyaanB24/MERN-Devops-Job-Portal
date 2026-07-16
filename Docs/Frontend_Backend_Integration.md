# Frontend-Backend Integration Architecture

**Date**: July 15, 2026  
**Document Type**: Technical Deep-Dive (Interview-Ready)  
**Level**: Intermediate to Senior Developer

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Communication Protocol](#communication-protocol)
4. [Authentication Flow](#authentication-flow)
5. [State Management](#state-management)
6. [API Integration Pattern](#api-integration-pattern)
7. [Key Changes Made](#key-changes-made)
8. [Data Flow Examples](#data-flow-examples)
9. [Error Handling](#error-handling)
10. [Security Implementation](#security-implementation)

---

## System Overview

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            React Components (JSX)                    │  │
│  │  - ProfilePage, JobDetailPage, ApplicationDetail    │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Zustand State Store (authStore)             │  │
│  │  - user, token, isLoading, error state              │  │
│  │  - login, register, logout, getProfile, updateProfile
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Axios HTTP Client                           │  │
│  │  - Request/Response interceptor                      │  │
│  │  - Bearer token attachment                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                    HTTP/HTTPS (JSON)
                           │
┌─────────────────────────────────────────────────────────────┐
│                Backend (Node.js + Express)                   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Express API Routes                          │  │
│  │  - /api/auth, /api/jobs, /api/applications          │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    Middleware Pipeline                              │  │
│  │  - CORS, JSON parsing, Auth, Validation             │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    Route Handlers / Controllers                      │  │
│  │  - authController, jobController, applicationController
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    Service Layer                                    │  │
│  │  - authService, userService                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    Database Layer (MongoDB)                         │  │
│  │  - Models: User, Job, Application, Company          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: React 18.x with Vite (module bundler)
- **State Management**: Zustand (lightweight alternative to Redux)
- **HTTP Client**: Axios (promise-based HTTP client)
- **Styling**: TailwindCSS (utility-first CSS)
- **Icons**: Lucide-react (SVG icon library)
- **Routing**: React Router v6 (client-side routing)

### Backend
- **Runtime**: Node.js 22.x
- **Framework**: Express.js 5.2.1
- **Database**: MongoDB (NoSQL document database)
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer (middleware for handling file uploads)
- **Password Hashing**: bcryptjs (secure password encryption)
- **Validation**: express-validator (input validation middleware)

### Communication
- **Protocol**: HTTP/HTTPS (REST API)
- **Data Format**: JSON (Request/Response bodies)
- **Port Mapping**: Frontend:5173 → Backend:5000 → MongoDB:27017

---

## Communication Protocol

### REST API Design

**Base URL**: `http://localhost:5000/api`

**Endpoints Structure**:
```
/api/{resource}/{action}

Examples:
- POST   /api/auth/register         (Create user account)
- POST   /api/auth/login            (Authenticate user)
- GET    /api/auth/profile          (Get current user)
- PUT    /api/auth/profile          (Update user profile)
- POST   /api/auth/profile/resume   (Upload resume file)
- POST   /api/jobs                  (Create job posting)
- GET    /api/jobs                  (List jobs)
- PUT    /api/jobs/:jobId           (Update job)
- DELETE /api/jobs/:jobId           (Delete job)
```

### Request/Response Format

**Standard Response Format**:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "user": {...},
    "token": "eyJhbGc..."
  }
}
```

**Error Response Format**:
```json
{
  "success": false,
  "message": "Error description",
  "error": "VALIDATION_ERROR",
  "statusCode": 400
}
```

---

## Authentication Flow

### User Registration Flow

```
FRONTEND (React Component)
    ↓
1. User fills registration form
   - name, email, password, role
    ↓
2. onClick → authStore.register(userData)
    ↓
3. Axios POST /api/auth/register
   Headers: { 'Content-Type': 'application/json' }
   Body: { name, email, password, role }

BACKEND (Express Route)
    ↓
4. POST /api/auth/register → authController.register()
    ↓
5. Middleware chain:
   - express.json() parses JSON body
   - validateRegister() validates input
    ↓
6. authService.registerUser()
   - Check if email exists
   - Hash password with bcryptjs
   - Save user to MongoDB
    ↓
7. Generate JWT token
   - jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '1d' })
    ↓
8. Return response
   {
     success: true,
     data: {
       user: { _id, name, email, role, createdAt... },
       token: "eyJhbGc..."
     }
   }

FRONTEND (React → Zustand Store)
    ↓
9. authStore receives response
   - set({ token, user, isLoading: false })
    ↓
10. localStorage.setItem('token', token)
    ↓
11. axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    ↓
12. Redirect to dashboard based on role
```

### User Login Flow

```
FRONTEND
    ↓
User enters email & password
    ↓
authStore.login(email, password)
    ↓
POST /api/auth/login
  { email, password }

BACKEND
    ↓
authController.login()
    ↓
authService.loginUser(email, password)
    ↓
1. Find user by email
2. Compare password with bcrypt
3. If match: Generate JWT token
    ↓
Return: { user, token }

FRONTEND
    ↓
1. Store token in localStorage
2. Set axios default header: Authorization: Bearer ${token}
3. Update Zustand state: { token, user }
4. Redirect to dashboard
```

### Protected Route Access

```
FRONTEND
User tries to access /profile

React Router checks:
  → useAuthStore().isAuthenticated()
  → If true: Render page
  → If false: Redirect to /login

BACKEND
Every protected route uses authMiddleware:

POST /api/auth/profile (PROTECTED)
    ↓
1. Middleware: protect(req, res, next)
   ↓
2. Check for Authorization header
   - Extract token from "Bearer {token}"
   - Verify token with JWT.verify()
   - Decode user ID from token payload
   - Query MongoDB for user
   ↓
3. If valid: req.user = user, call next()
   If invalid: Return 401 Unauthorized
```

---

## State Management

### Zustand Store Architecture

**File**: `frontend/src/store/authStore.js`

```javascript
export const useAuthStore = create((set, get) => ({
  // STATE
  token: initialToken,           // JWT token from localStorage
  user: null,                    // Current user object
  isLoading: false,              // Loading state for UI
  error: null,                   // Error messages

  // ACTIONS
  login(email, password),        // User login
  register(userData),            // User registration
  logout(),                      // Clear state and localStorage
  getProfile(),                  // Fetch current user from backend
  updateProfile(updatedData),    // Save profile changes to backend
  uploadResume(file),            // Upload resume file
  
  // HELPERS
  isAuthenticated(),             // Check if user has valid token
  isRecruiter(),                 // Check if user role is recruiter
  isCandidate(),                 // Check if user role is candidate
}))
```

### State Flow Example: Profile Update

```
FRONTEND COMPONENT (ProfilePage.jsx)
    ↓
const { user, updateProfile, getProfile } = useAuthStore()
    ↓
handleSubmit():
  1. Collect form data (bio, skills, name)
  2. Call updateProfile({ bio, skills, name })

ZUSTAND STORE
    ↓
updateProfile(updatedData):
  1. set({ isLoading: true })
  2. axios.put('/api/auth/profile', updatedData)
     Headers: { Authorization: Bearer ${token} }
  3. Response: updated user object
  4. set({ user: updatedUser, isLoading: false })

BACKEND
    ↓
PUT /api/auth/profile
    ↓
authMiddleware.protect() validates token
    ↓
authController.updateProfile()
    ↓
userService.updateProfile(userId, updatePayload)
    ↓
User.findByIdAndUpdate(userId, updates, { new: true })
    ↓
Return updated user

FRONTEND
    ↓
3. Call getProfile() to refresh from backend
   (Ensures UI = database state)
  4. set({ user: freshUser })
  5. Show success alert
  6. User sees updated profile
```

---

## API Integration Pattern

### Axios Configuration

**File**: `frontend/src/store/authStore.js`

```javascript
// 1. Module-level initialization (not in component)
const storedToken = localStorage.getItem('token')
const initialToken = storedToken && storedToken !== 'undefined' ? storedToken : null

// 2. Set axios default header on app startup
if (initialToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`
}

// 3. Every login/register updates the default
axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

// 4. Every request includes token automatically
```

### API Call Pattern

```javascript
// PATTERN 1: Simple GET
async getProfile() {
  const response = await axios.get(`${API_BASE}/auth/profile`)
  // Token attached automatically by axios
  return response.data.data
}

// PATTERN 2: POST with Data
async login(email, password) {
  const response = await axios.post(`${API_BASE}/auth/login`, {
    email,
    password
  })
  return response.data.data
}

// PATTERN 3: PUT with Auth
async updateProfile(updatedData) {
  const response = await axios.put(
    `${API_BASE}/auth/profile`,
    updatedData
    // Token in default headers
  )
  return response.data.data
}

// PATTERN 4: File Upload (FormData)
async uploadResume(file) {
  const formData = new FormData()
  formData.append('resume', file)
  
  const response = await axios.post(
    `${API_BASE}/auth/profile/resume`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
        // Authorization still from defaults
      }
    }
  )
  return response.data.data
}
```

---

## Key Changes Made

### Change 1: Profile Update Persistence

**Problem**: Profile updates were not saving to database  
**Root Cause**: Wrong MongoDB syntax - using `returnDocument: 'after'` instead of `new: true`

**Fix**:
```javascript
// BEFORE (Wrong)
const updatedUser = await User.findByIdAndUpdate(userId, updates, {
  returnDocument: 'after'  // ❌ Wrong syntax
})

// AFTER (Correct)
const updatedUser = await User.findByIdAndUpdate(userId, updates, {
  new: true  // ✅ Correct MongoDB syntax
})
```

**File**: `backend/src/services/userService.js`

### Change 2: Resume Upload to Database

**Problem**: Resume file was uploaded but path not saved to database  
**Solution**: Created dedicated controller to save resume path

**Implementation**:
```javascript
// backend/src/controllers/authController.js
const uploadResumeFile = async (req, res, next) => {
  // File uploaded by Multer middleware
  const resumePath = `/uploads/resumes/${req.file.filename}`
  
  // Save path to user.resume field
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { $set: { resume: resumePath } },
    { new: true }
  ).select('-password')
  
  return res.status(200).json({
    success: true,
    data: {
      filename: req.file.filename,
      path: resumePath,
      user: updatedUser  // ← Frontend can refresh from this
    }
  })
}
```

**File**: `backend/src/controllers/authController.js`

### Change 3: Frontend Refresh Logic

**Problem**: UI didn't reflect database changes after updates  
**Solution**: Added `getProfile()` calls after save operations

**Implementation**:
```javascript
// frontend/src/pages/ProfilePage.jsx
const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    // 1. Save to backend
    await updateProfile({
      name: formData.name,
      bio: formData.bio,
      skills: formData.skills
    })
    
    // 2. Refresh from backend (ensures UI = database)
    await getProfile()
    
    alert('Profile updated successfully!')
  } catch (error) {
    alert('Failed to update profile')
  }
}

const handleResumeUpload = async (e) => {
  e.preventDefault()
  try {
    // 1. Upload file
    await uploadResume(resumeFile)
    
    // 2. Refresh to get updated resume path
    await getProfile()
    
    alert('Resume uploaded successfully!')
  } catch (error) {
    alert('Failed to upload resume')
  }
}
```

### Change 4: File Upload Validation

**Problem**: Only PDF files accepted, but users want DOC/DOCX  
**Solution**: Enhanced Multer file filter

**Implementation**:
```javascript
// backend/src/middleware/uploadMiddleware.js
const fileFilter = (req, file, cb) => {
  const fileExt = path.extname(file.originalname).toLowerCase()
  
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
  
  const allowedExtensions = ['.pdf', '.doc', '.docx']
  
  if (allowedMimeTypes.includes(file.mimetype) && 
      allowedExtensions.includes(fileExt)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX allowed!'), false)
  }
}
```

---

## Data Flow Examples

### Example 1: Candidate Profile Update

```
STEP 1: Frontend Component Renders
─────────────────────────────────
ProfilePage.jsx loads
  → useAuthStore() → get current user
  → Display in form fields:
    - name: "John Doe"
    - bio: "Software developer"
    - skills: "React, Node.js"

STEP 2: User Edits & Submits
─────────────────────────────
User changes:
  - bio → "Senior full-stack developer"
  - skills → "React, Node.js, Python, AWS"

onClick "Update Profile" button
  → handleSubmit() fired

STEP 3: Frontend State Update
────────────────────────────
authStore.updateProfile({
  name: "John Doe",
  bio: "Senior full-stack developer",
  skills: ["React", "Node.js", "Python", "AWS"]
})

set({ isLoading: true })

STEP 4: HTTP Request Sent
─────────────────────────
PUT http://localhost:5000/api/auth/profile
Headers:
  Content-Type: application/json
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Body:
{
  "name": "John Doe",
  "bio": "Senior full-stack developer",
  "skills": ["React", "Node.js", "Python", "AWS"]
}

STEP 5: Backend Processing
──────────────────────────
Express Route: PUT /api/auth/profile
  ↓
Middleware chain:
  1. express.json() → Parse JSON body
  2. protect() → Verify JWT, extract user ID
  3. authController.updateProfile()
     ↓
  4. userService.updateProfile(userId, payload)
     ↓
  5. MongoDB:
     User.findByIdAndUpdate(userId,
       { $set: updatedFields },
       { new: true }  ← Returns modified document
     )
     ↓
  6. Database writes changes
  7. Returns updated user document

STEP 6: Response Sent to Frontend
─────────────────────────────────
HTTP 200 OK
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "6a5792ea5bca1f826f925fbf",
    "name": "John Doe",
    "bio": "Senior full-stack developer",
    "skills": ["React", "Node.js", "Python", "AWS"],
    "email": "john@example.com",
    "updatedAt": "2026-07-15T14:02:32.000Z"
  }
}

STEP 7: Frontend Receives Response
──────────────────────────────────
authStore receives data:
  set({ user: responseData, isLoading: false })
  
Zustand notifies all subscribed components

STEP 8: Frontend Refresh (New!)
───────────────────────────────
getProfile() → Fetch fresh user from backend
  ↓
GET /api/auth/profile
  ↓
Backend returns same data (confirms database state)
  ↓
set({ user: freshData })
  ↓
All components with useAuthStore() re-render

STEP 9: UI Updates
──────────────────
ProfilePage sees new state:
  - Form fields show updated values
  - "Profile updated successfully!" alert shown

STEP 10: User Refreshes Browser
────────────────────────────────
F5 refresh → React re-mounts
  ↓
useEffect in ProfilePage:
  → if (!user) getProfile()
  ↓
GET /api/auth/profile (token in localStorage)
  ↓
Backend returns same data from MongoDB
  ↓
User sees same profile data ✅ PERSISTENCE WORKS!
```

---

## Error Handling

### Backend Error Handling Pattern

```javascript
// File: backend/src/middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  
  // Format and send response
  res.status(statusCode).json({
    success: false,
    message: message,
    statusCode: statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

module.exports = { errorHandler }
```

### Frontend Error Handling Pattern

```javascript
// File: frontend/src/store/authStore.js

login: async (email, password) => {
  set({ isLoading: true, error: null })
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password
    })
    
    const { token, user } = response.data.data
    
    // Success handling
    localStorage.setItem('token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    set({ token, user, isLoading: false })
    
  } catch (error) {
    // Error handling
    const errorMsg = error.response?.data?.message || 'Login failed'
    set({ 
      error: errorMsg, 
      isLoading: false, 
      token: null, 
      user: null 
    })
    throw error
  }
}
```

### Component Error Display

```javascript
// File: frontend/src/pages/LoginPage.jsx

export default function LoginPage() {
  const { error, clearError } = useAuthStore()
  
  useEffect(() => {
    return () => clearError()
  }, [])
  
  return (
    <div>
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">
          {error}
        </div>
      )}
      {/* Form JSX */}
    </div>
  )
}
```

---

## Security Implementation

### 1. JWT Authentication

```
User sends token with every request:
┌──────────────────────────────────────────┐
│ Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
└──────────────────────────────────────────┘
                   ↓
Backend validates token:
  1. Extract token from header
  2. jwt.verify(token, JWT_SECRET)
  3. Decode payload: { id, role, iat, exp }
  4. Check expiration: exp > Date.now()
  5. Query user from database
  6. Attach to req.user
```

### 2. Password Security

```
Registration:
  user enters: "MyPassword@123"
      ↓
  bcryptjs.hash(password, 10)  ← 10 rounds of hashing
      ↓
  stored: $2b$10$encrypted_hash_string
  
Login:
  user enters: "MyPassword@123"
      ↓
  bcryptjs.compare(inputPassword, storedHash)
      ↓
  if match → return user
  if no match → throw 401 Unauthorized
```

### 3. CORS Configuration

```javascript
// backend/src/app.js
app.use(cors())  // Allows requests from frontend (localhost:5173)

// In production, configure:
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}))
```

### 4. File Upload Security

```javascript
// Multer Configuration
- File type validation (MIME type + extension)
- File size limit (5MB)
- Filename sanitization (prevent directory traversal)
- Unique filename with timestamp

Example:
  Input: malicious.pdf
  Output: malicious-1784124142851-590379449.pdf
```

### 5. Role-Based Access Control

```javascript
// Recruiter Isolation Example
GET /api/jobs?manageMode=true

Backend logic:
  if (manageMode && user.role === 'recruiter') {
    query: { company: user.company }  // Only their jobs
  } else {
    query: {}  // All jobs (public view)
  }
```

---

## Interview Talking Points

### Q: How does authentication work in your system?

**Answer**: We use JWT-based authentication. When a user logs in, the backend validates credentials, generates a JWT token containing user ID and role, and returns it. The frontend stores the token in localStorage and includes it in every subsequent request via the Authorization header. The backend middleware validates the token on protected routes.

### Q: How do you prevent data loss when updating user profiles?

**Answer**: After updating data in the database, we use MongoDB's `new: true` option to return the modified document. On the frontend, we call `getProfile()` after updates to fetch fresh data from the backend, ensuring the UI state always matches the database state. This dual approach prevents stale data in the UI.

### Q: How is the resume upload handled?

**Answer**: The resume upload uses Multer middleware on the backend. When a file is uploaded, Multer saves it to `/uploads/resumes` with a sanitized filename including a timestamp. The controller then saves the file path to the user's resume field in MongoDB with `new: true` to get the updated user object back. The frontend then refreshes the profile to display the updated resume link.

### Q: How do you ensure recruiter isolation?

**Answer**: We use a `manageMode` query parameter. When recruiters browse jobs, it's false (sees all jobs). When on their manage page, it's true, which filters jobs to only those matching their company ID. Access control is also enforced in the controller - recruiters get 403 Forbidden if trying to access others' jobs directly.

### Q: Describe the request-response cycle for a profile update.

**Answer**: [See "Example 1: Candidate Profile Update" in Data Flow Examples section above]

---

## Deployment Considerations

### Environment Variables

```
Frontend (.env):
VITE_API_BASE=https://api.yourdomain.com/api

Backend (.env):
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your_super_secret_key_here
NODE_ENV=production
PORT=5000
```

### CORS Configuration for Production

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
```

---

**Document Status**: ✅ Interview-Ready  
**Last Updated**: July 15, 2026  
**Complexity Level**: Intermediate-Advanced
