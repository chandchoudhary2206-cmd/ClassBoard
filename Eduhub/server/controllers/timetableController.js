const Timetable = require('../models/Timetable');
const Student = require('../models/Student');
const { paginate, buildFilter } = require('../utils/helpers');

const populateFields = [
  { path: 'subject', select: 'name code' },
  { path: 'teacher', select: 'teacherId' },
  { path: 'section', select: 'name' },
  { path: 'academicYear', select: 'year' },
  { path: 'semester', select: 'name number' },
];

const getTimetable = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

    const filter = buildFilter(req.query, ['section', 'dayOfWeek', 'semester', 'teacher', 'isActive']);

    const [timetable, total] = await Promise.all([
      Timetable.find(filter).populate(populateFields).skip(skip).limit(pageLimit).sort({ dayOfWeek: 1, startTime: 1 }),
      Timetable.countDocuments(filter),
    ]);

    res.json({
      timetable,
      pagination: { page: currentPage, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createEntry = async (req, res, next) => {
  try {
    const { dayOfWeek, startTime, endTime, subject, teacher, section, classroom, academicYear, semester } = req.body;

    const entry = await Timetable.create({ dayOfWeek, startTime, endTime, subject, teacher, section, classroom, academicYear, semester });

    const populated = await Timetable.findById(entry._id).populate(populateFields);

    res.status(201).json({ entry: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateEntry = async (req, res, next) => {
  try {
    const { dayOfWeek, startTime, endTime, subject, teacher, section, classroom, academicYear, semester, isActive } = req.body;

    const entry = await Timetable.findByIdAndUpdate(
      req.params.id,
      { dayOfWeek, startTime, endTime, subject, teacher, section, classroom, academicYear, semester, isActive },
      { new: true, runValidators: true }
    ).populate(populateFields);

    if (!entry) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    res.json({ entry });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteEntry = async (req, res, next) => {
  try {
    const entry = await Timetable.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTimetableBySection = async (req, res, next) => {
  try {
    const { sectionId } = req.params;

    const timetable = await Timetable.find({ section: sectionId, isActive: true })
      .populate(populateFields)
      .sort({ dayOfWeek: 1, startTime: 1 });

    const week = {};
    for (let i = 1; i <= 7; i++) {
      week[i] = [];
    }

    timetable.forEach((entry) => {
      if (week[entry.dayOfWeek]) {
        week[entry.dayOfWeek].push(entry);
      }
    });

    res.json({ timetable: week });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyTimetable = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const timetable = await Timetable.find({
      section: student.section,
      isActive: true,
    })
      .populate(populateFields)
      .sort({ dayOfWeek: 1, startTime: 1 });

    const week = {};
    for (let i = 1; i <= 7; i++) {
      week[i] = timetable.filter((entry) => entry.dayOfWeek === i);
    }

    res.json({ timetable: week });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getTimetable, createEntry, updateEntry, deleteEntry, getTimetableBySection, getMyTimetable };
