require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { logError, logInfo } = require('./utils/logger');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      logInfo('Server started', { port: PORT });
    });
  } catch (error) {
    logError('Failed to start server', { message: error.message });
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason) => {
  logError('Unhandled promise rejection', { reason: reason?.message || reason });
});

startServer();
