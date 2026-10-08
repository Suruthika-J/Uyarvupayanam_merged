const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function fixUsers() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/uyarvupayanam';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // 1. Update all institutional (.edu.in, .ac.in, nec.edu.in) accounts to userType: 'college_student'
    const resNec = await User.updateMany(
      { email: /(\.edu|\.ac)\.in$/i },
      { $set: { userType: 'college_student', classLevel: 'college_student' } }
    );
    console.log('Updated institutional accounts:', resNec);

    // 2. Also update any account where classLevel is 'college_student' but userType is not 'college_student'
    const resClassLevel = await User.updateMany(
      { classLevel: /college_student/i, userType: { $ne: 'college_student' } },
      { $set: { userType: 'college_student' } }
    );
    console.log('Updated classLevel college_student accounts:', resClassLevel);

    mongoose.disconnect();
    console.log('Done.');
  } catch (err) {
    console.error('Error fixing users:', err);
    process.exit(1);
  }
}

fixUsers();
