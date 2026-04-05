const mongoose = require('mongoose');
const Record = require('../models/record.model');
const AppError = require('../utils/appError');

const VALID_TYPES = ['income', 'expense'];

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

const parseDate = (value, fieldName) => {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError('Validation failed', 400, `Invalid ${fieldName}`);
  }

  return parsedDate;
};

const buildDashboardMatch = (
  { userId, startDate, endDate, type },
  authUser,
  { defaultType = null } = {}
) => {
  const scopedUserId = getScopedUserId(userId, authUser);
  const match = getMatchFilter(scopedUserId);

  if (startDate || endDate) {
    const dateFilter = {};

    if (startDate) {
      dateFilter.$gte = parseDate(startDate, 'startDate');
    }

    if (endDate) {
      dateFilter.$lte = parseDate(endDate, 'endDate');
    }

    if (dateFilter.$gte && dateFilter.$lte && dateFilter.$gte > dateFilter.$lte) {
      throw new AppError(
        'Validation failed',
        400,
        'startDate cannot be greater than endDate'
      );
    }

    match.date = dateFilter;
  }

  const resolvedType = type || defaultType;

  if (resolvedType) {
    if (!VALID_TYPES.includes(resolvedType)) {
      throw new AppError('Validation failed', 400, 'Invalid type filter');
    }

    match.type = resolvedType;
  }

  return {
    match,
    resolvedType,
  };
};

const getSummaryService = async (query, authUser) => {
  const { match } = buildDashboardMatch(query, authUser);

  const totalsByType = await Record.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  let totalIncome = 0;
  let totalExpense = 0;

  totalsByType.forEach((entry) => {
    if (entry._id === 'income') {
      totalIncome = entry.total;
    }

    if (entry._id === 'expense') {
      totalExpense = entry.total;
    }
  });

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
  };
};

const getTrendsService = async (query, authUser) => {
  const { match } = buildDashboardMatch(query, authUser);

  const trends = await Record.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
      },
    },
  ]);

  const trendMap = new Map();

  trends.forEach((entry) => {
    const year = entry._id.year;
    const monthNumber = entry._id.month;
    const month = `${year}-${String(monthNumber).padStart(2, '0')}`;

    if (!trendMap.has(month)) {
      trendMap.set(month, {
        month,
        year,
        monthNumber,
        income: 0,
        expense: 0,
      });
    }

    const bucket = trendMap.get(month);
    bucket[entry._id.type] = entry.total;
  });

  return Array.from(trendMap.values());
};

const getCategoryWiseService = async (query, authUser) => {
  const { match, resolvedType } = buildDashboardMatch(query, authUser, {
    defaultType: 'expense',
  });
  const effectiveType = resolvedType || 'expense';

  const categoryTotals = await Record.aggregate([
    { $match: match },
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

  return {
    type: effectiveType,
    categories: expense,
    expense: effectiveType === 'expense' ? expense : {},
    income: effectiveType === 'income' ? expense : {},
  };
};

module.exports = {
  getSummaryService,
  getTrendsService,
  getCategoryWiseService,
};
