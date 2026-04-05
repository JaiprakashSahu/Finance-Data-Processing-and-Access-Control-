const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/appError');
const { createUserService, sanitizeUser } = require('./user.service');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError(
      'Internal server error',
      500,
      'JWT_SECRET is missing in environment configuration'
    );
  }

  return secret;
};

const signToken = (payload) => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

const registerUserService = async (payload) => {
  const user = await createUserService({
    name: payload.name,
    email: payload.email,
    password: payload.password,
  });

  const token = signToken({
    userId: user._id.toString(),
    role: user.role,
  });

  return { user, token };
};

const loginUserService = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError('Authentication failed', 401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Authentication failed', 401, 'Invalid email or password');
  }

  if (user.status !== 'active') {
    throw new AppError('Authentication failed', 403, 'User account is inactive');
  }

  const sanitizedUser = sanitizeUser(user);
  const token = signToken({
    userId: user._id.toString(),
    role: user.role,
  });

  return {
    user: sanitizedUser,
    token,
  };
};

module.exports = {
  registerUserService,
  loginUserService,
};
