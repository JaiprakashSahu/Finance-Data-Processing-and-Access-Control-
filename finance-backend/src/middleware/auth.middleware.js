const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/appError');

const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(
        new AppError('Authentication failed', 401, 'Authorization token is missing')
      );
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return next(
        new AppError(
          'Internal server error',
          500,
          'JWT_SECRET is missing in environment configuration'
        )
      );
    }

    const decoded = jwt.verify(token, jwtSecret);

    const user = await User.findById(decoded.userId).select('role status');

    if (!user) {
      return next(new AppError('Authentication failed', 401, 'User does not exist'));
    }

    if (user.status !== 'active') {
      return next(new AppError('Authentication failed', 403, 'User account is inactive'));
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
    };

    return next();
  } catch (_error) {
    return next(new AppError('Authentication failed', 401, 'Invalid or expired token'));
  }
};

const authorize = (allowedRoles = []) => {
  return (req, _res, next) => {
    const userRole = req.user && req.user.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return next(
        new AppError(
          'Forbidden: insufficient permissions',
          403,
          'Role is not authorized for this action'
        )
      );
    }

    return next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
