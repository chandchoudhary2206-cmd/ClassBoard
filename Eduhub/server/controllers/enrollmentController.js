const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Class = require('../models/Class');
const { paginate, buildFilter } = require('../utils/helpers');

const getEnrollments = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

    const filter = buildFilter(req.query, ['section', 'class', 'student', 'status', 'academicYear', 'semester']);

    const [enrollments, total] = await Promise.all([
      Enrollment.find(filter)
        .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
        .populate('section', 'name')
        .populate('class', 'name')
        .populate('academicYear', 'year')
        .populate('semester', 'name')
        .skip(skip)
        .limit(pageLimit)
        .sort({ createdAt: -1 }),
      Enrollment.countDocuments(filter),
    ]);

    res.json({
      enrollments,
      pagination: { page: currentPage, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const enrollStudent = async (req, res, next) => {
  try {
    const { student, class: classId, section, academicYear, semester } = req.body;

    const existing = await Enrollment.findOne({ student, class: classId });
    if (existing) {
      return res.status(400).json({ message: 'Student is already enrolled in this class' });
    }

    const enrollment = await Enrollment.create({
      student,
      class: classId,
      section,
      academicYear,
      semester,
    });

    const populated = await Enrollment.findById(enrollment._id)
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .populate('class', 'name')
      .populate('section', 'name')
      .populate('academicYear', 'year')
      .populate('semester', 'name');

    res.status(201).json({ enrollment: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const enrollMultiple = async (req, res, next) => {
  try {
    const { studentIds, class: classId, section, academicYear, semester } = req.body;

    const cls = await Class.findById(classId);
    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const existings = await Enrollment.find({ student: { $in: studentIds }, class: classId }).select('student');
    const existingIds = existings.map((e) => e.student.toString());

    const newEnrollments = studentIds
      .filter((id) => !existingIds.includes(id))
      .map((student) => ({
        student,
        class: classId,
        section: section || cls.section,
        academicYear: academicYear || cls.academicYear,
        semester: semester || cls.semester,
      }));

    if (newEnrollments.length === 0) {
      return res.status(400).json({ message: 'All students are already enrolled in this class' });
    }

    const enrollments = await Enrollment.insertMany(newEnrollments);

    res.status(201).json({
      message: `${enrollments.length} student(s) enrolled successfully`,
      skipped: studentIds.length - enrollments.length,
      enrollments,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const bulkEnroll = async (req, res, next) => {
  try {
    const { section: sectionId, academicYear, semester } = req.body;

    const students = await Student.find({ section: sectionId, status: 'active' }).select('_id');
    if (students.length === 0) {
      return res.status(400).json({ message: 'No active students found in this section' });
    }

    const classes = await Class.find({ section: sectionId }).select('_id');
    if (classes.length === 0) {
      return res.status(400).json({ message: 'No classes found for this section' });
    }

    const studentIds = students.map((s) => s._id);
    const classIds = classes.map((c) => c._id);

    const existings = await Enrollment.find({
      student: { $in: studentIds },
      section: sectionId,
    }).select('student class');

    const existingSet = new Set(existings.map((e) => `${e.student.toString()}-${e.class.toString()}`));

    const bulkOps = [];
    for (const studentId of studentIds) {
      for (const classId of classIds) {
        const key = `${studentId.toString()}-${classId.toString()}`;
        if (!existingSet.has(key)) {
          bulkOps.push({
            student: studentId,
            class: classId,
            section: sectionId,
            academicYear,
            semester,
          });
        }
      }
    }

    if (bulkOps.length === 0) {
      return res.status(400).json({ message: 'All students are already enrolled in all classes' });
    }

    const enrollments = await Enrollment.insertMany(bulkOps);

    res.status(201).json({
      message: `${enrollments.length} enrollment(s) created successfully`,
      totalStudents: studentIds.length,
      totalClasses: classIds.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const unenrollStudent = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.json({ message: 'Student unenrolled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyEnrollments = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const enrollments = await Enrollment.find({ student: student._id, status: 'active' })
      .populate({ path: 'class', populate: { path: 'subject', select: 'name code' } })
      .populate('section', 'name')
      .populate('semester', 'name number')
      .populate('academicYear', 'year');

    res.json({ enrollments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getEnrollments, enrollStudent, enrollMultiple, bulkEnroll, unenrollStudent, getMyEnrollments };
