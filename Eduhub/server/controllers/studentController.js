const User = require('../models/User');
const Student = require('../models/Student');
const { getNextSequence, paginate, buildFilter } = require('../utils/helpers');

const populateFields = [
  { path: 'user', select: 'name email phone profileImage isActive' },
  { path: 'department', select: 'name code' },
  { path: 'course', select: 'name code duration' },
  { path: 'section', select: 'name' },
  { path: 'academicYear', select: 'name' },
  { path: 'semester', select: 'name' },
];

const getStudents = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const { skip, limit: pageLimit, page: currentPage } = paginate(page, limit);

    const filter = buildFilter(req.query, ['department', 'course', 'section', 'status', 'gender']);

    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      filter.user = { $in: users.map((u) => u._id) };
    }

    const [students, total] = await Promise.all([
      Student.find(filter).populate(populateFields).skip(skip).limit(pageLimit).sort({ createdAt: -1 }),
      Student.countDocuments(filter),
    ]);

    res.json({
      students,
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

const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate(populateFields);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ student });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createStudent = async (req, res, next) => {
  try {
    const { name, email, password, phone, department, course, section, academicYear, semester, dateOfBirth, gender, address, enrollmentDate, status } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'student123',
      role: 'student',
      phone,
    });

    const studentId = await getNextSequence(Student, 'STU', 'studentId');

    const student = await Student.create({
      user: user._id,
      studentId,
      department,
      course,
      section,
      academicYear,
      semester,
      dateOfBirth,
      gender,
      address,
      enrollmentDate,
      status,
    });

    const populated = await Student.findById(student._id).populate(populateFields);

    res.status(201).json({ student: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const { name, email, phone, ...studentFields } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (name || email || phone) {
      await User.findByIdAndUpdate(student.user, { name, email, phone }, { new: true, runValidators: true });
    }

    const updated = await Student.findByIdAndUpdate(req.params.id, studentFields, { new: true, runValidators: true }).populate(populateFields);

    res.json({ student: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await Student.findByIdAndDelete(req.params.id);

    await User.findByIdAndUpdate(student.user, { isActive: false });

    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getStudentsBySection = async (req, res, next) => {
  try {
    const { sectionId } = req.params;

    const students = await Student.find({ section: sectionId, status: 'active' })
      .populate(populateFields)
      .sort({ createdAt: -1 });

    res.json({ students });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStudents, getStudent, createStudent, updateStudent, deleteStudent, getStudentsBySection };
