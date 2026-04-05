const express = require('express');
const {
  getSummary,
  getTrends,
  getCategoryWise,
} = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { dashboardQuerySchema } = require('../validation/dashboard.validation');

const router = express.Router();

router.use(authenticate);

router.get('/summary', authorize(['admin', 'analyst', 'viewer']), validate(dashboardQuerySchema, 'query'), getSummary);
router.get('/trends', authorize(['admin', 'analyst', 'viewer']), validate(dashboardQuerySchema, 'query'), getTrends);
router.get(
  '/category-wise',
  authorize(['admin', 'analyst', 'viewer']),
  validate(dashboardQuerySchema, 'query'),
  getCategoryWise
);

module.exports = router;
