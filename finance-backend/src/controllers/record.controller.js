const mongoose = require('mongoose');
const Record = require('../models/record.model');
const User = require('../models/user.model');
const { sendSuccess, sendError } = require('../utils/response');

const VALID_TYPES = ['income', 'expense'];

const isAdmin = (req) => req.user && req.user.role === 'admin';

const parseDate = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const ensureObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const buildFilters = (req) => {
  const { type, category, startDate, endDate, userId } = req.query;
  const query = {};

  if (type) {
    if (!VALID_TYPES.includes(type)) {
      return { error: 'Invalid type filter' };
    }
    query.type = type;
  }

  if (category) {
    query.category = category;
  }

  if (startDate || endDate) {
    const dateFilter = {};

    if (startDate) {
      const parsedStartDate = parseDate(startDate);
      if (!parsedStartDate) {
        return { error: 'Invalid startDate filter' };
      }
      dateFilter.$gte = parsedStartDate;
    }

    if (endDate) {
      const parsedEndDate = parseDate(endDate);
      if (!parsedEndDate) {
        return { error: 'Invalid endDate filter' };
      }
      dateFilter.$lte = parsedEndDate;
    }

    if (dateFilter.$gte && dateFilter.$lte && dateFilter.$gte > dateFilter.$lte) {
      return { error: 'startDate cannot be greater than endDate' };
    }

    query.date = dateFilter;
  }

  if (isAdmin(req)) {
    if (userId) {
      if (!ensureObjectId(userId)) {
        return { error: 'Invalid userId filter' };
      }
      query.userId = userId;
    }
  } else {
    const requestUserId = req.user && req.user.id;

    if (!requestUserId || !ensureObjectId(requestUserId)) {
      return { error: 'Authenticated user id is required for this action' };
    }

    query.userId = requestUserId;
  }

  return { query };
};

const createRecord = async (req, res) => {
  try {
    const { userId, amount, type, category, date, notes } = req.body;

    if (!userId || amount == null || !type || !category || !date) {
      return sendError(
        res,
        400,
        'Validation failed',
        'userId, amount, type, category, and date are required'
      );
    }

    if (!ensureObjectId(userId)) {
      return sendError(res, 400, 'Validation failed', 'Invalid userId');
    }

    if (!VALID_TYPES.includes(type)) {
      return sendError(res, 400, 'Validation failed', 'Invalid type value');
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return sendError(res, 400, 'Validation failed', 'amount must be greater than 0');
    }

    const parsedDate = parseDate(date);
    if (!parsedDate) {
      return sendError(res, 400, 'Validation failed', 'Invalid date value');
    }

    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      return sendError(res, 400, 'Validation failed', 'User not found for userId');
    }

    const record = await Record.create({
      userId,
      amount: numericAmount,
      type,
      category,
      date: parsedDate,
      notes,
    });

    return sendSuccess(res, 201, 'Record created successfully', record);
  } catch (_error) {
    return sendError(res, 500, 'Failed to create record');
  }
};

const getRecords = async (req, res) => {
  try {
    const { query, error } = buildFilters(req);

    if (error) {
      return sendError(res, 400, 'Validation failed', error);
    }

    const records = await Record.find(query).sort({ date: -1, createdAt: -1 });

    return sendSuccess(res, 200, 'Records fetched successfully', records);
  } catch (_error) {
    return sendError(res, 500, 'Failed to fetch records');
  }
};

const getRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ensureObjectId(id)) {
      return sendError(res, 400, 'Validation failed', 'Invalid record id');
    }

    const record = await Record.findById(id);

    if (!record) {
      return sendError(res, 404, 'Record not found', 'Record not found');
    }

    if (!isAdmin(req)) {
      const requestUserId = req.user && req.user.id;

      if (!requestUserId || !ensureObjectId(requestUserId)) {
        return sendError(
          res,
          400,
          'Validation failed',
          'Authenticated user id is required for this action'
        );
      }

      if (record.userId.toString() !== requestUserId) {
        return sendError(
          res,
          403,
          'Forbidden: insufficient permissions',
          'You can only access your own records'
        );
      }
    }

    return sendSuccess(res, 200, 'Record fetched successfully', record);
  } catch (_error) {
    return sendError(res, 500, 'Failed to fetch record');
  }
};

const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, amount, type, category, date, notes } = req.body;

    if (!ensureObjectId(id)) {
      return sendError(res, 400, 'Validation failed', 'Invalid record id');
    }

    const updatePayload = {};

    if (userId !== undefined) {
      if (!ensureObjectId(userId)) {
        return sendError(res, 400, 'Validation failed', 'Invalid userId');
      }

      const userExists = await User.exists({ _id: userId });
      if (!userExists) {
        return sendError(res, 400, 'Validation failed', 'User not found for userId');
      }

      updatePayload.userId = userId;
    }

    if (amount !== undefined) {
      const numericAmount = Number(amount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        return sendError(res, 400, 'Validation failed', 'amount must be greater than 0');
      }
      updatePayload.amount = numericAmount;
    }

    if (type !== undefined) {
      if (!VALID_TYPES.includes(type)) {
        return sendError(res, 400, 'Validation failed', 'Invalid type value');
      }
      updatePayload.type = type;
    }

    if (category !== undefined) {
      if (!String(category).trim()) {
        return sendError(res, 400, 'Validation failed', 'category cannot be empty');
      }
      updatePayload.category = category;
    }

    if (date !== undefined) {
      const parsedDate = parseDate(date);
      if (!parsedDate) {
        return sendError(res, 400, 'Validation failed', 'Invalid date value');
      }
      updatePayload.date = parsedDate;
    }

    if (notes !== undefined) {
      updatePayload.notes = notes;
    }

    if (!Object.keys(updatePayload).length) {
      return sendError(res, 400, 'Validation failed', 'No valid fields provided to update');
    }

    const updatedRecord = await Record.findByIdAndUpdate(id, updatePayload, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!updatedRecord) {
      return sendError(res, 404, 'Record not found', 'Record not found');
    }

    return sendSuccess(res, 200, 'Record updated successfully', updatedRecord);
  } catch (_error) {
    return sendError(res, 500, 'Failed to update record');
  }
};

const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ensureObjectId(id)) {
      return sendError(res, 400, 'Validation failed', 'Invalid record id');
    }

    const deletedRecord = await Record.findByIdAndDelete(id);

    if (!deletedRecord) {
      return sendError(res, 404, 'Record not found', 'Record not found');
    }

    return sendSuccess(res, 200, 'Record deleted successfully', {
      id: deletedRecord._id,
    });
  } catch (_error) {
    return sendError(res, 500, 'Failed to delete record');
  }
};

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};
