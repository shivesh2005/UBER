
const captainModel = require('../models/captain.model');

module.exports.createCaptain = async ({
  fullName,
  email,
  password,
  vehicle
}) => {
  if (!fullName || !email || !password || !vehicle) {
    throw new Error('All captain details are required');
  }

  const captain = await captainModel.create({
    fullName: {
      firstName: fullName.firstName,
      lastName: fullName.lastName
    },
    email: email.toLowerCase().trim(),
    password,
    vehicle: {
      color: vehicle.color,
      plate: vehicle.plate,
      model: vehicle.model,
      capacity: vehicle.capacity,
      vehicleType: vehicle.vehicleType
    }
  });

  return captain;
};
