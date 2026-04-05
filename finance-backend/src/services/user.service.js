const mongoose = require('mongoose');
const User = require('../models/user.model');
const AppError = require('../utils/appError');

const sanitizeUser = (userDoc) => {
  const source = userDoc?.toObject ? userDoc.toObject() : userDoc;
  const user = { ...source };
  delete user.password;
  return user;
};

const ensureValidUserId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Validation failed', 400, 'Invalid user id');
  }
};

const createUserService = async (payload) => {
  const existingUser = await User.findOne({ email: payload.email });

  if (existingUser) {
    throw new AppError('Conflict', 409, 'Email already exists');
  }

  let user;

  try {
    user = await User.create(payload);
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('Conflict', 409, 'Email already exists');
    }

    throw error;
  }

  return sanitizeUser(user);
};

const listUsersService = async () => {
  const users = await User.find().sort({ createdAt: -1 }).select('-password');
  return users.map(sanitizeUser);
};

const updateUserRoleService = async (id, role) => {
  ensureValidUserId(id);

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { role },
    { returnDocument: 'after', runValidators: true }
  ).select('-password');

  if (!updatedUser) {
    throw new AppError('Validation failed', 404, 'User not found');
  }

  return sanitizeUser(updatedUser);
};

module.exports = {
  sanitizeUser,
  createUserService,
  listUsersService,
  updateUserRoleService,
};
