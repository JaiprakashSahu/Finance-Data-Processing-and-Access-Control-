const { sendError } = require('../utils/response');

const mockAuth = (req, _res, next) => {
  const roleFromHeader = req.headers['x-user-role'];
  const userIdFromHeader = req.headers['x-user-id'];
  req.user = {
    role: roleFromHeader || process.env.MOCK_USER_ROLE || 'admin',
    id: userIdFromHeader || process.env.MOCK_USER_ID || null,
  };
  next();
};

const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    const userRole = req.user && req.user.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return sendError(
        res,
        403,
        'Forbidden: insufficient permissions',
        'Role is not authorized for this action'
      );
    }

    next();
  };
};

module.exports = {
  mockAuth,
  authorize,
};
