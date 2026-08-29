const Semester = require('../models/Semester');
const Section = require('../models/Section');
const Subject = require('../models/Subject');
const { paginate, buildFilter } = require('../utils/helpers');

const getSemesters = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

    const filter = buildFilter(req.query, ['academicYear', 'course', 'isActive']);

    const [semesters, total] = await Promise.all([
      Semester.find(filter)
        .populate('academicYear', 'year')
        .populate('course', 'name code')
        .skip(skip)
        .limit(pageLimit)
        .sort({ number: 1 }),
      Semester.countDocuments(filter),
    ]);

    res.json({
      semesters,
      pagination: { page: currentPage, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSemester = async (req, res, next) => {
  try {
    const semester = await Semester.findById(req.params.id)
      .populate('academicYear', 'year')
      .populate('course', 'name code');
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }
    res.json({ semester });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createSemester = async (req, res, next) => {
  try {
    const { name, number, academicYear, course, startDate, endDate } = req.body;

    const semester = await Semester.create({ name, number, academicYear, course, startDate, endDate });

    const populated = await Semester.findById(semester._id)
      .populate('academicYear', 'year')
      .populate('course', 'name code');

    res.status(201).json({ semester: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Semester with this number already exists for this academic year and course' });
    }
    res.status(500).json({ message: err.message });
  }
};

const updateSemester = async (req, res, next) => {
  try {
    const { name, number, academicYear, course, startDate, endDate, isActive } = req.body;

    const semester = await Semester.findByIdAndUpdate(
      req.params.id,
      { name, number, academicYear, course, startDate, endDate, isActive },
      { new: true, runValidators: true }
    )
      .populate('academicYear', 'year')
      .populate('course', 'name code');

    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }

    res.json({ semester });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Duplicate semester entry' });
    }
    res.status(500).json({ message: err.message });
  }
};

const deleteSemester = async (req, res, next) => {
  try {
    const semester = await Semester.findById(req.params.id);
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }

    const [sectionCount, subjectCount] = await Promise.all([
      Section.countDocuments({ semester: req.params.id }),
      Subject.countDocuments({ semester: req.params.id }),
    ]);

    if (sectionCount > 0 || subjectCount > 0) {
      return res.status(400).json({
        message: `Cannot delete semester. ${sectionCount} section(s) and ${subjectCount} subject(s) are associated with it.`,
      });
    }

    await Semester.findByIdAndDelete(req.params.id);

    res.json({ message: 'Semester deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSemesters, getSemester, createSemester, updateSemester, deleteSemester };
