
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const authMiddleware = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controllers');

// ===============================
// REGISTER USER
// ===============================
router.post(
  '/register',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),

    body('fullName.firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .bail()
      .isLength({ min: 3 })
      .withMessage('First name must be at least 3 characters long'),

    body('fullName.lastName')
      .optional({ values: 'falsy' })
      .trim()
      .isLength({ min: 3 })
      .withMessage('Last name must be at least 3 characters long'),

    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  userController.registerUser
);


// ===============================
// LOGIN USER
// ===============================
router.post(
  '/login',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Invalid email'),

    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  userController.loginUser
);


// ===============================
// GET USER PROFILE
// ===============================
router.get(
  '/profile',
  authMiddleware.authUser,
  userController.getUserProfile
);


// ===============================
// LOGOUT USER
// ===============================
router.post(
  '/logout',
  authMiddleware.authUser,
  userController.logoutUser
);

module.exports = router;
