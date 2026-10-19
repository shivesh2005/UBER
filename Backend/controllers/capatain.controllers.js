
const captainModel = require('../models/captain.model');
const captainService = require('../service/captain.service');
const { validationResult } = require('express-validator');
const blackListTokenModel = require('../models/blackListToken.model');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000
};

// Register Captain
module.exports.registerCaptain = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { fullName, email, password, vehicle } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const existingCaptain = await captainModel.findOne({
      email: normalizedEmail
    });

    if (existingCaptain) {
      return res.status(409).json({
        message: 'Captain already exists'
      });
    }

    // The captain model's pre-save hook hashes the password.
    const captain = await captainService.createCaptain({
      fullName,
      email: normalizedEmail,
      password,
      vehicle
    });

    const token = captain.generateAuthToken();

    res.cookie('token', token, cookieOptions);

    const captainData = captain.toObject();
    delete captainData.password;

    return res.status(201).json({
      message: 'Captain registered successfully',
      token,
      captain: captainData
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Email is already registered'
      });
    }

    return next(error);
  }
};

// Login Captain
module.exports.loginCaptain = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    const captain = await captainModel
      .findOne({ email: email.toLowerCase().trim() })
      .select('+password');

    if (!captain) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const isPasswordCorrect = await captain.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const token = captain.generateAuthToken();

    res.cookie('token', token, cookieOptions);

    const captainData = captain.toObject();
    delete captainData.password;

    return res.status(200).json({
      message: 'Login successful',
      token,
      captain: captainData
    });
  } catch (error) {
    return next(error);
  }
};

// Get Captain Profile
module.exports.getCaptainProfile = async (req, res, next) => {
  try {
    const captain = await captainModel
      .findById(req.captain._id)
      .select('-password');

    if (!captain) {
      return res.status(404).json({
        message: 'Captain not found'
      });
    }

    return res.status(200).json({ captain });
  } catch (error) {
    return next(error);
  }
};

// Logout Captain
module.exports.logoutCaptain = async (req, res, next) => {
  try {
    // Prefer the token verified by authCaptain middleware.
    const token =
      req.token ||
      req.cookies?.token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized: token missing'
      });
    }

    await blackListTokenModel.create({ token });

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return res.status(200).json({
      message: 'Captain logged out successfully'
    });
  } catch (error) {
    return next(error);
  }
};
