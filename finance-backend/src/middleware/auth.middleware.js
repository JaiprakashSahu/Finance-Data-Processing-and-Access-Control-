const AppError = require('../utils/appError');

const ALLOWED_ROLES = ['admin', 'analyst', 'viewer'];
const DEFAULT_MOCK_USER = Object.freeze({
  id: '000000000000000000000001',
  role: 'admin',
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

const authenticate = (req, _res, next) => {
  req.user = {
    id: resolveMockUserId(req.headers['x-user-id']),
    role: resolveMockRole(req.headers['x-user-role']),
  };

  return next();
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
