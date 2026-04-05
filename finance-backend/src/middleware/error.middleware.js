const AppError = require('../utils/appError');
const { sendError } = require('../utils/response');
const { logError } = require('../utils/logger');

const notFoundHandler = (req, _res, next) => {
  next(
    new AppError(
      'Route not found',
      404,
      `No route found for ${req.method} ${req.originalUrl}`
    )
  );
};

const errorHandler = (error, req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const isServerError = statusCode >= 500;
  const isProduction = process.env.NODE_ENV === 'production';

  logError('Request failed', {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  });

  const message = isServerError && isProduction ? 'Internal server error' : error.message;
  const errorMessage = isServerError && isProduction
    ? 'Unexpected error occurred'
    : error.error || error.message;

  return sendError(res, statusCode, message, errorMessage);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
