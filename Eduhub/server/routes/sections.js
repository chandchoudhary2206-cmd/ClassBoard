const express = require('express');
const router = express.Router();
const { getSections, getSection, createSection, updateSection, deleteSection } = require('../controllers/sectionController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getSections);
router.get('/:id', protect, getSection);
router.post('/', protect, authorize('admin'), createSection);
router.put('/:id', protect, authorize('admin'), updateSection);
router.delete('/:id', protect, authorize('admin'), deleteSection);

module.exports = router;
