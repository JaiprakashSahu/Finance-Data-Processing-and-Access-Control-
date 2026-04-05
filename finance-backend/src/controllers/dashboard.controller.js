const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const {
  getSummaryService,
  getTrendsService,
  getCategoryWiseService,
} = require('../services/dashboard.service');

const getSummary = asyncHandler(async (req, res) => {
  const summary = await getSummaryService(req.query, req.user);

  return sendSuccess(res, 200, 'Dashboard summary fetched successfully', summary);
});

const getTrends = asyncHandler(async (req, res) => {
  const trends = await getTrendsService(req.query, req.user);

  return sendSuccess(res, 200, 'Dashboard trends fetched successfully', trends);
});

const getCategoryWise = asyncHandler(async (req, res) => {
  const categoryWise = await getCategoryWiseService(req.query, req.user);

  return sendSuccess(res, 200, 'Dashboard category-wise data fetched successfully', categoryWise);
});

module.exports = {
  getSummary,
  getTrends,
  getCategoryWise,
};
