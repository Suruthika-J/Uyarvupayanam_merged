require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Course = require('../models/Course');
const College = require('../models/College');
const M = require('../models/CollegeCourseMapping');

const normalizeCourseName = (name) =>
  (name || '')
    .replace(/^b\.?e\.?\s*/i, '')
    .replace(/^b\.?tech\.?\s*/i, '')
    .replace(/^m\.?e\.?\s*/i, '')
    .replace(/^m\.?tech\.?\s*/i, '')
    .replace(/\s*\(.*?\)\s*/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Simulate what getStudentCourseDetails would do for each target course
  const targetCourses = [
    'COMPUTER SCIENCE AND ENGINEERING',
    'INFORMATION TECHNOLOGY',
    'MECHANICAL ENGINEERING',
    'ELECTRONICS AND COMMUNICATION ENGINEERING',
    'ELECTRICAL AND ELECTRONICS ENGINEERING',
    'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE',
    'ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING',
  ];

  const allEngCourses = await Course.find({ category: 'Engineering', status: 'active' }).lean();
  console.log('Total active Engineering courses:', allEngCourses.length);

  for (const targetName of targetCourses) {
    const target = await Course.findOne({ courseName: targetName, category: 'Engineering' }).lean();
    if (!target) { console.log(`❌ ${targetName}: not found`); continue; }

    const targetNorm = normalizeCourseName(target.courseName);
    const variantIds = allEngCourses
      .filter(c => normalizeCourseName(c.courseName) === targetNorm)
      .map(c => c._id);

    const count = await M.countDocuments({
      courseId: { $in: variantIds },
      isActive: true,
      isVerified: true
    });
    console.log(`✅ ${targetName}: ${variantIds.length} variant(s), ${count} colleges mapped`);
  }

  await mongoose.disconnect();
})();
