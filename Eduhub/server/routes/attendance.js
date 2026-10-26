const express = require('express');
const router = express.Router();
const { getAttendance, markAttendance, getMyAttendance, getAttendanceReport, updateAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getAttendance);
router.post('/mark', protect, authorize('admin', 'teacher'), markAttendance);
router.get('/my', protect, authorize('student'), getMyAttendance);
router.get('/report', protect, authorize('admin', 'teacher'), getAttendanceReport);
router.put('/:id', protect, authorize('admin', 'teacher'), updateAttendance);

module.exports = router;
