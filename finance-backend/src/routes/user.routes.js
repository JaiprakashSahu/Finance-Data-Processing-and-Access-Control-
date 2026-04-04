const express = require('express');
const {
  createUser,
  getAllUsers,
  updateUserRole,
} = require('../controllers/user.controller');
const { authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', createUser);
router.get('/', authorize(['admin']), getAllUsers);
router.patch('/:id/role', authorize(['admin']), updateUserRole);

module.exports = router;
