const Attendance = require('../models/Attendance');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

const getAttendanceReport = async (req, res, next) => {
  try {
    const { subject, class: classId, student, startDate, endDate } = req.query;

    const match = {};
    if (subject) match.subject = require('mongoose').Types.ObjectId(subject);
    if (classId) match.class = require('mongoose').Types.ObjectId(classId);
    if (student) match.student = require('mongoose').Types.ObjectId(student);
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }

    const report = await Attendance.aggregate([
      { $match: match },
      {
        $group: {
          _id: { student: '$student', subject: '$subject' },
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          leave: { $sum: { $cond: [{ $eq: ['$status', 'leave'] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id.student',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      { $unwind: { path: '$studentInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'studentInfo.user',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'subjects',
          localField: '_id.subject',
          foreignField: '_id',
          as: 'subjectInfo',
        },
      },
      { $unwind: { path: '$subjectInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          studentId: '$studentInfo.studentId',
          studentName: '$userInfo.name',
          email: '$userInfo.email',
          subject: '$subjectInfo.name',
          total: 1,
          present: 1,
          absent: 1,
          late: 1,
          leave: 1,
          percentage: {
            $cond: [{ $gt: ['$total', 0] }, { $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 1] }, 0],
          },
        },
      },
      { $sort: { percentage: -1 } },
    ]);

    res.json({ report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getGradeReport = async (req, res, next) => {
  try {
    const { subject, class: classId, student } = req.query;

    const match = {};
    if (subject) match.subject = require('mongoose').Types.ObjectId(subject);
    if (classId) match.class = require('mongoose').Types.ObjectId(classId);
    if (student) match.student = require('mongoose').Types.ObjectId(student);

    const report = await Submission.aggregate([
      {
        $lookup: {
          from: 'assignments',
          localField: 'assignment',
          foreignField: '_id',
          as: 'assignmentInfo',
        },
      },
      { $unwind: '$assignmentInfo' },
      { $match: { ...match, 'assignmentInfo.status': { $ne: 'closed' } } },
      {
        $group: {
          _id: { student: '$student', subject: '$assignmentInfo.subject' },
          totalAssignments: { $sum: 1 },
          gradedAssignments: { $sum: { $cond: [{ $eq: ['$status', 'graded'] }, 1, 0] } },
          totalMarks: { $sum: { $cond: [{ $gte: ['$marks', 0] }, '$marks', 0] } },
          maxMarks: { $sum: '$assignmentInfo.maxMarks' },
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id.student',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      { $unwind: { path: '$studentInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'studentInfo.user',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'subjects',
          localField: '_id.subject',
          foreignField: '_id',
          as: 'subjectInfo',
        },
      },
      { $unwind: { path: '$subjectInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          studentId: '$studentInfo.studentId',
          studentName: '$userInfo.name',
          subject: '$subjectInfo.name',
          totalAssignments: 1,
          gradedAssignments: 1,
          totalMarks: { $round: ['$totalMarks', 1] },
          maxMarks: 1,
          percentage: {
            $cond: [
              { $gt: ['$maxMarks', 0] },
              { $round: [{ $multiply: [{ $divide: ['$totalMarks', '$maxMarks'] }, 100] }, 1] },
              0,
            ],
          },
        },
      },
      { $sort: { percentage: -1 } },
    ]);

    res.json({ report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getClassReport = async (req, res, next) => {
  try {
    const { classId } = req.params;

    const [totalStudents, assignments, attendanceStats] = await Promise.all([
      Enrollment.countDocuments({ class: classId, status: 'active' }),
      Assignment.countDocuments({ class: classId }),
      Attendance.aggregate([
        { $match: { class: require('mongoose').Types.ObjectId(classId) } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
            absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
            late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const attendanceAvg =
      attendanceStats.length > 0
        ? Math.round((attendanceStats[0].present / attendanceStats[0].total) * 100)
        : 0;

    res.json({
      report: {
        classId,
        totalStudents,
        totalAssignments: assignments,
        attendanceAverage: attendanceAvg,
        attendanceDetails: attendanceStats[0] || null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getStudentReport = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId)
      .populate({ path: 'user', select: 'name email phone' })
      .populate('department', 'name')
      .populate('course', 'name')
      .populate('section', 'name')
      .populate('semester', 'name');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const [attendanceReport, gradeReport, enrollments] = await Promise.all([
      Attendance.aggregate([
        { $match: { student: require('mongoose').Types.ObjectId(studentId) } },
        {
          $group: {
            _id: '$subject',
            total: { $sum: 1 },
            present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
            absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
            late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          },
        },
        {
          $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 'subject' },
        },
        { $unwind: { path: '$subject', preserveNullAndEmptyArrays: true } },
        { $project: { subject: '$subject.name', total: 1, present: 1, absent: 1, late: 1 } },
      ]),
      Submission.aggregate([
        { $match: { student: require('mongoose').Types.ObjectId(studentId) } },
        {
          $lookup: {
            from: 'assignments',
            localField: 'assignment',
            foreignField: '_id',
            as: 'assignmentInfo',
          },
        },
        { $unwind: '$assignmentInfo' },
        {
          $group: {
            _id: '$assignmentInfo.subject',
            total: { $sum: 1 },
            graded: { $sum: { $cond: [{ $eq: ['$status', 'graded'] }, 1, 0] } },
            earnedMarks: { $sum: { $cond: [{ $gte: ['$marks', 0] }, '$marks', 0] } },
            maxMarks: { $sum: '$assignmentInfo.maxMarks' },
          },
        },
        {
          $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 'subject' },
        },
        { $unwind: { path: '$subject', preserveNullAndEmptyArrays: true } },
        { $project: { subject: '$subject.name', total: 1, graded: 1, earnedMarks: 1, maxMarks: 1 } },
      ]),
      Enrollment.find({ student: studentId, status: 'active' })
        .populate({ path: 'class', populate: { path: 'subject', select: 'name' } })
        .populate('semester', 'name'),
    ]);

    res.json({
      report: {
        student: {
          studentId: student.studentId,
          name: student.user?.name,
          email: student.user?.email,
          department: student.department?.name,
          course: student.course?.name,
          section: student.section?.name,
          semester: student.semester?.name,
        },
        attendance: attendanceReport,
        grades: gradeReport,
        enrollments,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTeacherReport = async (req, res, next) => {
  try {
    const { teacherId } = req.params;

    const teacher = await Teacher.findById(teacherId)
      .populate({ path: 'user', select: 'name email' })
      .populate('department', 'name');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const [classLoad, assignmentsGiven] = await Promise.all([
      Class.countDocuments({ teacher: teacherId, isActive: true }),
      Assignment.countDocuments({ teacher: teacherId }),
    ]);

    const classDetails = await Class.find({ teacher: teacherId, isActive: true })
      .populate('subject', 'name code')
      .populate('section', 'name')
      .select('name subject section');

    const totalStudents = await Enrollment.distinct('student', {
      class: { $in: classDetails.map((c) => c._id) },
    });

    res.json({
      report: {
        teacher: {
          name: teacher.user?.name,
          email: teacher.user?.email,
          department: teacher.department?.name,
          teacherId: teacher.teacherId,
        },
        activeClasses: classLoad,
        totalAssignments: assignmentsGiven,
        totalStudents: totalStudents.length,
        classes: classDetails,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const [totalStudents, totalTeachers, totalClasses, totalAssignments, totalUsers, activeClasses] =
      await Promise.all([
        Student.countDocuments({ status: 'active' }),
        Teacher.countDocuments({ status: 'active' }),
        Class.countDocuments({ isActive: true }),
        Assignment.countDocuments(),
        User.countDocuments({ isActive: true }),
        Class.countDocuments({ isActive: true }),
      ]);

    res.json({
      stats: {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalAssignments,
        totalUsers,
        activeClasses,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAttendanceReport, getGradeReport, getClassReport, getStudentReport, getTeacherReport, getDashboardStats };
