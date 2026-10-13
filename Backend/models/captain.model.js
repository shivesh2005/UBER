const mongoose = require('/mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const captainSchema = new mongoose.Schema({
  fullName: {
    firstName:{
      type: String,
      required: true,
      minLength: [3 , 'Firstname must be atleast 3 character long'],
    },
    lastName: {
      type: String,
      required: true,
      minLength: [3 , 'Lastname must be atleast 3 character long'],
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,  
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
  },
  socketId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active' , 'inactive'],
    default: 'inactive',
  },
  vehicle:{
    color: {
      type: String,
      required: true,
      minLength: [3 , 'Color must be atleast 3 character long'],
    },
    plate: {
      type: String,
      required: true,
      minLength: [3 , 'Plate must be atleast 3 character long'],  
    },
    model: {
      type: String,
      required: true,
      minLength: [3 , 'Model must be atleast 3 character long'],
    },
    capacity: {
      type: Number,
      required: true,
      min: [1 , 'Capacity must be atleast 1'],  
    },
    vehicleType: {
      type: String,
      required: true,
      enum: ['car' , 'bike' , 'van'], 
    }
  },
  location:{
    lat:{
      type: Number,
    },
    long:{
      type: Number,
    }
  }
})
captainSchema.methods.generateAuthTokens = function() {
 const token = jwt.sign({ id: this._id }, 'process.env.JWT_SECRET', { expiresIn: '1d' });
 return token;
}
captainSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
}
const capatainModel = mongoose.model('Captain' , CaptainSchema);
module.exports = capatainModel;