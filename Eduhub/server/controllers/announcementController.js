const Announcement = require('../models/Announcement');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const fs = require('fs');
const { paginate, buildFilter } = require('../utils/helpers');

const getAnnouncements = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

    const filter = buildFilter(req.query, ['targetRole', 'class', 'section', 'type', 'isActive']);

    const [announcements, total] = await Promise.all([
      Announcement.find(filter)
        .populate('createdBy', 'name')
        .skip(skip)
        .limit(pageLimit)
        .sort({ createdAt: -1 }),
      Announcement.countDocuments(filter),
    ]);

    res.json({
      announcements,
      pagination: { page: currentPage, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate('createdBy', 'name');
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json({ announcement });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, type, targetRole, class: classId, section } = req.body;

    const announcementData = {
      title,
      content,
      type,
      targetRole,
      class: classId,
      section,
      createdBy: req.user.id,
    };

    if (req.file) {
      announcementData.fileUrl = req.file.path;
    }

    const announcement = await Announcement.create(announcementData);

    const populated = await Announcement.findById(announcement._id).populate('createdBy', 'name');

    res.status(201).json({ announcement: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateAnnouncement = async (req, res, next) => {
  try {
    const { title, content, type, targetRole, class: classId, section, isActive } = req.body;

    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, content, type, targetRole, class: classId, section, isActive },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json({ announcement });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    if (announcement.fileUrl) {
      fs.unlink(announcement.fileUrl, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Error deleting file:', err);
        }
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.json({ message: 'Announcement deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyAnnouncements = async (req, res, next) => {
  try {
    const user = req.user;

    let filter = { isActive: true };

    if (user.role === 'admin') {
      filter.$or = [{ targetRole: 'all' }, { targetRole: 'admin' }];
    } else if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: user.id });
      filter.$or = [
        { targetRole: 'all' },
        { targetRole: 'teachers' },
      ];
      if (teacher) {
        filter.$or.push({ section: teacher.section });
      }
    } else if (user.role === 'student') {
      const student = await Student.findOne({ user: user.id });
      filter.$or = [
        { targetRole: 'all' },
        { targetRole: 'students' },
      ];
      if (student) {
        filter.$or.push({ section: student.section });
      }
    }

    const announcements = await Announcement.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ announcements });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAnnouncements, getAnnouncement, createAnnouncement, updateAnnouncement, deleteAnnouncement, getMyAnnouncements };
