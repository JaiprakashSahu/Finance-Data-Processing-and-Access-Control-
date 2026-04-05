const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const {
  createUserService,
  listUsersService,
  updateUserRoleService,
} = require('../services/user.service');

const createUser = asyncHandler(async (req, res) => {
  const user = await createUserService(req.body);

  return sendSuccess(res, 201, 'User created successfully', user);
});

const getAllUsers = asyncHandler(async (_req, res) => {
  const users = await listUsersService();

  return sendSuccess(res, 200, 'Users fetched successfully', users);
});

const updateUserRole = asyncHandler(async (req, res) => {
  const updatedUser = await updateUserRoleService(req.params.id, req.body.role);

  return sendSuccess(res, 200, 'User role updated successfully', updatedUser);
});

module.exports = {
  createUser,
  getAllUsers,
  updateUserRole,
};
