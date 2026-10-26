const express = require('express');
const router = express.Router();
const { getAttendanceReport, getGradeReport, getClassReport, getStudentReport, getTeacherReport, getDashboardStats } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/attendance', protect, authorize('admin', 'teacher'), getAttendanceReport);
router.get('/grades', protect, authorize('admin', 'teacher'), getGradeReport);
router.get('/class/:classId', protect, authorize('admin', 'teacher'), getClassReport);
router.get('/student/:studentId', protect, authorize('admin', 'teacher', 'student'), getStudentReport);
router.get('/teacher/:teacherId', protect, authorize('admin', 'teacher'), getTeacherReport);
router.get('/stats', protect, authorize('admin'), getDashboardStats);

module.exports = router;
