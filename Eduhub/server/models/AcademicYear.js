const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema(
  {
    year: {
      type: String,
      required: [true, 'Academic year is required'],
      unique: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AcademicYear', academicYearSchema);
