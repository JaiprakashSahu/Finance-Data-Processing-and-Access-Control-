const mongoose = require('mongoose');
const Record = require('../models/record.model');
const AppError = require('../utils/appError');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ensureObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError('Validation failed', 400, `Invalid ${fieldName}`);
  }
};

const getScopedUserId = (queryUserId, authUser) => {
  if (authUser.role === 'admin') {
    if (!queryUserId) {
      return null;
    }

    ensureObjectId(queryUserId, 'userId filter');
    return queryUserId;
  }

  ensureObjectId(authUser.id, 'authenticated user id');
  return authUser.id;
};

const getMatchFilter = (scopedUserId) => {
  if (!scopedUserId) {
    return {};
  }

  return {
    userId: new mongoose.Types.ObjectId(scopedUserId),
  };
};

const getSummaryService = async ({ userId }, authUser) => {
  const scopedUserId = getScopedUserId(userId, authUser);
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

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
  };
};

const getTrendsService = async ({ userId }, authUser) => {
  const scopedUserId = getScopedUserId(userId, authUser);
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

    if (!month) {
      return;
    }

    const bucket = trendMap.get(month);
    bucket[entry._id.type] = entry.total;
  });

  return Array.from(trendMap.values());
};

const getCategoryWiseService = async ({ userId }, authUser) => {
  const scopedUserId = getScopedUserId(userId, authUser);
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

  return { expense };
};

module.exports = {
  getSummaryService,
  getTrendsService,
  getCategoryWiseService,
};
