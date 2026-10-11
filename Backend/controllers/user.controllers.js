const userModel = require('../models/user.model');
const userService = require('../service/user.service');
const { validationResult } = require('express-validator');
const blackListTokenModel = require('../models/blackListToken.model');

module.exports.registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstname, lastname, email, password } = req.body;
  const hashedPassword = await userModel.hashPassword(password);
  const user = await userService.createUser({
    firstName: firstname,
    lastName: lastname,
    email,
    password: hashedPassword
  });

  const token = user.generateAuthTokens();
  res.status(201).json({ token, user });
};

module.exports.loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const user = await userModel.findOne({ email }).select('+password');//user ke andar ka password leke ana because vo defaultly false hai

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid Password' });
  }

  const token = user.generateAuthTokens();
  res.cookie('token' , token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 3600000,
  })
  res.status(200).json({ token, user });
};
module.exports.logoutUser = async (req, res, next) => {
  const { token } = req;
  await blackListTokenModel.create({ token });
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};
module.exports.getUserProfile = async(req , res ,next) =>{
  res.status(200).json(req.user);
}