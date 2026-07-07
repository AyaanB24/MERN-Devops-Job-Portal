/**
 * @file validationMiddleware.js
 * @description Centralized middleware that processes express-validator results
 * and returns a consistent 400 error response when validation fails.
 *
 * VALIDATION LIFECYCLE:
 * ─────────────────────
 * Express-validator works in two phases:
 *
 *   Phase 1 — RULE EXECUTION (inside each validator file)
 *   The validation chain (body('email').isEmail(), etc.) runs against the
 *   request. Each rule that fails pushes an error object into an internal
 *   array attached to the request. No response is sent yet.
 *
 *   Phase 2 — RESULT INSPECTION (this middleware)
 *   After all rules have run, this middleware calls validationResult(req)
 *   to collect the accumulated errors. If any exist, it sends a 400
 *   response with a consistent JSON shape. If none exist, it calls next()
 *   and the request proceeds to the controller.
 *
 *   Flow:
 *     Request
 *       → body('email').isEmail()       [Phase 1 — collects errors]
 *       → body('password').notEmpty()   [Phase 1 — collects errors]
 *       → validate (this middleware)    [Phase 2 — checks & responds]
 *       → controller                   [only reached if no errors]
 *
 * WHY USE MIDDLEWARE INSTEAD OF INLINE CHECKS:
 * ─────────────────────────────────────────────
 *   1. DRY — One function replaces the duplicate handleValidationErrors()
 *      that was copy-pasted across authValidator, jobValidator, etc.
 *   2. Consistent response shape — Every validation error in the entire
 *      API returns the exact same { success, message, errors } structure.
 *   3. Single point of change — Want to add request IDs, log validation
 *      failures, or change the error format? Edit one file, not four.
 *   4. Clean validator files — Validators only define rules; they never
 *      touch `res`. Separation of concerns is preserved.
 */

const { validationResult } = require('express-validator');

/**
 * validate
 *
 * Middleware that inspects accumulated express-validator errors on the
 * request. If errors exist, responds with 400 and a structured error
 * array. Otherwise calls next() to proceed to the controller.
 *
 * Usage — append as the LAST element in every validator array:
 *
 *   const { validate } = require('../middleware/validationMiddleware');
 *
 *   const validateRegister = [
 *     body('name').notEmpty().withMessage('Name is required'),
 *     body('email').isEmail().withMessage('Invalid email'),
 *     validate,  // ← checks results and sends 400 or calls next()
 *   ];
 *
 * @param {import('express').Request}      req
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} next
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please check the provided fields.',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

module.exports = { validate };
