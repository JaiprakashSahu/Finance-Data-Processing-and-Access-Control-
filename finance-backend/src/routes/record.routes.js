const express = require('express');
const {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} = require('../controllers/record.controller');
const { authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createRecordSchema,
  recordIdParamsSchema,
  updateRecordSchema,
  getRecordsQuerySchema,
} = require('../validation/record.validation');

const router = express.Router();

router.post('/', authorize(['admin']), validate(createRecordSchema), createRecord);
router.get('/', authorize(['admin', 'analyst', 'viewer']), validate(getRecordsQuerySchema, 'query'), getRecords);
router.get(
  '/:id',
  authorize(['admin', 'analyst', 'viewer']),
  validate(recordIdParamsSchema, 'params'),
  getRecordById
);
router.put(
  '/:id',
  authorize(['admin']),
  validate(recordIdParamsSchema, 'params'),
  validate(updateRecordSchema),
  updateRecord
);
router.delete(
  '/:id',
  authorize(['admin']),
  validate(recordIdParamsSchema, 'params'),
  deleteRecord
);

module.exports = router;
