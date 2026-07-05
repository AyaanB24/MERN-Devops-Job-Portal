# Phase 12: Backend Hardening

## 🗺️ Roadmap

| Step | Feature | Status |
| :--- | :--- | :---: |
| 1 | Global Error Handler | ✅ Done |
| 2 | Async Error Wrapper | ✅ Done |
| 3 | Integrate Error Middleware | ✅ Done |
| 4 | *(coming soon)* | 🔜 |

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
