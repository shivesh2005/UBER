
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const captainSchema = new mongoose.Schema(
  {
    fullName: {
      firstName: {
        type: String,
        required: true,
        minlength: [3, 'First name must be at least 3 characters']
      },
      lastName: {
        type: String,
        required: true,
        minlength: [3, 'Last name must be at least 3 characters']
      }
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    socketId: {
      type: String,
      default: null
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive'
    },

    vehicle: {
      color: {
        type: String,
        required: true,
        minlength: [3, 'Color must be at least 3 characters']
      },
      plate: {
        type: String,
        required: true,
        minlength: [3, 'Plate must be at least 3 characters']
      },
      model: {
        type: String,
        required: true,
        minlength: [3, 'Vehicle model must be at least 3 characters']
      },
      capacity: {
        type: Number,
        required: true,
        min: [1, 'Capacity must be at least 1']
      },
      vehicleType: {
        type: String,
        required: true,
        enum: ['car', 'bike', 'van']
      }
    },

    location: {
      lat: Number,
      long: Number
    }
  },
  { timestamps: true }
);

// Hash password before saving.
captainSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// Optional helper for hashing a password manually.
captainSchema.statics.hashPassword = async function (password) {
  return bcrypt.hash(password, 10);
};

// Compare login password with stored password hash.
captainSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Generate JWT token.
captainSchema.methods.generateAuthToken = function () {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    { id: this._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

module.exports = mongoose.model('Captain', captainSchema);
