
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, 'First name must be at least 3 characters long'],
      },

      lastName: {
        type: String,
        trim: true,
        minlength: [3, 'Last name must be at least 3 characters long'],
      },
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },

    socketId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// GENERATE JWT TOKEN
userSchema.methods.generateAuthTokens = function () {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing from .env');
  }

  return jwt.sign(
    { id: this._id, role: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// COMPARE PASSWORD
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// HASH PASSWORD
userSchema.statics.hashPassword = async function (password) {
  return bcrypt.hash(password, 10);
};

// CREATE USER MODEL
const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
