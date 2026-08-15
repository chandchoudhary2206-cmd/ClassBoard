const Subject = require('../models/Subject');
const Class = require('../models/Class');
const { paginate, buildFilter } = require('../utils/helpers');

const getSubjects = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

    const filter = buildFilter(req.query, ['course', 'semester', 'department', 'isActive']);

    const [subjects, total] = await Promise.all([
      Subject.find(filter)
        .populate('course', 'name code')
        .populate('semester', 'name number')
        .populate('department', 'name code')
        .skip(skip)
        .limit(pageLimit)
        .sort({ createdAt: -1 }),
      Subject.countDocuments(filter),
    ]);

    res.json({
      subjects,
      pagination: { page: currentPage, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('course', 'name code')
      .populate('semester', 'name number')
      .populate('department', 'name code');
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json({ subject });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createSubject = async (req, res, next) => {
  try {
    const { name, code, description, course, semester, department, credits } = req.body;

    if (!department) {
      return res.status(400).json({ message: 'Department is required' });
    }
    if (!course) {
      return res.status(400).json({ message: 'Course is required' });
    }
    if (!semester) {
      return res.status(400).json({ message: 'Semester is required' });
    }

    const existing = await Subject.findOne({ code });
    if (existing) {
      return res.status(400).json({ message: 'Subject with this code already exists' });
    }

    const subject = await Subject.create({ name, code, description, course, semester, department, credits });

    const populated = await Subject.findById(subject._id)
      .populate('course', 'name code')
      .populate('semester', 'name number')
      .populate('department', 'name code');

    res.status(201).json({ subject: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateSubject = async (req, res, next) => {
  try {
    const { name, code, description, course, semester, department, credits, isActive } = req.body;

    if (!department) {
      return res.status(400).json({ message: 'Department is required' });
    }
    if (!course) {
      return res.status(400).json({ message: 'Course is required' });
    }
    if (!semester) {
      return res.status(400).json({ message: 'Semester is required' });
    }

    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { name, code, description, course, semester, department, credits, isActive },
      { new: true, runValidators: true }
    )
      .populate('course', 'name code')
      .populate('semester', 'name number')
      .populate('department', 'name code');

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({ subject });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const classCount = await Class.countDocuments({ subject: req.params.id });
    if (classCount > 0) {
      return res.status(400).json({
        message: `Cannot delete subject. ${classCount} class(es) are associated with it. Remove or reassign them first.`,
      });
    }

    await Subject.findByIdAndDelete(req.params.id);

    res.json({ message: 'Subject deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSubjects, getSubject, createSubject, updateSubject, deleteSubject };
