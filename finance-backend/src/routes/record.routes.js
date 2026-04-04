const express = require('express');
const {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} = require('../controllers/record.controller');
const { authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authorize(['admin']), createRecord);
router.get('/', authorize(['admin', 'analyst', 'viewer']), getRecords);
router.get('/:id', authorize(['admin', 'analyst', 'viewer']), getRecordById);
router.put('/:id', authorize(['admin']), updateRecord);
router.delete('/:id', authorize(['admin']), deleteRecord);

module.exports = router;
