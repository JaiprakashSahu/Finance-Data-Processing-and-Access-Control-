const mockAuth = (req, _res, next) => {
  const roleFromHeader = req.headers['x-user-role'];
  req.user = {
    role: roleFromHeader || process.env.MOCK_USER_ROLE || 'admin',
  };
  next();
};

const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    const userRole = req.user && req.user.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: 'Forbidden: insufficient permissions',
      });
    }

    next();
  };
};

module.exports = {
  mockAuth,
  authorize,
};
