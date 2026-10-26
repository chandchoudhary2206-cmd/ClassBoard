const Assignment = require('../models/Assignment');
const fs = require('fs');
const { paginate, buildFilter } = require('../utils/helpers');

const populateFields = [
  { path: 'subject', select: 'name code' },
  { path: 'class', select: 'name' },
  { path: 'section', select: 'name' },
  { path: 'teacher', select: 'teacherId' },
  { path: 'createdBy', select: 'name' },
];

const getAssignments = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

    const filter = buildFilter(req.query, ['class', 'subject', 'section', 'teacher', 'status']);

    const [assignments, total] = await Promise.all([
      Assignment.find(filter).populate(populateFields).skip(skip).limit(pageLimit).sort({ createdAt: -1 }),
      Assignment.countDocuments(filter),
    ]);

    res.json({
      assignments,
      pagination: { page: currentPage, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate(populateFields);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json({ assignment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createAssignment = async (req, res, next) => {
  try {
    const { title, description, dueDate, maxMarks, subject, class: classId, teacher, section } = req.body;

    const assignmentData = {
      title,
      description,
      dueDate,
      maxMarks,
      subject,
      class: classId,
      teacher,
      section,
      createdBy: req.user.id,
    };

    if (req.file) {
      assignmentData.fileUrl = req.file.path;
    }

    const assignment = await Assignment.create(assignmentData);

    const populated = await Assignment.findById(assignment._id).populate(populateFields);

    res.status(201).json({ assignment: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateAssignment = async (req, res, next) => {
  try {
    const { title, description, dueDate, maxMarks, status } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (maxMarks !== undefined) updateData.maxMarks = maxMarks;
    if (status !== undefined) updateData.status = status;

    if (req.file) {
      updateData.fileUrl = req.file.path;
    }

    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate(populateFields);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json({ assignment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.fileUrl) {
      fs.unlink(assignment.fileUrl, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Error deleting file:', err);
        }
      });
    }

    await Assignment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const closeAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { status: 'closed' },
      { new: true }
    ).populate(populateFields);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json({ assignment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAssignments, getAssignment, createAssignment, updateAssignment, deleteAssignment, closeAssignment };
