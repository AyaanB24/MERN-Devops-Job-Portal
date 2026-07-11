# Phase 14: Automated Testing Architecture

This document outlines the strategy, folder structure, configuration, and integration workflow for adding automated testing to the MERN Job Portal backend.

---

## 🗺️ Phase Roadmap

| Step | Objective | Status |
| :--- | :--- | :---: |
| **13** | **Testing Architecture Design** | 🎯 Active (Planning) |
| **14** | Jest & Supertest Environment Setup | 🔜 Pending Approval |
| **15** | Auth API Integration Tests | 🔜 Pending |
| **16** | Job API Integration Tests | 🔜 Pending |
| **17** | Unit Tests & Mocking Services | 🔜 Pending |

---

## 👶 What is Automated Testing? (A Quick Refresher)

Imagine you build a feature, change one line of code in the Auth middleware, and suddenly the Job creation route stops working. You might not notice until a client runs it and complains. 

Automated testing is writing a separate set of mini-programs (test files) whose only job is to run your backend code with sample data, make requests, and check if the results match exactly what is expected. If anything breaks, you know in seconds.

---

## 📂 1. Recommended Testing Folder Structure

Instead of scattering test scripts or mixing them directly into the source folders, we organize them in a root-level `tests` directory split by the **type** of test:

```text
backend/
├── src/                                # All application source code
├── tests/                              # Central test folder
│   ├── setup.js                        # Global configuration (starts/stops test database)
│   ├── unit/                           # Isolated tests (no database connection)
│   │   ├── asyncHandler.test.js        # Tests single utility functions
│   │   └── userService.test.js         # Tests service functions with database mocked
│   └── integration/                    # Full stack route testing (requires database)
│       ├── auth.test.js                # Tests /api/auth endpoints (register, login)
│       └── job.test.js                 # Tests /api/jobs endpoints
├── jest.config.js                      # Central configuration file for the Jest test runner
└── package.json                        # Script commands to run the test suite
```

---

## 🎯 2. Our Test Strategy

We will adopt a two-tier testing strategy to keep tests fast, reliable, and thorough:

### ⚙️ Tier A: Unit Testing (Testing in Isolation)
* **What it is**: Testing a single function (like a service or helper utility) completely by itself.
* **Database Strategy**: We **do not** connect to MongoDB. If a service needs to query the database, we use Jest to "mock" (or fake) the Mongoose model so it returns predefined data instantly.
* **Why**: It is extremely fast (runs in milliseconds) and allows us to verify edge-case logic (e.g. check if a helper function throws the correct error when invalid data is supplied).

### 🌐 Tier B: Integration Testing (Testing the Whole Request Loop)
* **What it is**: Testing how your routes, controllers, middleware, database, and validations perform *together*.
* **Database Strategy**: We use an **isolated test database** (either in-memory via `mongodb-memory-server` or a dedicated test DB like `mongodb://localhost:27017/jobportal_test`).
* **Why**: We want to make sure validation middleware blocks bad requests, the controller inserts data correctly, and the global error handler converts database violations into clean JSON envelopes.

> [!WARNING]
> **Crucial Rule**: Never run tests against your development database. Running tests wipes collections and creates mock data, which will corrupt your development setup.

---

## 🃏 3. Jest Configuration (The Test Engine)

**Jest** is our test runner. It reads our test files, runs them, checks the results, and displays green/red status bars in the terminal.

We configure Jest using a `jest.config.js` file in the backend root:
* **Test Environment**: Set to `node` (since we are testing server-side JavaScript, not browser-side DOM).
* **Setup Files**: Point Jest to a `setup.js` script that runs once before all tests. This script starts our test database, connects to it, and automatically cleans up/closes the database when all tests finish.
* **Match Patterns**: Tells Jest to look specifically for files ending in `.test.js` or `.spec.js`.
* **Verbose Mode**: Set to `true` to print detailed results for every individual test in the console.

---

## 🚀 4. Supertest Integration (Faking API Requests)

If we want to test endpoints like `POST /api/auth/register`, we don't want to start the actual server on port 5000 and use Axios or Postman. That is slow, clutters ports, and leaves running processes.

Instead, we use **Supertest**. 

### How Supertest works:
1. It imports the configured Express instance directly from `app.js` (which is why `app.js` is separated from `server.js`).
2. It sends in-memory HTTP requests directly into Express.
3. It allows us to inspect the response header, status code, and JSON body synchronously.

### Example Flow:
* We tell Supertest: *"Send a `POST` request to `/api/auth/register` with this JSON body."*
* Express processes the request (validation runs, controller runs, dummy DB inserts).
* Supertest receives the response in-memory.
* We tell Jest: *"Verify that the status code is `201` and the response contains `success: true`."*
