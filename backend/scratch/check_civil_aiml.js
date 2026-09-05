require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const College = require('../models/College');
const Course = require('../models/Course');
const M = require('../models/CollegeCourseMapping');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // 1. Check AIML mappings - raw, not just active+verified
  const aiml = await Course.findOne({ courseName: 'ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING', category: 'Engineering' }).lean();
  console.log('AIML course ID:', aiml._id);
  const aimlAll = await M.find({ courseId: aiml._id }).lean();
  console.log('AIML ALL mappings (any status):', aimlAll.length);
  if (aimlAll.length > 0) {
    for (const m of aimlAll.slice(0, 3)) {
      console.log('  collegeId:', m.collegeId, '| isVerified:', m.isVerified, '| isActive:', m.isActive);
    }
  }

  // 2. Check: which colleges reference AIML course in coursesOffered
  const colleges = await College.find({ coursesOffered: aiml._id }).lean();
  console.log('\nColleges with AIML in coursesOffered:', colleges.length);
  for (const c of colleges) {
    console.log('  ', c.collegeName, '| stream:', c.stream);
  }

  // 3. Check Civil Engineering course names
  console.log('\n=== Civil Engineering courses ===');
  const civilCourses = await Course.find({ courseName: { $regex: /civil/i }, category: 'Engineering' }).lean();
  for (const c of civilCourses) {
    const cnt = await M.countDocuments({ courseId: c._id, isActive: true });
    console.log(`  "${c.courseName}" | status:${c.status} | mapped:${cnt}`);
  }

  // 4. What would getAllCourses return for Engineering? Check the dedup
  console.log('\n=== getAllCourses dedup check for Engineering ===');
  const allEng = await Course.find({ category: 'Engineering', status: 'active' }).sort({ courseName: 1 }).lean();
  const seen = new Set();
  const unique = [];
  for (const course of allEng) {
    const normKey = (course.courseName || '')
      .toLowerCase()
      .replace(/^(part-time\s+)?diploma\s+in\s+/i, '')
      .replace(/\s*\(polytechnic\)/i, '')
      .replace(/\s*\(diploma\)/i, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
    const dedupeKey = `${normKey}|${course.category}`;
    if (!seen.has(dedupeKey)) {
      seen.add(dedupeKey);
      unique.push(course);
    }
  }
  console.log('Total unique courses visible to student:', unique.length);
  // Check if Civil Engineering or AIML appears
  const civilVisible = unique.filter(c => c.courseName.toLowerCase().includes('civil'));
  const aimlVisible = unique.filter(c => c.courseName.toLowerCase().includes('artificial intelligence and machine learning'));
  console.log('Civil visible:', civilVisible.map(c => c.courseName));
  console.log('AIML visible:', aimlVisible.map(c => c.courseName));

  await mongoose.disconnect();
})();
