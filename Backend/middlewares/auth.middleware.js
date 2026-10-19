
const jwt = require('jsonwebtoken');

const userModel = require('../models/user.model');
const captainModel = require('../models/captain.model');
const blackListTokenModel = require('../models/blackListToken.model');

// Get token from cookie or Authorization header.
const getToken = (req) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  return req.cookies?.token || null;
};

// Check token validity and blacklist status.
const verifyAuthToken = async (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  const isBlacklisted = await blackListTokenModel.findOne({
    token
  });

  if (isBlacklisted) {
    return null;
  }

  return jwt.verify(token, process.env.JWT_SECRET);
};

// Authenticate User.
module.exports.authUser = async (req, res, next) => {
  try {
    const token = getToken(req);

    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized: token missing'
      });
    }

    const decoded = await verifyAuthToken(token);

    if (!decoded) {
      return res.status(401).json({
        message: 'Unauthorized: token is blacklisted'
      });
    }

    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: 'User not found'
      });
    }

    req.user = user;
    req.token = token;

    return next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token'
    });
  }
};

// Authenticate Captain.
module.exports.authCaptain = async (req, res, next) => {
  try {
    const token = getToken(req);

    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized: token missing'
      });
    }

    const decoded = await verifyAuthToken(token);

    if (!decoded) {
      return res.status(401).json({
        message: 'Unauthorized: token is blacklisted'
      });
    }

    const captain = await captainModel.findById(decoded.id);

    if (!captain) {
      return res.status(401).json({
        message: 'Captain not found'
      });
    }

    req.captain = captain;
    req.token = token;

    return next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token'
    });
  }
};
