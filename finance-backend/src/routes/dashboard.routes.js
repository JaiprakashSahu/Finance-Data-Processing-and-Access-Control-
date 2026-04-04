const express = require('express');
const {
  getSummary,
  getTrends,
  getCategoryWise,
} = require('../controllers/dashboard.controller');
const { authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/summary', authorize(['admin', 'analyst', 'viewer']), getSummary);
router.get('/trends', authorize(['admin', 'analyst', 'viewer']), getTrends);
router.get('/category-wise', authorize(['admin', 'analyst', 'viewer']), getCategoryWise);

module.exports = router;
