const mongoose = require('mongoose');
const { logError, logInfo } = require('../utils/logger');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logInfo('MongoDB connected');
  } catch (error) {
    logError('DB connection failed', { message: error.message });
    throw error;
  }
};

module.exports = connectDB;
