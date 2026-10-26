const Course = require('../models/Course');
const Subject = require('../models/Subject');
const { paginate, buildFilter } = require('../utils/helpers');

const getCourses = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

    const filter = buildFilter(req.query, ['department', 'isActive']);

    const [courses, total] = await Promise.all([
      Course.find(filter).populate('department', 'name code').skip(skip).limit(pageLimit).sort({ createdAt: -1 }),
      Course.countDocuments(filter),
    ]);

    res.json({
      courses,
      pagination: {
        page: currentPage,
        limit: pageLimit,
        total,
        pages: Math.ceil(total / pageLimit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('department', 'name code');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createCourse = async (req, res, next) => {
  try {
    const { name, code, duration, department, description } = req.body;

    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return res.status(400).json({ message: 'Course with this code already exists' });
    }

    const course = await Course.create({ name, code, duration, department, description });

    const populated = await Course.findById(course._id).populate('department', 'name code');

    res.status(201).json({ course: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const { name, code, duration, department, description, isActive } = req.body;

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { name, code, duration, department, description, isActive },
      { new: true, runValidators: true }
    ).populate('department', 'name code');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const subjectCount = await Subject.countDocuments({ course: req.params.id });
    if (subjectCount > 0) {
      return res.status(400).json({
        message: `Cannot delete course. ${subjectCount} subject(s) are associated with it. Remove or reassign them first.`,
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getCourses, getCourse, createCourse, updateCourse, deleteCourse };
