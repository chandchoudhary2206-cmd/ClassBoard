const express = require('express');
const router = express.Router();
const { getSemesters, getSemester, createSemester, updateSemester, deleteSemester } = require('../controllers/semesterController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getSemesters);
router.get('/:id', protect, getSemester);
router.post('/', protect, authorize('admin'), createSemester);
router.put('/:id', protect, authorize('admin'), updateSemester);
router.delete('/:id', protect, authorize('admin'), deleteSemester);

module.exports = router;
