const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const { getNextSequence } = require('../utils/helpers');

const connectDB = require('../config/db');

async function syncProfiles() {
  try {
    await connectDB();
    console.log('MongoDB connected');

    const studentsWithoutProfile = await User.find({ role: 'student', _id: { $nin: await Student.distinct('user') } });
    for (const user of studentsWithoutProfile) {
      const studentId = await getNextSequence(Student, 'STU', 'studentId');
      await Student.create({ user: user._id, studentId });
      console.log(`Created Student profile for ${user.email} (${studentId})`);
    }

    const teachersWithoutProfile = await User.find({ role: 'teacher', _id: { $nin: await Teacher.distinct('user') } });
    for (const user of teachersWithoutProfile) {
      const teacherId = await getNextSequence(Teacher, 'TCH', 'teacherId');
      await Teacher.create({ user: user._id, teacherId });
      console.log(`Created Teacher profile for ${user.email} (${teacherId})`);
    }

    console.log(`Done. Created ${studentsWithoutProfile.length} student and ${teachersWithoutProfile.length} teacher profiles.`);
    process.exit(0);
  } catch (err) {
    console.error('Sync failed:', err.message);
    process.exit(1);
  }
}

syncProfiles();
