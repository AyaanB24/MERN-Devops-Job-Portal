/**
 * @file jobValidator.js
 * @description Request validation middleware for job routes using
 * express-validator. Validates body fields before the controller runs.
 *
 * VALIDATION DECISIONS:
 * ─────────────────────
 *  title       → Required, 3-100 chars. Short titles like "JS" are meaningless
 *                for search; the max mirrors the Job schema's maxlength.
 *  description → Required, 10-5000 chars. Forces recruiters to write meaningful
 *                descriptions; prevents single-word spam listings.
 *  salary      → Required, must be numeric and ≥ 0. Rejects negative values and
 *                strings like "$50k" before they hit the Number schema field.
 *  location    → Required, 2-100 chars. Trimmed — prevents whitespace-only values.
 *  experience  → Required, strict whitelist matching the schema enum. Rejects
 *                freeform text like "senior" so filtering stays consistent.
 *  jobType     → Optional (schema defaults to 'Full-time'), whitelist-validated
 *                when provided so unknown types never reach the DB.
 */

const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');

// ─── Create Job Validation ────────────────────────────────────────────────────

/**
 * validateCreateJob
 *
 * Validates POST /api/jobs body fields.
 * company & createdBy are set by the controller (from auth context),
 * so they are NOT validated here — the user never supplies them.
 */
const validateCreateJob = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),

  body('salary')
    .notEmpty()
    .withMessage('Salary is required')
    .isFloat({ min: 0 })
    .withMessage('Salary must be a positive number'),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),

  body('experience')
    .notEmpty()
    .withMessage('Experience level is required')
    .isIn(['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years'])
    .withMessage('Experience must be one of: 0-1 years, 1-3 years, 3-5 years, 5-10 years, 10+ years'),

  body('jobType')
    .optional()
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'])
    .withMessage('Job type must be one of: Full-time, Part-time, Contract, Internship, Remote'),

  validate,
];

// ─── Update Job Validation ────────────────────────────────────────────────────

/**
 * validateUpdateJob
 *
 * Validates PUT /api/jobs/:id body fields.
 * All fields are optional on update — only supplied fields are validated.
 * This allows partial updates (PATCH-style) without requiring every field.
 */
const validateUpdateJob = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),

  body('salary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Salary must be a positive number'),

  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),

  body('experience')
    .optional()
    .isIn(['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years'])
    .withMessage('Experience must be one of: 0-1 years, 1-3 years, 3-5 years, 5-10 years, 10+ years'),

  body('jobType')
    .optional()
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'])
    .withMessage('Job type must be one of: Full-time, Part-time, Contract, Internship, Remote'),

  validate,
];

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  validateCreateJob,
  validateUpdateJob,
};
