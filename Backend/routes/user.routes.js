
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controllers');

router.post('/register', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email'),

    body('fullName.firstName')
        .isLength({ min: 3 })
        .withMessage('First name must be at least 3 characters long'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),

], userController.registerUser);
router.post('/login' , [
    body('email')
        .isEmail()
        .withMessage('Invalid Email'),
    body('password')
        .isLength({min: 6})
        .withMessage('Password must be at least 6 characters long')
],userController.loginUser);
router.get('/profile', authMiddleware.authUser, userController.getUserProfile);
router.post('/logout', authMiddleware.authUser, userController.logoutUser);
module.exports = router;