/**
 * @file authValidator.js
 * @description Request validation middleware for authentication routes
 * using express-validator. Runs BEFORE the controller — bad requests are
 * rejected immediately with a 400 and a descriptive errors array.
 *
 * WHY EACH VALIDATION EXISTS:
 * ────────────────────────────
 *  name      → Prevents empty/whitespace-only names and XSS via trim + escape.
 *  email     → Rejects malformed addresses before they hit the DB unique index.
 *  password  → Enforces minimum length to resist brute-force attacks.
 *  role      → Whitelist-only enum prevents privilege escalation (e.g. "admin").
 *
 * SECURITY BENEFITS:
 * ──────────────────
 *  1. Fail-fast — invalid requests never reach the service/DB layer.
 *  2. Input sanitization (trim, escape, normalizeEmail) strips injection vectors.
 *  3. Whitelist validation on `role` stops users from self-assigning admin access.
 *  4. Consistent 400 response shape helps frontend show per-field error messages.
 */

const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');

// ─── Register Validation ──────────────────────────────────────────────────────

/**
 * validateRegister
 *
 * Validates POST /api/auth/register body fields.
 *
 * Rules:
 *   name     → required, 2-50 chars, trimmed, escaped (XSS safe)
 *   email    → required, valid format, normalized (lowercase, trim dots)
 *   password → required, min 6 chars (matches User schema minlength)
 *   role     → optional, must be one of ['candidate', 'recruiter']
 *              Note: 'admin' is intentionally excluded — admins are
 *              created via DB seeding or internal tooling, never self-signup.
 */
const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .escape(),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('role')
    .optional()
    .isIn(['candidate', 'recruiter'])
    .withMessage('Role must be either candidate or recruiter'),

  validate,
];

// ─── Login Validation ─────────────────────────────────────────────────────────

/**
 * validateLogin
 *
 * Validates POST /api/auth/login body fields.
 *
 * Rules:
 *   email    → required, valid format, normalized
 *   password → required (no min-length check — that's a registration rule;
 *              login just needs a non-empty value to compare against the hash)
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  validate,
];

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  validateRegister,
  validateLogin,
};
