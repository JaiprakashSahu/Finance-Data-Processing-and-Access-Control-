const AppError = require('../utils/appError');
const User = require('../models/user.model');
const mongoose = require('mongoose');

const ALLOWED_ROLES = ['admin', 'analyst', 'viewer'];
const DEFAULT_MOCK_USER = Object.freeze({
  id: '000000000000000000000001',
  role: 'viewer',
  status: 'active',
});

const resolveMockRole = (headerRole) => {
  const normalizedRole = String(headerRole || '')
    .trim()
    .toLowerCase();

  if (ALLOWED_ROLES.includes(normalizedRole)) {
    return normalizedRole;
  }

  return DEFAULT_MOCK_USER.role;
};

const resolveMockUserId = (headerUserId) => {
  const normalizedUserId = String(headerUserId || '').trim();
  return normalizedUserId || DEFAULT_MOCK_USER.id;
};

const authenticate = async (req, _res, next) => {
  try {
    const resolvedUserId = resolveMockUserId(req.headers['x-user-id']);
    const resolvedRole = resolveMockRole(req.headers['x-user-role']);

    req.user = {
      id: resolvedUserId,
      role: resolvedRole,
      status: DEFAULT_MOCK_USER.status,
    };

    if (mongoose.Types.ObjectId.isValid(resolvedUserId)) {
      const user = await User.findById(resolvedUserId).select('status');

      if (user) {
        req.user.status = user.status;

        if (user.status === 'inactive') {
          return next(
            new AppError(
              'Forbidden: inactive account',
              403,
              'Inactive users are not allowed to access this resource'
            )
          );
        }
      }
    }

    return next();
  } catch (error) {
    return next(error);
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
