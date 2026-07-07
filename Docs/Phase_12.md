# Phase 12: Backend Hardening

## 🗺️ Roadmap

| Step | Feature | Status |
| :--- | :--- | :---: |
| 1 | Global Error Handler | ✅ Done |
| 2 | Async Error Wrapper | ✅ Done |
| 3 | Integrate Error Middleware | ✅ Done |
| | | |
| **12.5** | **Request Validation** | |
| 4 | Auth Validators | ✅ Done |
| 5 | Company Validators | ✅ Done |
| 6 | Job Validators | ✅ Done |
| 7 | Application Validators | 🔜 |
| 8 | Validation Middleware (DRY) | ✅ Done |

---

---

## ✅ Step 1 — Global Error Handler

**File:** `src/middleware/errorMiddleware.js`

### What & Why
Centralizes all error responses in one place. Without it every controller writes its own `res.status().json()` — inconsistent shapes, potential stack trace leaks, and duplicate code everywhere.

### What It Does

| Error | Status |
| :--- | :---: |
| Mongoose `ValidationError` | `400` |
| Mongoose `CastError` (bad ObjectId) | `400` |
| MongoDB Duplicate Key `E11000` | `409` |
| `JsonWebTokenError` / `TokenExpiredError` | `401` |
| Custom `err.statusCode` | varies |
| Unknown / unhandled | `500` |

Two exports: `notFound` (404 catcher) + `errorHandler` (main processor).

### Wire into `app.js`
Add **after all routes**, before `module.exports`:
```js
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
app.use(notFound);
app.use(errorHandler);
```

### Key Concepts
- **Express error flow:** calling `next(err)` skips all regular middleware and jumps to the 4-param handler `(err, req, res, next)`.
- **Local try-catch** catches → `next(err)` forwards → `errorHandler` responds. Controllers never touch `res` on error.
- **Stack trace** included in dev (`NODE_ENV !== 'production'`), hidden in prod.

### 🧪 Test (Postman)

**1 — Unknown Route → 404**
```
GET http://localhost:5000/api/doesnt-exist
```
```json
{ "success": false, "message": "Route not found: GET /api/doesnt-exist" }
```

**2 — Duplicate Email → 409**
Register the same email twice:
```
POST http://localhost:5000/api/auth/register
Body (JSON): { "name": "Alice", "email": "alice@test.com", "password": "Pass@123", "role": "candidate" }
```
Second call returns:
```json
{ "success": false, "message": "Duplicate value: 'alice@test.com' already exists for 'email'..." }
```

**3 — Validation Error → 400**
Send an empty body to register:
```
POST http://localhost:5000/api/auth/register
Body (JSON): {}
```
```json
{ "success": false, "message": "Validation failed...", "errors": [...] }
```

---

---

## ✅ Step 2 — Async Error Wrapper

**File:** `src/utils/asyncHandler.js`

### What & Why
Express does **not** catch errors thrown inside `async` functions. An unhandled rejected Promise either hangs the request forever or crashes the Node process (Node 15+). `asyncHandler` wraps every async controller so rejections are automatically forwarded to `errorHandler` via `next(err)` — no try-catch needed in any controller.

### How It Works

```js
// The entire implementation — one line
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

1. `asyncHandler(fn)` returns a new function Express registers as the route handler.
2. When the route fires, it calls `fn(req, res, next)` and wraps the result in `Promise.resolve()`.
3. If the promise rejects → `.catch(next)` calls `next(err)` → `errorHandler` takes over.

### Before vs After

```js
// ❌ Before — repetitive try-catch in every controller
const getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// ✅ After — clean, no boilerplate
const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  res.json({ success: true, data: job });
});
```

### Usage in Routes
```js
const asyncHandler = require('../utils/asyncHandler');

router.get('/:id', asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  res.json({ success: true, data: job });
}));
```

### 🧪 Test (Postman)

**Trigger a DB error with an invalid ObjectId → should get a clean 400, not a crash/hang**
```
GET http://localhost:5000/api/jobs/invalid-object-id
```
```json
{ "success": false, "message": "Invalid value for field '_id'. Expected a valid ObjectId." }
```
If the server stays alive and responds with the above, `asyncHandler` is correctly catching and forwarding the error.

---

---

## ✅ Step 3 — Integrate Error Middleware

**File modified:** `src/app.js`

### What Changed
Registered `notFound` and `errorHandler` at the **bottom of `app.js`**, after all route definitions.

```js
// src/app.js — final two lines before module.exports
app.use(notFound);      // 404 — catches any unmatched route
app.use(errorHandler);  // handles all errors forwarded via next(err)

