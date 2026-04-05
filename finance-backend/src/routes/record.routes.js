const express = require('express');
const {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} = require('../controllers/record.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createRecordSchema,
  recordIdParamsSchema,
  updateRecordSchema,
  getRecordsQuerySchema,
} = require('../validation/record.validation');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize(['admin', 'analyst', 'viewer']), validate(createRecordSchema), createRecord);
router.get('/', authorize(['admin', 'analyst', 'viewer']), validate(getRecordsQuerySchema, 'query'), getRecords);
router.get(
  '/:id',
  authorize(['admin', 'analyst', 'viewer']),
  validate(recordIdParamsSchema, 'params'),
  getRecordById
);
router.put(
  '/:id',
  authorize(['admin', 'analyst', 'viewer']),
  validate(recordIdParamsSchema, 'params'),
  validate(updateRecordSchema),
  updateRecord
);
router.delete(
  '/:id',
  authorize(['admin', 'analyst', 'viewer']),
  validate(recordIdParamsSchema, 'params'),
  deleteRecord
);

module.exports = router;
