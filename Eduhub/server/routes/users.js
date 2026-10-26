const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUser, deleteUser, updatePassword } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, getUser);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.put('/password/:id', protect, updatePassword);

module.exports = router;
