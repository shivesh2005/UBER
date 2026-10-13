const express = require('/express');
const router = express.Router();
const {body} =require('/express-validator');
router.post('/register' ,  [
  body('email')
  .isEmail()
  .withMessage('Please enter a valid email'),
  body('fullName.firstName')
  .isLength({min: 3})
  .withMessage('First name must be at least 3 characters long'),
  body('password')
  .isLength({min: 6})
  .withMessage('Password must be at least 6 characters long'),
  body('vehicle.color')
  .isLength({min: 3})
  .withMessage('Vehicle color must be at least 3 characters long'),
  body('vehicle.plate')
  .isLength({min: 3})
  .withMessage('Vehicle plate must be at least 3 characters long'),
  body('vehicle.capacity')
  .isNumeric()
  .withMessage('Vehicle capacity must be a number'),
  body('vehicle.model')
  .isLength({min: 3})
  .withMessage('Vehicle model must be at least 3 characters long'),
], userController.reigisterCpatain);
