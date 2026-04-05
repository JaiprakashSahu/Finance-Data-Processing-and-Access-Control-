const mongoose = require('mongoose');
const Record = require('../models/record.model');
const User = require('../models/user.model');
const AppError = require('../utils/appError');

const VALID_TYPES = ['income', 'expense'];

const ensureObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError('Validation failed', 400, `Invalid ${fieldName}`);
  }
};

const parseDate = (value, fieldName) => {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError('Validation failed', 400, `Invalid ${fieldName}`);
  }

  return parsedDate;
};

const ensureOwnership = (record, authUser) => {
  if (authUser.role === 'admin') {
    return;
  }

  if (record.userId.toString() !== authUser.id) {
    throw new AppError(
      'Forbidden: insufficient permissions',
      403,
      'You can only access your own records'
    );
  }
};

const resolveRecordOwner = async (payloadUserId, authUser) => {
  if (authUser.role !== 'admin') {
    if (payloadUserId && payloadUserId !== authUser.id) {
      throw new AppError(
        'Forbidden: insufficient permissions',
        403,
        'You can only create records for your own account'
      );
    }

    return authUser.id;
  }

  return payloadUserId || authUser.id;
};

const createRecordService = async (payload, authUser) => {
  const userId = await resolveRecordOwner(payload.userId, authUser);

  ensureObjectId(userId, 'userId');

  const userExists = await User.exists({ _id: userId });
  if (!userExists) {
    throw new AppError('Validation failed', 400, 'User not found for userId');
  }

  const parsedDate = parseDate(payload.date, 'date');

  const record = await Record.create({
    userId,
    amount: payload.amount,
    type: payload.type,
    category: payload.category,
    date: parsedDate,
    notes: payload.notes,
  });

  return record;
};

const buildRecordFilters = (query, authUser) => {
  const filters = {};

  if (query.type) {
    if (!VALID_TYPES.includes(query.type)) {
      throw new AppError('Validation failed', 400, 'Invalid type filter');
    }

    filters.type = query.type;
  }

  if (query.category) {
    filters.category = query.category;
  }

  if (query.startDate || query.endDate) {
    const dateFilter = {};

    if (query.startDate) {
      dateFilter.$gte = parseDate(query.startDate, 'startDate');
    }

    if (query.endDate) {
      dateFilter.$lte = parseDate(query.endDate, 'endDate');
    }

    if (dateFilter.$gte && dateFilter.$lte && dateFilter.$gte > dateFilter.$lte) {
      throw new AppError(
        'Validation failed',
        400,
        'startDate cannot be greater than endDate'
      );
    }

    filters.date = dateFilter;
  }

  if (authUser.role === 'admin') {
    if (query.userId) {
      ensureObjectId(query.userId, 'userId');
      filters.userId = query.userId;
    }
  } else {
    filters.userId = authUser.id;
  }

  return filters;
};

const getRecordsService = async (query, authUser) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const filters = buildRecordFilters(query, authUser);
  const skip = (page - 1) * limit;

  const [records, totalItems] = await Promise.all([
    Record.find(filters).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit),
    Record.countDocuments(filters),
  ]);

  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

  return {
    records,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: totalPages > 0 && page < totalPages,
      hasPrevPage: totalPages > 0 && page > 1,
    },
  };
};

const getRecordByIdService = async (id, authUser) => {
  ensureObjectId(id, 'record id');

  const record = await Record.findById(id);

  if (!record) {
    throw new AppError('Record not found', 404, 'Record not found');
  }

  ensureOwnership(record, authUser);

  return record;
};

const updateRecordService = async (id, payload, authUser) => {
  ensureObjectId(id, 'record id');

  const record = await Record.findById(id);

  if (!record) {
    throw new AppError('Record not found', 404, 'Record not found');
  }

  ensureOwnership(record, authUser);

  if (payload.userId) {
    if (authUser.role !== 'admin') {
      throw new AppError(
        'Forbidden: insufficient permissions',
        403,
        'Only admin can reassign records to another user'
      );
    }

    ensureObjectId(payload.userId, 'userId');

    const userExists = await User.exists({ _id: payload.userId });
    if (!userExists) {
      throw new AppError('Validation failed', 400, 'User not found for userId');
    }

    record.userId = payload.userId;
  }

  if (payload.amount !== undefined) {
    record.amount = payload.amount;
  }

  if (payload.type) {
    record.type = payload.type;
  }

  if (payload.category) {
    record.category = payload.category;
  }

  if (payload.date) {
    record.date = parseDate(payload.date, 'date');
  }

  if (payload.notes !== undefined) {
    record.notes = payload.notes;
  }

  const updatedRecord = await record.save();
  return updatedRecord;
};

const deleteRecordService = async (id, authUser) => {
  ensureObjectId(id, 'record id');

  const record = await Record.findById(id);

  if (!record) {
    throw new AppError('Record not found', 404, 'Record not found');
  }

  ensureOwnership(record, authUser);

  await Record.deleteOne({ _id: id });

  return {
    id,
  };
};

module.exports = {
  createRecordService,
  getRecordsService,
  getRecordByIdService,
  updateRecordService,
  deleteRecordService,
};
