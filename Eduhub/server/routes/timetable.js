const express = require('express');
const router = express.Router();
const { getTimetable, createEntry, updateEntry, deleteEntry, getTimetableBySection, getMyTimetable } = require('../controllers/timetableController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getTimetable);
router.post('/', protect, authorize('admin'), createEntry);
router.put('/:id', protect, authorize('admin'), updateEntry);
router.delete('/:id', protect, authorize('admin'), deleteEntry);
router.get('/section/:sectionId', protect, getTimetableBySection);
router.get('/my', protect, authorize('student'), getMyTimetable);

module.exports = router;
