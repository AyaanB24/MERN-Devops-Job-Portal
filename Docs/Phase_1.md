# Phase 1: User Registration Feature

This phase implemented user registration using a robust, clean architecture design that isolates HTTP concerns, business validations, and data models.

---

## 📂 File Architecture

Below are the new and modified files added during this phase:

```
backend/src/
├── app.js (Modified)
├── models/
│   └── User.js (New)
├── services/
│   └── authService.js (New)
├── controllers/
│   └── authController.js (New)
└── routes/
    └── authRoutes.js (New)
```

---

## 📝 Detailed File Breakdown

### 1. `backend/src/models/User.js`
*   **Purpose**: Manages user schema design, data types, field validations, and hooks for MongoDB.
*   **Key Responsibilities**:
    *   Defines schema fields: `name`, `email`, `password`, `role`, `profilePhoto`, `resume`, `skills`, and `bio`.
    *   Enforces enums for user roles (`candidate`, `recruiter`, `admin`).
    *   Secures user credentials using a Mongoose `pre-save` hook that hashes raw passwords via `bcryptjs`.
    *   Exposes `comparePassword()` helper to match hashes during login.
    *   Applies `select: false` to the password field to prevent credential leaks by default.

### 2. `backend/src/services/authService.js`
*   **Purpose**: Orchestrates registration business policies.
*   **Key Responsibilities**:
    *   Validates that the email is not already registered in MongoDB.
    *   Instantiates the model and triggers database save operations.
    *   Sanitizes and returns the final user document without the password hash.

### 3. `backend/src/controllers/authController.js`
*   **Purpose**: Interfaces with incoming HTTP request payloads.
*   **Key Responsibilities**:
    *   Extracts body parameters (`name`, `email`, `password`, etc.).
    *   Performs basic payload presence validation.
    *   Invokes the core registration service.
    *   Sends standardized JSON HTTP responses (e.g., `201 Created` on success, or passes errors downstream via `next(error)`).

### 4. `backend/src/routes/authRoutes.js`
*   **Purpose**: Defines URL routing endpoints.
*   **Key Responsibilities**:
    *   Declares the endpoint `POST /register`.
    *   Binds the route to the controller's `register` handler.

### 5. `backend/src/app.js` (Modified)
*   **Purpose**: Wires up routes.
*   **Key Responsibilities**:
    *   Imports and mounts `authRoutes` under the base prefix `/api/auth`.
    *   Makes the registration endpoint fully reachable at `POST /api/auth/register`.
