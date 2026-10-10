const userModel = require('../models/user.model');
const userService = require('../service/user.service');
const { validationResult } = require('express-validator');

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
  res.status(200).json({ token, user });
};