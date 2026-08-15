const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'leave'],
      required: [true, 'Status is required'],
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    remarks: {
      type: String,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, date: 1, class: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
