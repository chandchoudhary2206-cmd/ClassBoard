require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

const seed = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ email: 'admin@classboard.com' });

    if (existingAdmin) {
      console.log('Admin user already exists, skipping seed.');
    } else {
      await User.create({
        name: 'Admin',
        email: 'admin@classboard.com',
        password: 'admin123',
        role: 'admin',
      });
      console.log('Admin user created successfully');
    }

    console.log('Seed completed');
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
