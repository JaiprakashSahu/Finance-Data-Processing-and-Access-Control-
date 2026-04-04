const mongoose = require('mongoose');
const Record = require('../models/record.model');
const { sendSuccess, sendError } = require('../utils/response');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ensureObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getScopedUserId = (req) => {
  const requestRole = req.user && req.user.role;
  const requestUserId = req.user && req.user.id;
  const queryUserId = req.query.userId;

  if (requestRole === 'admin') {
    if (!queryUserId) {
      return { scopedUserId: null };
    }

    if (!ensureObjectId(queryUserId)) {
      return { error: 'Invalid userId filter' };
    }

    return { scopedUserId: queryUserId };
  }

  if (!requestUserId || !ensureObjectId(requestUserId)) {
    return { error: 'Authenticated user id is required for this action' };
  }

  return { scopedUserId: requestUserId };
};

const getMatchFilter = (scopedUserId) => {
  if (!scopedUserId) {
    return {};
  }

  return {
    userId: new mongoose.Types.ObjectId(scopedUserId),
  };
};

const getSummary = async (req, res) => {
  try {
    const { scopedUserId, error } = getScopedUserId(req);

    if (error) {
      return sendError(res, 400, 'Validation failed', error);
    }

    const match = getMatchFilter(scopedUserId);

    const [incomeAgg, expenseAgg] = await Promise.all([
      Record.aggregate([
        { $match: { ...match, type: 'income' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Record.aggregate([
        { $match: { ...match, type: 'expense' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalIncome = incomeAgg[0]?.total || 0;
    const totalExpense = expenseAgg[0]?.total || 0;

    return sendSuccess(res, 200, 'Dashboard summary fetched successfully', {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
    });
  } catch (_error) {
    return sendError(res, 500, 'Failed to fetch dashboard summary');
  }
};

const getTrends = async (req, res) => {
  try {
    const { scopedUserId, error } = getScopedUserId(req);

    if (error) {
      return sendError(res, 400, 'Validation failed', error);
    }

    const match = getMatchFilter(scopedUserId);

    const trends = await Record.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
    ]);

    const trendMap = new Map();

    MONTHS.forEach((month) => {
      trendMap.set(month, { month, income: 0, expense: 0 });
    });

    trends.forEach((entry) => {
      const monthIndex = entry._id.month - 1;
      const month = MONTHS[monthIndex];

      if (!month || !trendMap.has(month)) {
        return;
      }

      const bucket = trendMap.get(month);
      bucket[entry._id.type] = entry.total;
    });

    return sendSuccess(res, 200, 'Dashboard trends fetched successfully', Array.from(trendMap.values()));
  } catch (_error) {
    return sendError(res, 500, 'Failed to fetch dashboard trends');
  }
};

const getCategoryWise = async (req, res) => {
  try {
    const { scopedUserId, error } = getScopedUserId(req);

    if (error) {
      return sendError(res, 400, 'Validation failed', error);
    }

    const match = getMatchFilter(scopedUserId);

    const categoryTotals = await Record.aggregate([
      { $match: { ...match, type: 'expense' } },
      {
        $group: {
          _id: { $toLower: '$category' },
          total: { $sum: '$amount' },
        },
      },
    ]);

    const expense = {};

    categoryTotals.forEach((entry) => {
      expense[entry._id] = entry.total;
    });

    return sendSuccess(res, 200, 'Dashboard category-wise data fetched successfully', {
      expense,
    });
  } catch (_error) {
    return sendError(res, 500, 'Failed to fetch dashboard category-wise data');
  }
};

module.exports = {
  getSummary,
  getTrends,
  getCategoryWise,
};
