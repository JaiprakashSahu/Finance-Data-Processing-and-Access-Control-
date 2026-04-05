const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const {
  createRecordService,
  getRecordsService,
  getRecordByIdService,
  updateRecordService,
  deleteRecordService,
} = require('../services/record.service');

const createRecord = asyncHandler(async (req, res) => {
  const record = await createRecordService(req.body, req.user);

  return sendSuccess(res, 201, 'Record created successfully', record);
});

const getRecords = asyncHandler(async (req, res) => {
  const result = await getRecordsService(req.query, req.user);

  return sendSuccess(res, 200, 'Records fetched successfully', result);
});

const getRecordById = asyncHandler(async (req, res) => {
  const record = await getRecordByIdService(req.params.id, req.user);

  return sendSuccess(res, 200, 'Record fetched successfully', record);
});

const updateRecord = asyncHandler(async (req, res) => {
  const record = await updateRecordService(req.params.id, req.body, req.user);

  return sendSuccess(res, 200, 'Record updated successfully', record);
});

const deleteRecord = asyncHandler(async (req, res) => {
  const deleted = await deleteRecordService(req.params.id, req.user);

  return sendSuccess(res, 200, 'Record deleted successfully', deleted);
});

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};
