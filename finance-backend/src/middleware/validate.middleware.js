const AppError = require('../utils/appError');

const validate = (schema, target = 'body') => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const validationMessage = error.details.map((item) => item.message).join(', ');
      return next(new AppError('Validation failed', 400, validationMessage));
    }

    req[target] = value;
    return next();
  };
};

module.exports = validate;
