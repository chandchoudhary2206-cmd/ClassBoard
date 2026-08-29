const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { paginate, buildFilter } = require('../utils/helpers');

const getAttendance = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

    const filter = buildFilter(req.query, ['class', 'subject', 'student', 'date', 'status']);

    if (filter.date) {
      filter.date = new Date(filter.date);
    }

    const [attendance, total] = await Promise.all([
      Attendance.find(filter)
        .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
        .populate('class', 'name')
        .populate('subject', 'name code')
        .populate('markedBy', 'name')
        .skip(skip)
        .limit(pageLimit)
        .sort({ date: -1 }),
      Attendance.countDocuments(filter),
    ]);

    res.json({
      attendance,
      pagination: { page: currentPage, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markAttendance = async (req, res, next) => {
  try {
    const { class: classId, subject, date, records } = req.body;

    const ops = records.map((record) => ({
      updateOne: {
        filter: { student: record.student, date: new Date(date), class: classId },
        update: {
          $set: {
            student: record.student,
            class: classId,
            subject,
            date: new Date(date),
            status: record.status,
            markedBy: req.user.id,
            remarks: record.remarks || '',
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(ops);

    res.json({ message: `Attendance recorded for ${records.length} student(s)` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyAttendance = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const { page, limit } = req.query;
    const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

    const filter = { student: student._id };

    const [attendance, total] = await Promise.all([
      Attendance.find(filter)
        .populate('class', 'name')
        .populate('subject', 'name code')
        .skip(skip)
        .limit(pageLimit)
        .sort({ date: -1 }),
      Attendance.countDocuments(filter),
    ]);

    res.json({
      attendance,
      pagination: { page: currentPage, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAttendanceReport = async (req, res, next) => {
  try {
    const { subject, class: classId, startDate, endDate } = req.query;

    const match = {};
    if (subject) match.subject = require('mongoose').Types.ObjectId(subject);
    if (classId) match.class = require('mongoose').Types.ObjectId(classId);
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
          from: 'subjects',
          localField: '_id.subject',
          foreignField: '_id',
          as: 'subjectInfo',
        },
      },
      { $unwind: { path: '$subjectInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          student: '$studentInfo._id',
          studentName: '$studentInfo.studentId',
          subject: '$subjectInfo.name',
          subjectCode: '$subjectInfo.code',
          total: 1,
          present: 1,
          absent: 1,
          late: 1,
          leave: 1,
          percentage: {
            $cond: [
              { $gt: ['$total', 0] },
              { $multiply: [{ $divide: ['$present', '$total'] }, 100] },
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

const updateAttendance = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status, remarks, markedBy: req.user.id },
      { new: true, runValidators: true }
    )
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .populate('class', 'name')
      .populate('subject', 'name code');

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json({ attendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAttendance, markAttendance, getMyAttendance, getAttendanceReport, updateAttendance };