module.exports = app;
```

### Why Middleware Order Matters

Express processes middleware in **registration order**, top to bottom. Error handlers registered before routes will never receive route errors.

```
✅ Correct order in app.js
────────────────────────────────────
 1. Core middleware   (json, cors)
 2. Routes            (/api/auth, /api/jobs …)
 3. notFound          ← only fires if NO route matched
 4. errorHandler      ← only fires when next(err) is called
────────────────────────────────────
```

```
❌ Common mistake — handler registered BEFORE routes
 app.use(errorHandler); // ← registered too early, never reached by route errors
 app.use('/api/jobs', jobRoutes);
```

### Production Mistakes to Avoid

| Mistake | Consequence |
| :--- | :--- |
| `errorHandler` before routes | Route errors bypass it entirely |
| Missing `notFound` | Unmatched routes return Express default HTML error page |
| Forgetting 4th param `next` in errorHandler | Express treats it as regular middleware, not error handler |
| Sending response before calling `next(err)` | Double-send crash (`Cannot set headers after they are sent`) |
| Exposing `err.stack` in production | Leaks internal paths and package names to attackers |

### 🧪 Test (Postman)

**Confirm the full error pipeline is live:**
```
GET http://localhost:5000/api/nonexistent-route
```
```json
{ "success": false, "message": "Route not found: GET /api/nonexistent-route" }
```
If you get this JSON (not an HTML Express error page), the middleware chain is wired correctly.

---

---

# Phase 12.5: Request Validation

## 📂 Folder Structure

```
backend/src/
└── validators/
    ├── authValidator.js          # register, login
    ├── companyValidator.js        # create, update company
    ├── jobValidator.js            # create, update job
    └── applicationValidator.js    # apply, update status
```

Each validator file exports **middleware functions** that validate `req.body` / `req.params` before the request ever reaches the controller.

---

## ❓ Why Validation Should NOT Live Inside Controllers

| Inside Controllers ❌ | Separate Validators ✅ |
| :--- | :--- |
| Controller does 2 jobs — validation + business logic | Single Responsibility: each layer has one job |
| Duplicate checks across controllers (e.g., email format in register & update) | Reusable validators shared across routes |
| Validation rules buried in business logic — hard to audit | All rules in one folder — easy to review & update |
| Can't swap validation library without touching every controller | Swap Joi → Zod → express-validator in one place |
| Error shapes vary per controller | Consistent `400` response structure from one handler |

**Rule:** Controllers should assume input is already valid. If bad data reaches a controller, it's a validation bug, not a controller bug.

---

## 🏭 Industry Best Practices

1. **Validate at the edge** — Validation middleware runs in the route file, before the controller. Bad requests are rejected immediately (no DB queries wasted).
2. **Use a schema-based library** — Libraries like `express-validator` or `Joi` define rules declaratively rather than with manual `if` chains.
3. **Return ALL errors at once** — Don't fail on the first bad field. Collect and return every validation error so the client can fix everything in one round-trip.
4. **Separate validation from sanitization** — Validate format first, then sanitize (trim, escape) to prevent injection.
5. **Keep validators stateless** — No DB lookups in validators. Uniqueness checks belong in the service/DB layer.

---

## ⚙️ How It Will Plug Into Routes

```js
// routes/authRoutes.js
const { validateRegister, validateLogin } = require('../validators/authValidator');

