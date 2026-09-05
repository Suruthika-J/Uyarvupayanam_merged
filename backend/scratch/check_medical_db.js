require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const College = require('../models/College');
const Course = require('../models/Course');
const M = require('../models/CollegeCourseMapping');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const mc = await College.countDocuments({ stream: 'Medical' });
  const cc = await Course.countDocuments({ category: 'Medical' });
  const mm = await M.countDocuments({ stream: 'Medical' });
  console.log('Medical colleges:', mc);
  console.log('Medical courses:', cc);
  console.log('Medical mappings:', mm);

  if (mc > 0) {
    const sample = await College.find({ stream: 'Medical' }).limit(5).lean();
    console.log('\nSample colleges:');
    sample.forEach(c => console.log(' ', c.collegeName, '| type:', c.collegeType, '| courses:', (c.coursesOffered || []).length));
  }

  if (cc > 0) {
    const courses = await Course.find({ category: 'Medical' }).lean();
    console.log('\nMedical courses:');
    courses.forEach(c => console.log('  ', c.courseName, '| level:', c.level, '| targetLevel:', c.targetLevel));
  }

  if (mm > 0) {
    const mappings = await M.find({ stream: 'Medical' }).limit(5).lean();
    console.log('\nSample mappings:');
    mappings.forEach(m => console.log('  college:', m.collegeId, '| course:', m.courseId, '| verified:', m.isVerified, '| active:', m.isActive));
  }

  await mongoose.disconnect();
})();
