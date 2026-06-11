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
    .custom((value) => {
      if (!value || value === '') return true;
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error('LinkedIn must be a valid URL');
      }
    }),

  body('socialLinks.github')
    .optional()
    .trim()
    .custom((value) => {
      if (!value || value === '') return true;
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error('GitHub must be a valid URL');
      }
    }),

  body('socialLinks.twitter')
    .optional()
    .trim()
    .custom((value) => {
      if (!value || value === '') return true;
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error('Twitter must be a valid URL');
      }
    }),

  body('socialLinks.website')
    .optional()
    .trim()
    .custom((value) => {
      if (!value || value === '') return true;
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error('Website must be a valid URL');
      }
    }),

  body('yearsOfExperience')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      if (isNaN(num) || num < 0 || num > 50) {
        throw new Error('Years of experience must be between 0 and 50');
      }
      return true;
    }),

  body('graduationYear')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      if (isNaN(num) || num < 1980 || num > 2030) {
        throw new Error('Invalid graduation year');
      }
      return true;
    }),
];

module.exports = { updateProfileValidation };