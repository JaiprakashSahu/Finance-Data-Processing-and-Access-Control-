const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { registerUserService, loginUserService } = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
  const result = await registerUserService(req.body);

  return sendSuccess(res, 201, 'User registered successfully', result);
});

const login = asyncHandler(async (req, res) => {
  const result = await loginUserService(req.body);

  return sendSuccess(res, 200, 'Login successful', result);
});

module.exports = {
  register,
  login,
};
