
const express = require('express');
const router = express.Router();

const captainController = require('../controllers/captain.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { body } = require('express-validator');

// Register Captain
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email'),

    body('fullName.firstName')
      .trim()
      .isLength({ min: 3 })
      .withMessage('First name must be at least 3 characters long'),

    body('fullName.lastName')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Last name must be at least 3 characters long'),

    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),

    body('vehicle.color')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Vehicle color must be at least 3 characters long'),

    body('vehicle.plate')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Vehicle plate must be at least 3 characters long'),

    body('vehicle.capacity')
      .isInt({ min: 1 })
      .withMessage('Vehicle capacity must be a positive integer'),

    body('vehicle.model')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Vehicle model must be at least 3 characters long'),

    body('vehicle.vehicleType')
      .isIn(['car', 'bike', 'van'])
      .withMessage('Vehicle type must be car, bike, or van')
  ],
  captainController.registerCaptain
);

// Login Captain
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email'),

    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  captainController.loginCaptain
);

// Get Captain Profile
router.get(
  '/profile',
  authMiddleware.authCaptain,
  captainController.getCaptainProfile
);

// Logout Captain
router.post(
  '/logout',
  authMiddleware.authCaptain,
  captainController.logoutCaptain
);

module.exports = router;
