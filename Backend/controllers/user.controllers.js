
const userModel = require('../models/user.model');
const userService = require('../service/user.service');
const { validationResult } = require('express-validator');
const blackListTokenModel = require('../models/blackListToken.model');

// REGISTER USER
module.exports.registerUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { fullName, email, password } = req.body;

    // Validate required fields
    if (!fullName?.firstName || !email || !password) {
      return res.status(400).json({
        message: 'First name, email and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing user
    const existingUser = await userModel.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists',
      });
    }

    // Hash password exactly once
    const hashedPassword = await userModel.hashPassword(password);

    // Create user
    const user = await userService.createUser({
      firstName: fullName.firstName,
      lastName: fullName.lastName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Generate JWT
    const token = user.generateAuthTokens();

    // Set authentication cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    // Handle duplicate email race condition
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'User already exists',
      });
    }

    next(error);
  }
};


// LOGIN USER
module.exports.loginUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user and include hidden password field
    const user = await userModel
      .findOne({ email: normalizedEmail })
      .select('+password');

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    // Compare entered password with stored hash
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    // Generate JWT
    const token = user.generateAuthTokens();

    // Set authentication cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};


// GET USER PROFILE
module.exports.getUserProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'User not authenticated',
      });
    }

    return res.status(200).json({
      user: {
        _id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};


// LOGOUT USER
module.exports.logoutUser = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Token not found',
      });
    }

    // Add token to blacklist
    await blackListTokenModel.create({ token });

    // Clear authentication cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

   return res.status(200).json({
  user: {
    _id: req.user._id,
    fullName: req.user.fullName,
    email: req.user.email,
  },
});
  } catch (error) {
    next(error);
  }
};
