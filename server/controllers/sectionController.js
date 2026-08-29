const Section = require('../models/Section');
const Class = require('../models/Class');
const Enrollment = require('../models/Enrollment');
const { paginate, buildFilter } = require('../utils/helpers');

const getSections = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

    const filter = buildFilter(req.query, ['course', 'semester', 'academicYear', 'department', 'isActive']);

    const [sections, total] = await Promise.all([
      Section.find(filter)
        .populate('course', 'name code')
        .populate('semester', 'name number')
        .populate('academicYear', 'year')
        .populate('department', 'name code')
        .skip(skip)
        .limit(pageLimit)
        .sort({ createdAt: -1 }),
      Section.countDocuments(filter),
    ]);

    res.json({
      sections,
      pagination: { page: currentPage, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSection = async (req, res, next) => {
  try {
    const section = await Section.findById(req.params.id)
      .populate('course', 'name code')
      .populate('semester', 'name number')
      .populate('academicYear', 'year')
      .populate('department', 'name code');
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    res.json({ section });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createSection = async (req, res, next) => {
  try {
    const { name, course, semester, academicYear, department, capacity } = req.body;

    const section = await Section.create({ name, course, semester, academicYear, department, capacity });

    const populated = await Section.findById(section._id)
      .populate('course', 'name code')
      .populate('semester', 'name number')
      .populate('academicYear', 'year')
      .populate('department', 'name code');

    res.status(201).json({ section: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Section with this name already exists for this course, semester, and academic year' });
    }
    res.status(500).json({ message: err.message });
  }
};

const updateSection = async (req, res, next) => {
  try {
    const { name, course, semester, academicYear, department, capacity, isActive } = req.body;

    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { name, course, semester, academicYear, department, capacity, isActive },
      { new: true, runValidators: true }
    )
      .populate('course', 'name code')
      .populate('semester', 'name number')
      .populate('academicYear', 'year')
      .populate('department', 'name code');

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    res.json({ section });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Duplicate section entry' });
    }
    res.status(500).json({ message: err.message });
  }
};

const deleteSection = async (req, res, next) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const [classCount, enrollmentCount] = await Promise.all([
      Class.countDocuments({ section: req.params.id }),
      Enrollment.countDocuments({ section: req.params.id }),
    ]);

    if (classCount > 0 || enrollmentCount > 0) {
      return res.status(400).json({
        message: `Cannot delete section. ${classCount} class(es) and ${enrollmentCount} enrollment(s) are associated with it.`,
      });
    }

    await Section.findByIdAndDelete(req.params.id);

    res.json({ message: 'Section deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSections, getSection, createSection, updateSection, deleteSection };
