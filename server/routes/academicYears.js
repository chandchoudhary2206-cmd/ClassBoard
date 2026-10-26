const express = require('express');
const router = express.Router();
const { getAcademicYears, getAcademicYear, createAcademicYear, updateAcademicYear, deleteAcademicYear } = require('../controllers/academicYearController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getAcademicYears);
router.get('/:id', protect, getAcademicYear);
router.post('/', protect, authorize('admin'), createAcademicYear);
router.put('/:id', protect, authorize('admin'), updateAcademicYear);
router.delete('/:id', protect, authorize('admin'), deleteAcademicYear);

module.exports = router;
