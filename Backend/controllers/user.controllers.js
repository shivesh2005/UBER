const userModel = require('../models/user.model');
const userService = require('../services/user.service');
const {validationResult} = require('express-validator');
module.exports.registerUser = async(req , res , next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors : errors.array()});
  }
  const {firstname , lastname , email , password} = req.body;
  const hashedPassword = await userModel.hashPassword(password);
  const user = await userService.createUser({
    firstName : firstname,
    lastName : lastname,
    email,
    password : hashedPassword
  });
  const token = user.generateAuthTokens();
  res.status(201).json({token , user});
}