router.post('/register', validateRegister, authController.register);
router.post('/login',    validateLogin,    authController.login);
```

Flow: **Request → Validator (rejects 400) → Controller (processes) → Service (DB) → Response**

---

## 🧪 Test Plan (Postman)

Once validators are built, test each with these patterns:

### Auth Validators
| Test | Method & URL | Body | Expected |
| :--- | :--- | :--- | :---: |
| Missing all fields | `POST /api/auth/register` | `{}` | `400` + errors array |
| Invalid email | `POST /api/auth/register` | `{ "email": "not-email" }` | `400` |
| Short password | `POST /api/auth/register` | `{ "password": "12" }` | `400` |
| Valid register | `POST /api/auth/register` | all fields correct | `201` |
| Missing password on login | `POST /api/auth/login` | `{ "email": "a@b.com" }` | `400` |

### Company Validators
| Test | Method & URL | Body | Expected |
| :--- | :--- | :--- | :---: |
| Missing company name | `POST /api/companies` | `{}` | `400` |
| Valid create | `POST /api/companies` | `{ "name": "Acme" }` | `201` |

### Job Validators
| Test | Method & URL | Body | Expected |
| :--- | :--- | :--- | :---: |
| Missing title/salary | `POST /api/jobs` | `{}` | `400` |
| Invalid salary (negative) | `POST /api/jobs` | `{ "salary": -100 }` | `400` |
| Valid create | `POST /api/jobs` | all required fields | `201` |

### Application Validators
| Test | Method & URL | Body | Expected |
| :--- | :--- | :--- | :---: |
| Invalid status value | `PUT /api/applications/:id/status` | `{ "status": "yolo" }` | `400` |
| Valid status update | `PUT /api/applications/:id/status` | `{ "status": "accepted" }` | `200` |

---

---

## ✅ Step 4 — Auth Validators

**File:** `src/validators/authValidator.js`  
**Dependency:** `express-validator` (installed)

### What It Does
Exports two middleware arrays — `validateRegister` and `validateLogin` — that run **before** the controller in the route chain.

| Field | Register | Login | Rule | Security Reason |
| :--- | :---: | :---: | :--- | :--- |
| `name` | ✅ | — | 2–50 chars, trimmed, escaped | Prevents XSS via HTML injection in name |
| `email` | ✅ | ✅ | Valid format, normalized | Blocks malformed input before DB unique check |
| `password` | ✅ | ✅ | Min 6 chars (register), non-empty (login) | Resists brute-force; login just needs a value |
| `role` | ✅ | — | Optional, whitelist: `candidate` / `recruiter` | **Blocks self-assigning `admin` role** |

### Wire into Routes
```js
// routes/authRoutes.js
const { validateRegister, validateLogin } = require('../validators/authValidator');

router.post('/register', validateRegister, authController.register);
router.post('/login',    validateLogin,    authController.login);
```

### 🧪 Test (Postman)

**1 — Empty register body → 400 with all field errors**
```
POST http://localhost:5000/api/auth/register
Body: {}
```
```json
{
  "success": false,
  "message": "Validation failed. Please check the provided fields.",
  "errors": [
    { "field": "name",     "message": "Name is required" },
    { "field": "email",    "message": "Email is required" },
    { "field": "password", "message": "Password is required" }
  ]
}
```

**2 — Invalid email + short password → 400**
```
POST http://localhost:5000/api/auth/register
Body: { "name": "Test", "email": "bad", "password": "12" }
```
```json
{ "errors": [
    { "field": "email",    "message": "Please provide a valid email address" },
    { "field": "password", "message": "Password must be at least 6 characters" }
]}
```

**3 — Privilege escalation attempt (role=admin) → 400**
```
POST http://localhost:5000/api/auth/register
Body: { "name": "Hacker", "email": "h@x.com", "password": "123456", "role": "admin" }
```
```json
{ "errors": [{ "field": "role", "message": "Role must be either candidate or recruiter" }] }
```

**4 — Empty login body → 400**
```
POST http://localhost:5000/api/auth/login
Body: {}
```
```json
{ "errors": [
    { "field": "email",    "message": "Email is required" },
    { "field": "password", "message": "Password is required" }
]}
```

---

---

## ✅ Step 6 — Job Validators

**File:** `src/validators/jobValidator.js`

### What It Does
Exports `validateCreateJob` (all fields required) and `validateUpdateJob` (all fields optional for partial updates).

| Field | Create | Update | Rule | Why |
| :--- | :---: | :---: | :--- | :--- |
| `title` | ✅ | opt | 3–100 chars | Prevents meaningless 1-char titles |
| `description` | ✅ | opt | 10–5000 chars | Forces meaningful listings |
| `salary` | ✅ | opt | Numeric, ≥ 0 | Rejects negatives and strings like "$50k" |
| `location` | ✅ | opt | 2–100 chars, trimmed | Blocks whitespace-only values |
| `experience` | ✅ | opt | Whitelist enum | Matches schema: `0-1 years` … `10+ years` |
| `jobType` | opt | opt | Whitelist enum | Matches schema: `Full-time` … `Remote` |

> `company` and `createdBy` are set by the controller from auth context — never user-supplied.

### Wire into Routes
```js
const { validateCreateJob, validateUpdateJob } = require('../validators/jobValidator');

