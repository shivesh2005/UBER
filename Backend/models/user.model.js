
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    fullName: {
        firstName: {
            type: String,
            required: true,
            minlength: [3, 'First name must be at least 3 characters long'],
        },
        lastName: {
            type: String,
            minlength: [3, 'Last name must be at least 3 characters long'],
        },
    },

    email: {
        type: String,
        required: true,
        unique: true,
        minlength: [3, 'Email must be at least 3 characters long'],
    },

    password: {
        type: String,
        required: true,
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false,
    },

    socketId: {
        type: String,
    },
});

userSchema.methods.generateAuthTokens = function () {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
       
    );
    return Token;
};

userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = async function (password) {
    return bcrypt.hash(password, 10);
};

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;