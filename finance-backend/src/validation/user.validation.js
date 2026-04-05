const Joi = require('joi');

const objectIdSchema = Joi.string().hex().length(24);
const roleSchema = Joi.string().valid('viewer', 'analyst', 'admin');
const statusSchema = Joi.string().valid('active', 'inactive');

const createUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).max(128).required(),
  role: roleSchema.optional(),
  status: statusSchema.optional(),
});

const updateUserRoleParamsSchema = Joi.object({
  id: objectIdSchema.required(),
});

const updateUserRoleBodySchema = Joi.object({
  role: roleSchema.required(),
});

module.exports = {
  createUserSchema,
  updateUserRoleParamsSchema,
  updateUserRoleBodySchema,
};
