const { body } = require('express-validator');

const updateProfileValidation = [
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location too long'),

  body('skills')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Skills must be an array of max 20 items'),

  body('skills.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each skill must be between 1 and 50 characters'),

  body('socialLinks.linkedin')
    .optional()
    .trim()
    .isURL()
    .withMessage('LinkedIn must be a valid URL'),

  body('socialLinks.github')
    .optional()
    .trim()
    .isURL()
    .withMessage('GitHub must be a valid URL'),

  body('yearsOfExperience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Years of experience must be between 0 and 50'),

  body('availability')
    .optional()
    .isIn(['available', 'busy', 'unavailable'])
    .withMessage('Invalid availability value'),

  body('graduationYear')
    .optional()
    .isInt({ min: 1980, max: 2030 })
    .withMessage('Invalid graduation year'),
];

module.exports = { updateProfileValidation };