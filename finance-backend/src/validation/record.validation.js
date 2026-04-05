const Joi = require('joi');

const objectIdSchema = Joi.string().hex().length(24);

const createRecordSchema = Joi.object({
  userId: objectIdSchema.optional(),
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('income', 'expense').required(),
  category: Joi.string().trim().min(1).max(64).required(),
  date: Joi.date().iso().required(),
  notes: Joi.string().allow('').max(500).optional(),
});

const recordIdParamsSchema = Joi.object({
  id: objectIdSchema.required(),
});

const updateRecordSchema = Joi.object({
  userId: objectIdSchema.optional(),
  amount: Joi.number().positive().optional(),
  type: Joi.string().valid('income', 'expense').optional(),
  category: Joi.string().trim().min(1).max(64).optional(),
  date: Joi.date().iso().optional(),
  notes: Joi.string().allow('').max(500).optional(),
}).min(1);

const getRecordsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  type: Joi.string().valid('income', 'expense').optional(),
  category: Joi.string().trim().min(1).max(64).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  userId: objectIdSchema.optional(),
});

module.exports = {
  createRecordSchema,
  recordIdParamsSchema,
  updateRecordSchema,
  getRecordsQuerySchema,
};
