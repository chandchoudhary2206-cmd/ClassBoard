const express = require('express');
const router = express.Router();
const { getSubmissions, getSubmission, submitAssignment, gradeSubmission, getMySubmissions } = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/auth');
const { uploadSubmission } = require('../middleware/upload');

router.get('/', protect, authorize('admin', 'teacher'), getSubmissions);
router.get('/:id', protect, getSubmission);
router.post('/', protect, authorize('student'), uploadSubmission.single('file'), submitAssignment);
router.put('/:id/grade', protect, authorize('admin', 'teacher'), gradeSubmission);
router.get('/my/all', protect, authorize('student'), getMySubmissions);

module.exports = router;
