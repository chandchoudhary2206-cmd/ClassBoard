const User = require('../models/User');
const Teacher = require('../models/Teacher');
const { getNextSequence, paginate, buildFilter } = require('../utils/helpers');

const populateFields = [
  { path: 'user', select: 'name email phone profileImage isActive' },
  { path: 'department', select: 'name code' },
];

const getTeachers = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

    const filter = buildFilter(req.query, ['department', 'status', 'gender']);

    const [teachers, total] = await Promise.all([
      Teacher.find(filter).populate(populateFields).skip(skip).limit(pageLimit).sort({ createdAt: -1 }),
      Teacher.countDocuments(filter),
    ]);

    res.json({
      teachers,
      pagination: {
        page: currentPage,
        limit: pageLimit,
        total,
        pages: Math.ceil(total / pageLimit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate(populateFields);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json({ teacher });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createTeacher = async (req, res, next) => {
  try {
    const { name, email, password, phone, department, qualification, specialization, dateOfBirth, gender, address, joiningDate, status } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'teacher123',
      role: 'teacher',
      phone,
    });

    const teacherId = await getNextSequence(Teacher, 'TCH', 'teacherId');

    const teacher = await Teacher.create({
      user: user._id,
      teacherId,
      department,
      qualification,
      specialization,
      dateOfBirth,
      gender,
      address,
      joiningDate,
      status,
    });

    const populated = await Teacher.findById(teacher._id).populate(populateFields);

    res.status(201).json({ teacher: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateTeacher = async (req, res, next) => {
  try {
    const { name, email, phone, ...teacherFields } = req.body;

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (name || email || phone) {
      await User.findByIdAndUpdate(teacher.user, { name, email, phone }, { new: true, runValidators: true });
    }

    const updated = await Teacher.findByIdAndUpdate(req.params.id, teacherFields, { new: true, runValidators: true }).populate(populateFields);

    res.json({ teacher: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    await Teacher.findByIdAndDelete(req.params.id);

    await User.findByIdAndUpdate(teacher.user, { isActive: false });

    res.json({ message: 'Teacher deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher };
