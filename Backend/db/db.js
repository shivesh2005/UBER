const mongoose = require('mongoose');

async function connectToDB() {
  try {
    if (!process.env.DB_CONNECT) {
      throw new Error('DB_CONNECT is missing from .env');
    }

    await mongoose.connect(process.env.DB_CONNECT);

    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
}

module.exports = connectToDB;