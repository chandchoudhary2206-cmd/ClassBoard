const express = require('express');
const router = express.Router();
const { getAnnouncements, getAnnouncement, createAnnouncement, updateAnnouncement, deleteAnnouncement, getMyAnnouncements } = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');
const { uploadAnnouncement } = require('../middleware/upload');

router.get('/', protect, getAnnouncements);
router.get('/:id', protect, getAnnouncement);
router.post('/', protect, authorize('admin', 'teacher'), uploadAnnouncement.single('file'), createAnnouncement);
router.put('/:id', protect, authorize('admin', 'teacher'), updateAnnouncement);
router.delete('/:id', protect, authorize('admin', 'teacher'), deleteAnnouncement);
router.get('/my/all', protect, getMyAnnouncements);

module.exports = router;
