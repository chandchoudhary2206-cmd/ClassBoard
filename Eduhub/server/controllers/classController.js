const Class = require('../models/Class');
const Enrollment = require('../models/Enrollment');
const StudyMaterial = require('../models/StudyMaterial');
const { paginate, buildFilter } = require('../utils/helpers');

const populateFields = [
  { path: 'subject', select: 'name code' },
  { path: 'teacher', select: 'teacherId' },
  { path: 'section', select: 'name' },
  { path: 'semester', select: 'name number' },
  { path: 'academicYear', select: 'year' },
];

const getClasses = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

    const filter = buildFilter(req.query, ['section', 'teacher', 'subject', 'semester', 'academicYear', 'isActive']);

    const [classes, total] = await Promise.all([
      Class.find(filter).populate(populateFields).skip(skip).limit(pageLimit).sort({ createdAt: -1 }),
      Class.countDocuments(filter),
    ]);

    res.json({
      classes,
      pagination: { page: currentPage, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getClass = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id).populate(populateFields);
    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json({ class: cls });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createClass = async (req, res, next) => {
  try {
    const { name, subject, teacher, section, semester, academicYear, schedule, room } = req.body;

    const cls = await Class.create({ name, subject, teacher, section, semester, academicYear, schedule, room });

    const populated = await Class.findById(cls._id).populate(populateFields);

    res.status(201).json({ class: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateClass = async (req, res, next) => {
  try {
    const { name, subject, teacher, section, semester, academicYear, schedule, room, isActive } = req.body;

    const cls = await Class.findByIdAndUpdate(
      req.params.id,
      { name, subject, teacher, section, semester, academicYear, schedule, room, isActive },
      { new: true, runValidators: true }
    ).populate(populateFields);

    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json({ class: cls });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteClass = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const [enrollmentCount, materialCount] = await Promise.all([
      Enrollment.countDocuments({ class: req.params.id }),
      StudyMaterial.countDocuments({ class: req.params.id }),
    ]);

    if (enrollmentCount > 0 || materialCount > 0) {
      return res.status(400).json({
        message: `Cannot delete class. ${enrollmentCount} enrollment(s) and ${materialCount} study material(s) are associated with it.`,
      });
    }

    await Class.findByIdAndDelete(req.params.id);

    res.json({ message: 'Class deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getClasses, getClass, createClass, updateClass, deleteClass };
