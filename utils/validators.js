const { body, param } = require('express-validator');

exports.signupValidator = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),
];

exports.loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

exports.restaurantValidator = [
  body('name')
    .notEmpty()
    .withMessage('Restaurant name is required')
    .trim(),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .trim(),
  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .trim(),
  body('cuisineType')
    .notEmpty()
    .withMessage('Cuisine type is required')
    .trim(),
  body('openingHours.open')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Opening hours.open must be in HH:MM (24-hour) format'),
  body('openingHours.close')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Opening hours.close must be in HH:MM (24-hour) format'),
];

exports.menuItemValidator = [
  body('itemName')
    .notEmpty()
    .withMessage('Item name is required')
    .trim(),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a number equal to or greater than 0'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .trim(),
  body('availability')
    .optional()
    .isBoolean()
    .withMessage('Availability must be a boolean'),
  body('description')
    .optional()
    .trim(),
];

exports.bookingValidator = [
  body('restaurant')
    .isMongoId()
    .withMessage('Valid Restaurant ID is required'),
  body('bookingDate')
    .isISO8601()
    .withMessage('Please provide a valid ISO8601 date (YYYY-MM-DD)'),
  body('timeSlot')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time slot must be in HH:MM (24-hour) format'),
  body('numberOfGuests')
    .isInt({ min: 1 })
    .withMessage('Number of guests must be at least 1'),
];

exports.mongoIdValidator = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} ID format`),
];
