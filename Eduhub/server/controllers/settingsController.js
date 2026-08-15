const AcademicYear = require('../models/AcademicYear');

const getSettings = async (req, res, next) => {
  try {
    const activeAcademicYear = await AcademicYear.findOne({ isActive: true }).sort({ year: -1 });

    const allAcademicYears = await AcademicYear.find().sort({ year: -1 });

    res.json({
      settings: {
        academicYear: activeAcademicYear || null,
        allAcademicYears,
        systemName: 'ClassBoard',
        defaultPageSize: 10,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const { academicYearId } = req.body;

    if (academicYearId) {
      await AcademicYear.updateMany({}, { isActive: false });

      const year = await AcademicYear.findByIdAndUpdate(
        academicYearId,
        { isActive: true },
        { new: true }
      );

      if (!year) {
        return res.status(404).json({ message: 'Academic year not found' });
      }
    }

    const settings = {
      academicYear: await AcademicYear.findOne({ isActive: true }),
      message: 'Settings updated successfully',
    };

    res.json({ settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSettings, updateSettings };
