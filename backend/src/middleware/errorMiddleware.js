/**
 * @file errorMiddleware.js
 * @description Centralized error handling middleware for the Job Portal API.
 *
 * WHY GLOBAL ERROR HANDLING IS IMPORTANT:
 * ─────────────────────────────────────────
 * In a production API, errors are inevitable — bad user input, database
 * failures, network timeouts, logic bugs. Without a centralized handler:
 *   - Each controller/service would need its own error-formatting logic,
 *     leading to inconsistent response shapes for clients.
 *   - Stack traces and sensitive DB internals could leak to consumers.
 *   - Adding cross-cutting concerns (logging, alerting) requires touching
 *     every file individually.
 * A single error-handler solves all three by acting as the API's last line
 * of defense before a response reaches the client.
 *
 * HOW EXPRESS ERROR FLOW WORKS:
 * ───────────────────────────────
 * Express distinguishes error-handling middleware by its arity (4 params):
 *   (err, req, res, next)
 * Any middleware or route that calls next(err) — or throws inside an
 * async function wrapped with a try/catch that calls next(err) — will
 * skip all remaining regular middleware and jump directly to the first
 * error-handling middleware registered in app.js.
 * This middleware MUST be registered LAST, after all routes.
 *
 * LOCAL TRY-CATCH vs. CENTRALIZED ERROR HANDLING:
 * ─────────────────────────────────────────────────
 * Local try-catch:
 *   • Handles errors inline, right where they occur.
 *   • Necessary for business-logic branching (e.g., retry on failure).
 *   • Leads to duplicated res.status(...).json(...) error shapes everywhere.
 *   • Hard to enforce consistent error structure across the codebase.
 *
 * Centralized handler (this file):
 *   • Controllers/services call `next(err)` — they do NOT format responses.
 *   • One place governs ALL error response structure, status codes, and logging.
 *   • Easy to extend: add Sentry, Winston logger, or Slack alerts in one spot.
 *   • Keeps controllers clean and focused on business logic only.
 *
 * Best practice: use local try-catch to catch errors and call next(err),
 * then let THIS middleware own the response formatting.
 */

// ─── Error Type Constants ─────────────────────────────────────────────────────

/**
 * Mongoose validation error name (schema-level field validation failure).
 * e.g. required field missing, enum mismatch, custom validator failed.
 */
const MONGOOSE_VALIDATION_ERROR = 'ValidationError';

/**
 * Mongoose cast error name — usually triggered when an invalid ObjectId
 * is passed to a query (e.g. /jobs/not-a-valid-id).
 */
const MONGOOSE_CAST_ERROR = 'CastError';

/**
 * MongoDB driver duplicate key error code (E11000).
 * Triggered when a unique-indexed field (e.g. email) already exists.
 */
const MONGO_DUPLICATE_KEY_CODE = 11000;

// ─── 404 Not Found Handler ────────────────────────────────────────────────────

/**
 * notFound middleware
 *
 * Catches requests to routes that don't exist and forwards a formatted
 * 404 error to the centralized error handler.
 * Must be placed AFTER all route registrations in app.js.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// ─── Centralized Error Handler ────────────────────────────────────────────────

/**
 * errorHandler middleware
 *
 * The single source of truth for ALL error responses in the API.
 * Express identifies this as an error-handling middleware because it
 * declares four parameters (err, req, res, next).
 *
 * Handles:
 *   1. Mongoose ValidationError  → 400 Bad Request
 *   2. Mongoose CastError        → 400 Bad Request (invalid ObjectId)
 *   3. MongoDB Duplicate Key     → 409 Conflict
 *   4. JWT errors                → 401 Unauthorized
 *   5. Custom app errors         → status code attached to the error object
 *   6. Unknown/unhandled errors  → 500 Internal Server Error
 *
 * @param {Error}  err  - The error object forwarded via next(err).
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next  - Required by Express even if unused.
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars

  // ── Determine the HTTP status code ──────────────────────────────────────────
  // Priority: error.statusCode → response statusCode already set → fallback 500
  let statusCode = err.statusCode || res.statusCode || 500;

  // If response statusCode was still 200 (default) but an error was thrown,
  // override to 500 so the client knows it's a server error.
  if (statusCode === 200) statusCode = 500;

  // ── Determine the error message ──────────────────────────────────────────────
  let message = err.message || 'An unexpected error occurred';

  // ── Collect field-level validation details (for 400 responses) ──────────────
  let errors = null;

  // ── 1. Handle Mongoose Validation Errors ─────────────────────────────────────
  // These occur when Mongoose schema validators reject field values.
  // err.errors is an object keyed by field name.
  if (err.name === MONGOOSE_VALIDATION_ERROR) {
    statusCode = 400;
    message = 'Validation failed. Please check the provided fields.';

    // Extract each field's validation message into a clean array.
    errors = Object.values(err.errors).map((field) => ({
      field: field.path,
      message: field.message,
    }));
  }

  // ── 2. Handle Mongoose CastError (Invalid ObjectId) ───────────────────────────
  // Occurs when Mongoose tries to cast a value (e.g., "abc") to ObjectId.
  if (err.name === MONGOOSE_CAST_ERROR) {
    statusCode = 400;
    message = `Invalid value for field '${err.path}'. Expected a valid ${err.kind}.`;
  }

  // ── 3. Handle MongoDB Duplicate Key Error (E11000) ────────────────────────────
  // Occurs when inserting/updating a document violates a unique index.
  if (err.code === MONGO_DUPLICATE_KEY_CODE) {
    statusCode = 409;
    // Extract the duplicate field name from the error's keyValue object.
    const duplicateField = Object.keys(err.keyValue || {})[0] || 'field';
    const duplicateValue = err.keyValue ? err.keyValue[duplicateField] : '';
    message = `Duplicate value: '${duplicateValue}' already exists for '${duplicateField}'. Please use a different value.`;
  }

  // ── 4. Handle JWT Errors ──────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }

  // ── 5. Console logging (development only) ────────────────────────────────────
  // In production, replace this with a structured logger (e.g. Winston/Pino).
  if (process.env.NODE_ENV !== 'production') {
    console.error('─── Error Handler ──────────────────────────');
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.error(`Status   : ${statusCode}`);
    console.error(`Message  : ${message}`);
    if (errors) console.error('Fields   :', JSON.stringify(errors, null, 2));
    console.error('Stack    :', err.stack);
    console.error('────────────────────────────────────────────');
  }

  // ── 6. Send a production-friendly JSON response ───────────────────────────────
  res.status(statusCode).json({
    success: false,
    message,

    // Field-level errors only on validation failures (null otherwise).
    errors: errors || undefined,

    // Expose the stack trace ONLY in development for easier debugging.
    // NEVER expose raw stack traces in production.
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = { notFound, errorHandler };
