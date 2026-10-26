const express = require('express');
const router = express.Router();
const { getEnrollments, enrollStudent, enrollMultiple, bulkEnroll, unenrollStudent, getMyEnrollments } = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getEnrollments);
router.post('/single', protect, authorize('admin'), enrollStudent);
router.post('/multiple', protect, authorize('admin'), enrollMultiple);
router.post('/bulk', protect, authorize('admin'), bulkEnroll);
router.delete('/:id', protect, authorize('admin'), unenrollStudent);
router.get('/my', protect, authorize('student'), getMyEnrollments);

module.exports = router;
