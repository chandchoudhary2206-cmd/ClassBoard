const express = require('express');
const router = express.Router();
const { getClasses, getClass, createClass, updateClass, deleteClass } = require('../controllers/classController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getClasses);
router.get('/:id', protect, getClass);
router.post('/', protect, authorize('admin'), createClass);
router.put('/:id', protect, authorize('admin'), updateClass);
router.delete('/:id', protect, authorize('admin'), deleteClass);

module.exports = router;
