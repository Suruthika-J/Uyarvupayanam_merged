require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Course = require('../models/Course');
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

  const target = 'ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING';
  const targetNorm = normalizeCourseName(target);
  console.log('Target normalized:', targetNorm);

  // Find all courses with AI or ML in the name
  const allEng = await Course.find({ category: 'Engineering' }).lean();
  const matches = allEng.filter(c => {
    const n = normalizeCourseName(c.courseName);
    return n.includes('artificial intelligence') || n.includes('machine learning');
  });

  for (const c of matches) {
    const norm = normalizeCourseName(c.courseName);
    const cnt = await M.countDocuments({ courseId: c._id, isActive: true });
    console.log(`  "${c.courseName}" | norm: "${norm}" | mapped: ${cnt}`);
  }

  await mongoose.disconnect();
})();
