require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const College = require('../models/College');
const Course = require('../models/Course');
const M = require('../models/CollegeCourseMapping');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Find a college with courses
  const c = await College.findOne({ stream: 'Engineering', coursesOffered: { $ne: [] } }).lean();
  if (!c) { console.log('No college found'); await mongoose.disconnect(); return; }

  console.log('College:', c.collegeName);
  console.log('coursesOffered count:', c.coursesOffered.length);

  const ids = c.coursesOffered.slice(0, 20).map(String);
  const courses = await Course.find({ _id: { $in: ids } }).lean();
  courses.forEach(co => console.log(' ', co.courseName, '|', co.category));

  // Check: what courseName does "COMPUTER SCIENCE AND ENGINEERING" map to
  const cse = await Course.findOne({ courseName: 'COMPUTER SCIENCE AND ENGINEERING', category: 'Engineering' }).lean();
  console.log('\nCSE course:', cse?.courseName, '| ID:', cse?._id);
  const cseMappings = await M.countDocuments({ courseId: cse._id, isActive: true });
  console.log('CSE mapped colleges:', cseMappings);

  // Check the B.E. variant
  const beCse = await Course.findOne({ courseName: 'B.E. Computer Science And Engineering', category: 'Engineering' }).lean();
  console.log('\nB.E. CSE course:', beCse?.courseName, '| ID:', beCse?._id);
  const beMappings = await M.countDocuments({ courseId: beCse._id, isActive: true });
  console.log('B.E. CSE mapped colleges:', beMappings);

  // Check which courses have the most mappings
  console.log('\n=== TOP 10 COURSES BY MAPPING COUNT ===');
  const topCourses = await M.aggregate([
    { $match: { stream: 'Engineering', isActive: true, isVerified: true } },
    { $group: { _id: '$courseId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  for (const tc of topCourses) {
    const course = await Course.findById(tc._id).lean();
    console.log(`  ${course?.courseName}: ${tc.count} colleges`);
  }

  // Check how many courses are referenced by colleges but have no mappings
  console.log('\n=== MAPPING COVERAGE ===');
  const allEngMappings = await M.countDocuments({ stream: 'Engineering', isActive: true });
  console.log('Total active Engineering mappings:', allEngMappings);

  await mongoose.disconnect();
})();
