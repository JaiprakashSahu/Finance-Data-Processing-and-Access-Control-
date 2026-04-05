const sendSuccess = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    message,
    data,
    error: null,
  });
};

const sendError = (res, statusCode, message, error = message) => {
  return res.status(statusCode).json({
    message,
    data: null,
    error,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
