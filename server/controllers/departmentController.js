const Department = require('../models/Department');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const { paginate } = require('../utils/helpers');

const getDepartments = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

    const filter = {};
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const [departments, total] = await Promise.all([
      Department.find(filter).skip(skip).limit(pageLimit).sort({ createdAt: -1 }),
      Department.countDocuments(filter),
    ]);

    res.json({
      departments,
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

const getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json({ department });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;

    const existingDept = await Department.findOne({ $or: [{ name }, { code }] });
    if (existingDept) {
      return res.status(400).json({ message: 'Department with this name or code already exists' });
    }

    const department = await Department.create({ name, code, description });

    res.status(201).json({ department });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const { name, code, description, isActive } = req.body;

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, code, description, isActive },
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({ department });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const courseCount = await Course.countDocuments({ department: req.params.id });
    if (courseCount > 0) {
      return res.status(400).json({
        message: `Cannot delete department. ${courseCount} course(s) are associated with it. Remove or reassign them first.`,
      });
    }

    const subjectCount = await Subject.countDocuments({ department: req.params.id });
    if (subjectCount > 0) {
      return res.status(400).json({
        message: `Cannot delete department. ${subjectCount} subject(s) are associated with it. Remove or reassign them first.`,
      });
    }

    await Department.findByIdAndDelete(req.params.id);

    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment };
