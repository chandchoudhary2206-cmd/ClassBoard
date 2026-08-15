const express = require('express');
const router = express.Router();
const { getAssignments, getAssignment, createAssignment, updateAssignment, deleteAssignment, closeAssignment } = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/auth');
const { uploadAssignment } = require('../middleware/upload');

router.get('/', protect, getAssignments);
router.get('/:id', protect, getAssignment);
router.post('/', protect, authorize('admin', 'teacher'), uploadAssignment.single('file'), createAssignment);
router.put('/:id', protect, authorize('admin', 'teacher'), updateAssignment);
router.delete('/:id', protect, authorize('admin', 'teacher'), deleteAssignment);
router.put('/:id/close', protect, authorize('admin', 'teacher'), closeAssignment);

module.exports = router;
