const express = require('express');
const {
  createUser,
  getAllUsers,
  updateUserRole,
} = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createUserSchema,
  updateUserRoleParamsSchema,
  updateUserRoleBodySchema,
} = require('../validation/user.validation');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize(['admin']), validate(createUserSchema), createUser);
router.get('/', authorize(['admin']), getAllUsers);
router.patch(
  '/:id/role',
  authorize(['admin']),
  validate(updateUserRoleParamsSchema, 'params'),
  validate(updateUserRoleBodySchema),
  updateUserRole
);

module.exports = router;
