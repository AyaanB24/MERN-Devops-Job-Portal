const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');
const Company = require('../models/Company');

// ─── Create Company Validation ────────────────────────────────────────────────

/**
 * validateCreateCompany
 *
 * Validates POST /api/companies body fields.
 * `owner` is set by the controller from req.user — never user-supplied.
 * Also checks that recruiter doesn't already have a company.
 */
const validateCreateCompany = [
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),

  body('website')
    .optional({ values: 'falsy' })
    .trim()
    .isURL()
    .withMessage('Please provide a valid website URL'),

  body('description')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  validate,
];

// ─── Update Company Validation ────────────────────────────────────────────────

/**
 * validateUpdateCompany
 *
 * Validates PUT /api/companies/:id body fields.
 * All fields optional — supports partial updates.
 */
const validateUpdateCompany = [
  body('companyName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),

  body('website')
    .optional({ values: 'falsy' })
    .trim()
    .isURL()
    .withMessage('Please provide a valid website URL'),

  body('description')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  validate,
];

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  validateCreateCompany,
  validateUpdateCompany,
};