router.post('/',    protect, validateCreateJob,  jobController.createJob);
router.put('/:id',  protect, validateUpdateJob,  jobController.updateJob);
```

### 🧪 Test (Postman)

**1 — Empty create body → 400**
```
POST http://localhost:5000/api/jobs
Headers: Authorization: Bearer <token>
Body: {}
```
```json
{ "success": false, "errors": [
    { "field": "title",       "message": "Job title is required" },
    { "field": "description", "message": "Job description is required" },
    { "field": "salary",      "message": "Salary is required" },
    { "field": "location",    "message": "Location is required" },
    { "field": "experience",  "message": "Experience level is required" }
]}
```

**2 — Negative salary + invalid experience → 400**
```
Body: { "title": "Dev", "description": "A valid desc here", "salary": -500, "location": "Delhi", "experience": "senior" }
```
```json
{ "errors": [
    { "field": "salary",     "message": "Salary must be a positive number" },
    { "field": "experience", "message": "Experience must be one of: 0-1 years, ..." }
]}
```

**3 — Partial update (only salary) → passes validation**
```
PUT http://localhost:5000/api/jobs/<jobId>
Body: { "salary": 900000 }
```
Should proceed to controller (no 400) since all fields are optional on update.

---

---

## ✅ Step 5 — Company Validators

**File:** `src/validators/companyValidator.js`

### What It Does
Exports `validateCreateCompany` (name required) and `validateUpdateCompany` (all optional for partial updates).

| Field | Create | Update | Rule | Why |
| :--- | :---: | :---: | :--- | :--- |
| `companyName` | ✅ | opt | 2–100 chars, trimmed | Prevents empty/single-char registrations |
| `website` | opt | opt | Valid URL when provided | Blocks freeform text breaking frontend links |
| `description` | opt | opt | Max 1000 chars | Matches schema limit, prevents oversized payloads |

> `owner` is set by the controller from `req.user` — never user-supplied.

### Wire into Routes
```js
const { validateCreateCompany, validateUpdateCompany } = require('../validators/companyValidator');

router.post('/',    protect, validateCreateCompany,  companyController.createCompany);
router.put('/:id',  protect, validateUpdateCompany,  companyController.updateCompany);
```

### 🧪 Test (Postman)

**1 — Empty create body → 400**
```
POST http://localhost:5000/api/companies
Headers: Authorization: Bearer <token>
Body: {}
```
```json
{ "success": false, "errors": [
    { "field": "companyName", "message": "Company name is required" }
]}
```

**2 — Invalid website URL → 400**
```
Body: { "companyName": "Acme Corp", "website": "not-a-url" }
```
```json
{ "errors": [{ "field": "website", "message": "Please provide a valid website URL" }] }
```

**3 — Valid create → passes validation**
```
Body: { "companyName": "Acme Corp", "website": "https://acme.com", "description": "A great company" }
```
Should proceed to controller (no 400).

---
---

---

## ✅ Step 8 — Validation Middleware (DRY Refactor)

**File:** `src/middleware/validationMiddleware.js`

### What & Why
Every validator file had its own copy of `handleValidationErrors` — identical 15-line function duplicated 3 times. This middleware centralizes it into one shared `validate` function.

### Validation Lifecycle
```
Request
  → body('email').isEmail()      [Phase 1 — collects errors silently]
  → body('password').notEmpty()  [Phase 1 — collects errors silently]
  → validate                    [Phase 2 — checks results, sends 400 or next()]
  → controller                  [only reached if zero errors]
```

### What Changed
| File | Before | After |
| :--- | :--- | :--- |
| `authValidator.js` | Inline `handleValidationErrors` | `import { validate }` |
| `jobValidator.js` | Inline `handleValidationErrors` | `import { validate }` |
| `companyValidator.js` | Inline `handleValidationErrors` | `import { validate }` |

### 🧪 Test (Postman)
Same tests as Steps 4–6 — responses should be **identical** since the logic is the same, just centralized. Quick sanity check:
```
POST http://localhost:5000/api/auth/register
Body: {}
```
```json
{ "success": false, "message": "Validation failed...", "errors": [...] }
```
If the 400 response shape is unchanged, the refactor is clean.

---
