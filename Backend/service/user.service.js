
const userModel = require('../models/user.model');

module.exports.createUser = async ({
  firstName,
  lastName,
  email,
  password,
}) => {
  if (!firstName || !email || !password) {
    throw new Error('All required fields must be provided');
  }

  const userData = {
    fullName: {
      firstName: firstName.trim(),
    },
    email: email.trim().toLowerCase(),
    password,
  };

  // Only save lastName if provided
  if (lastName && lastName.trim()) {
    userData.fullName.lastName = lastName.trim();
  }

  const user = await userModel.create(userData);

  return user;
};
