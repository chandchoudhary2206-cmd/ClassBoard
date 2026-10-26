const express = require('express');
const router = express.Router();
const { getMaterials, getMaterial, createMaterial, updateMaterial, deleteMaterial, getMaterialsByClass } = require('../controllers/studyMaterialController');
const { protect, authorize } = require('../middleware/auth');
const { uploadStudyMaterial } = require('../middleware/upload');

router.get('/', protect, getMaterials);
router.get('/:id', protect, getMaterial);
router.post('/', protect, authorize('admin', 'teacher'), uploadStudyMaterial.single('file'), createMaterial);
router.put('/:id', protect, authorize('admin', 'teacher'), updateMaterial);
router.delete('/:id', protect, authorize('admin', 'teacher'), deleteMaterial);
router.get('/class/:classId', protect, getMaterialsByClass);

module.exports = router;
