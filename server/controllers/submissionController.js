const Submission = require('../models/Submission');
const Student = require('../models/Student');
const { paginate, buildFilter } = require('../utils/helpers');

const populateFields = [
  { path: 'assignment', select: 'title dueDate maxMarks' },
  { path: 'student', populate: { path: 'user', select: 'name email' } },
  { path: 'gradedBy', select: 'name' },
];

const getSubmissions = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

    const filter = buildFilter(req.query, ['assignment', 'student', 'status']);

    const [submissions, total] = await Promise.all([
      Submission.find(filter).populate(populateFields).skip(skip).limit(pageLimit).sort({ createdAt: -1 }),
      Submission.countDocuments(filter),
    ]);

    res.json({
      submissions,
      pagination: { page: currentPage, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id).populate(populateFields);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    res.json({ submission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const submitAssignment = async (req, res, next) => {
  try {
    const { assignment: assignmentId } = req.body;

    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const existing = await Submission.findOne({ assignment: assignmentId, student: student._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already submitted this assignment' });
    }

    const submissionData = {
      assignment: assignmentId,
      student: student._id,
    };

    if (req.file) {
      submissionData.fileUrl = req.file.path;
      submissionData.fileType = req.file.mimetype;
      submissionData.fileSize = req.file.size;
    }

    const submission = await Submission.create(submissionData);

    const populated = await Submission.findById(submission._id).populate(populateFields);

    res.status(201).json({ submission: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Duplicate submission. You have already submitted this assignment.' });
    }
    res.status(500).json({ message: err.message });
  }
};

const gradeSubmission = async (req, res, next) => {
  try {
    const { marks, feedback } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      {
        marks,
        feedback,
        status: 'graded',
        gradedBy: req.user.id,
      },
      { new: true, runValidators: true }
    ).populate(populateFields);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json({ submission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMySubmissions = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const { page, limit } = req.query;
    const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

    const filter = { student: student._id };

    const [submissions, total] = await Promise.all([
      Submission.find(filter).populate(populateFields).skip(skip).limit(pageLimit).sort({ createdAt: -1 }),
      Submission.countDocuments(filter),
    ]);

    res.json({
      submissions,
      pagination: { page: currentPage, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSubmissions, getSubmission, submitAssignment, gradeSubmission, getMySubmissions };
