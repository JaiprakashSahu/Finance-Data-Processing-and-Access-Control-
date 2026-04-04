const User = require('../models/user.model');

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
      return res.status(400).json({
        message: 'name, email, and password are required',
      });
    }

    if (role && !VALID_ROLES.includes(role)) {
      return res.status(400).json({
        message: 'Invalid role value',
      });
    }

    if (status && !VALID_STATUS.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status value',
      });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      status,
    });

    return res.status(201).json({
      message: 'User created successfully',
      data: sanitizeUser(newUser),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Email already exists',
      });
    }

    return res.status(500).json({
      message: 'Failed to create user',
    });
  }
};

const getAllUsers = async (_req, res) => {
  try {
    const users = await User.find().select('-password');

    return res.status(200).json({
      data: users,
    });
  } catch (_error) {
    return res.status(500).json({
      message: 'Failed to fetch users',
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({
        message: 'A valid role is required',
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(400).json({
        message: 'User not found',
      });
    }

    return res.status(200).json({
      message: 'User role updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid user id',
      });
    }

    return res.status(500).json({
      message: 'Failed to update user role',
    });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  updateUserRole,
};
