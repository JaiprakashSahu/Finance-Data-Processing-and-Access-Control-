const Joi = require('joi');

const dashboardQuerySchema = Joi.object({
  userId: Joi.string().hex().length(24).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  type: Joi.string().valid('income', 'expense').optional(),
}).custom((value, helpers) => {
  if (value.startDate && value.endDate) {
    const start = new Date(value.startDate);
    const end = new Date(value.endDate);

    if (start > end) {
      return helpers.message('startDate cannot be greater than endDate');
    }
  }

  return value;
}, 'dashboard date range validation');

module.exports = {
  dashboardQuerySchema,
};
