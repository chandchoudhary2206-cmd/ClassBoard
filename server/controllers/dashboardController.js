const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Department = require('../models/Department');
const Course = require('../models/Course');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');
const Submission = require('../models/Submission');
const Timetable = require('../models/Timetable');

const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalDepartments,
      totalCourses,
      totalClasses,
      activeClasses,
      totalUsers,
    ] = await Promise.all([
      Student.countDocuments({ status: 'active' }),
      Teacher.countDocuments({ status: 'active' }),
      Department.countDocuments({ isActive: true }),
      Course.countDocuments({ isActive: true }),
      Class.countDocuments(),
      Class.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true }),
    ]);

    const recentStudents = await Student.find({ status: 'active' })
      .populate({ path: 'user', select: 'name email' })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      counts: {
        totalStudents,
        totalTeachers,
        totalDepartments,
        totalCourses,
        totalClasses,
        activeClasses,
        totalUsers,
      },
      recent: {
        students: recentStudents,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTeacherDashboard = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    const [assignedClasses, totalStudents, recentAssignments, upcomingDeadlines, todaysSchedule] =
      await Promise.all([
        Class.countDocuments({ teacher: teacher._id, isActive: true }),
        Enrollment.distinct('student', {
          class: { $in: (await Class.find({ teacher: teacher._id }).select('_id')).map((c) => c._id) },
        }),
        Assignment.find({ teacher: teacher._id })
          .populate('subject', 'name')
          .populate('class', 'name')
          .sort({ createdAt: -1 })
          .limit(5),
        Assignment.find({ teacher: teacher._id, dueDate: { $gte: new Date() }, status: 'active' })
          .sort({ dueDate: 1 })
          .limit(5),
        Timetable.find({
          teacher: teacher._id,
          dayOfWeek: new Date().getDay() || 7,
          isActive: true,
        })
          .populate('subject', 'name')
          .populate('section', 'name')
          .sort({ startTime: 1 }),
      ]);

    res.json({
      counts: {
        assignedClasses,
        totalStudents: totalStudents.length,
      },
      assignments: {
        recent: recentAssignments,
        upcoming: upcomingDeadlines,
      },
      todaysSchedule,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getStudentDashboard = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const enrolledClassesCount = await Enrollment.countDocuments({
      student: student._id,
      status: 'active',
    });

    const [upcomingAssignments, attendanceSummary, recentGrades, todaysTimetable] = await Promise.all([
      Assignment.aggregate([
        {
          $lookup: {
            from: 'enrollments',
            let: { classId: '$_id' },
            pipeline: [
              { $match: { student: student._id, status: 'active' } },
              { $project: { class: 1 } },
            ],
            as: 'enrolled',
          },
        },
        { $unwind: '$enrolled' },
        { $match: { dueDate: { $gte: new Date() }, status: 'active' } },
        {
          $lookup: { from: 'subjects', localField: 'subject', foreignField: '_id', as: 'subject' },
        },
        { $unwind: '$subject' },
        { $sort: { dueDate: 1 } },
        { $limit: 5 },
        {
          $project: {
            title: 1,
            dueDate: 1,
            maxMarks: 1,
            subject: '$subject.name',
          },
        },
      ]),
      Attendance.aggregate([
        { $match: { student: student._id } },
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
      Submission.find({ student: student._id, status: 'graded', marks: { $exists: true } })
        .populate({ path: 'assignment', select: 'title maxMarks subject', populate: { path: 'subject', select: 'name' } })
        .sort({ updatedAt: -1 })
        .limit(5),
      Timetable.find({
        section: student.section,
        dayOfWeek: new Date().getDay() || 7,
        isActive: true,
      })
        .populate('subject', 'name code')
        .populate('teacher', 'teacherId')
        .sort({ startTime: 1 }),
    ]);

    res.json({
      enrolledClasses: enrolledClassesCount,
      upcomingAssignments,
      attendanceSummary: attendanceSummary[0] || { total: 0, present: 0, absent: 0, late: 0 },
      recentGrades,
      todaysTimetable,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAdminDashboard, getTeacherDashboard, getStudentDashboard };
