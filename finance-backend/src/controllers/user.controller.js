const User = require('../models/user.model');
const { sendSuccess, sendError } = require('../utils/response');

const VALID_ROLES = ['viewer', 'analyst', 'admin'];
const VALID_STATUS = ['active', 'inactive'];

const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject();
  delete user.password;
  return user;
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;

    if (!name || !email || !password) {
      return sendError(
        res,
        400,
        'Validation failed',
        'name, email, and password are required'
      );
    }

    if (role && !VALID_ROLES.includes(role)) {
      return sendError(res, 400, 'Validation failed', 'Invalid role value');
    }

    if (status && !VALID_STATUS.includes(status)) {
      return sendError(res, 400, 'Validation failed', 'Invalid status value');
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      status,
    });

    return sendSuccess(res, 201, 'User created successfully', sanitizeUser(newUser));
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 400, 'Validation failed', 'Email already exists');
    }

    if (error.name === 'ValidationError') {
      const firstMessage = Object.values(error.errors)[0]?.message || 'Invalid input';
      return sendError(res, 400, 'Validation failed', firstMessage);
    }

    return sendError(res, 500, 'Failed to create user');
  }
};

const getAllUsers = async (_req, res) => {
  try {
    const users = await User.find().select('-password');

    return sendSuccess(res, 200, 'Users fetched successfully', users);
  } catch (_error) {
    return sendError(res, 500, 'Failed to fetch users');
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !VALID_ROLES.includes(role)) {
      return sendError(res, 400, 'Validation failed', 'A valid role is required');
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { returnDocument: 'after', runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return sendError(res, 400, 'Validation failed', 'User not found');
    }

    return sendSuccess(res, 200, 'User role updated successfully', updatedUser);
  } catch (error) {
    if (error.name === 'CastError') {
      return sendError(res, 400, 'Validation failed', 'Invalid user id');
    }

    return sendError(res, 500, 'Failed to update user role');
  }
};

module.exports = {
  createUser,
  getAllUsers,
  updateUserRole,
};
