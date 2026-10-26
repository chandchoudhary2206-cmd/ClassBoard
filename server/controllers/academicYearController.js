const AcademicYear = require('../models/AcademicYear');
const Semester = require('../models/Semester');
const { paginate, buildFilter } = require('../utils/helpers');

const getAcademicYears = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

    const filter = buildFilter(req.query, ['isActive']);

    const [academicYears, total] = await Promise.all([
      AcademicYear.find(filter).skip(skip).limit(pageLimit).sort({ year: -1 }),
      AcademicYear.countDocuments(filter),
    ]);

    res.json({
      academicYears,
      pagination: { page: currentPage, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAcademicYear = async (req, res, next) => {
  try {
    const academicYear = await AcademicYear.findById(req.params.id);
    if (!academicYear) {
      return res.status(404).json({ message: 'Academic year not found' });
    }
    res.json({ academicYear });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createAcademicYear = async (req, res, next) => {
  try {
    const { year, startDate, endDate } = req.body;

    const existing = await AcademicYear.findOne({ year });
    if (existing) {
      return res.status(400).json({ message: 'Academic year already exists' });
    }

    const academicYear = await AcademicYear.create({ year, startDate, endDate });

    res.status(201).json({ academicYear });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateAcademicYear = async (req, res, next) => {
  try {
    const { year, startDate, endDate, isActive } = req.body;

    if (isActive === true) {
      await AcademicYear.updateMany({ _id: { $ne: req.params.id } }, { isActive: false });
    }

    const academicYear = await AcademicYear.findByIdAndUpdate(
      req.params.id,
      { year, startDate, endDate, isActive },
      { new: true, runValidators: true }
    );

    if (!academicYear) {
      return res.status(404).json({ message: 'Academic year not found' });
    }

    res.json({ academicYear });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAcademicYear = async (req, res, next) => {
  try {
    const academicYear = await AcademicYear.findById(req.params.id);
    if (!academicYear) {
      return res.status(404).json({ message: 'Academic year not found' });
    }

    const semesterCount = await Semester.countDocuments({ academicYear: req.params.id });
    if (semesterCount > 0) {
      return res.status(400).json({
        message: `Cannot delete academic year. ${semesterCount} semester(s) are associated with it. Remove or reassign them first.`,
      });
    }

    await AcademicYear.findByIdAndDelete(req.params.id);

    res.json({ message: 'Academic year deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAcademicYears, getAcademicYear, createAcademicYear, updateAcademicYear, deleteAcademicYear };
