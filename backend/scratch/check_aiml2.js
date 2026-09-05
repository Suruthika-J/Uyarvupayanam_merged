require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const College = require('../models/College');
const Course = require('../models/Course');
const M = require('../models/CollegeCourseMapping');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Find the AIML course
  const aiml = await Course.findOne({ courseName: 'ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING', category: 'Engineering' }).lean();
  console.log('AIML course ID:', aiml._id);

  // Check if ANY college has this course in coursesOffered
  const collegesWithAIML = await College.find({ coursesOffered: aiml._id }).lean();
  console.log('Colleges with AIML in coursesOffered:', collegesWithAIML.length);

  // Check all courses that contain "machine learning" in any college's coursesOffered
  const allEngCourses = await Course.find({ category: 'Engineering' }).lean();
  const mlCourses = allEngCourses.filter(c => c.courseName.toLowerCase().includes('machine learning'));
  console.log('\nAll ML-related courses:');
  for (const c of mlCourses) {
    const cnt = await College.countDocuments({ coursesOffered: c._id });
    console.log(`  "${c.courseName}" (${c._id}): referenced by ${cnt} colleges`);
  }

  // Also check B.E. variants
  const beMlCourses = allEngCourses.filter(c => {
    const n = c.courseName.toLowerCase();
    return n.includes('b.e.') && n.includes('artificial intelligence') && n.includes('machine learning');
  });
  console.log('\nB.E. AIML courses:');
  for (const c of beMlCourses) {
    const cnt = await College.countDocuments({ coursesOffered: c._id });
    console.log(`  "${c.courseName}" (${c._id}): referenced by ${cnt} colleges`);
  }

  // Check courses that have mappings but not in coursesOffered
  const aimlMappings = await M.find({ courseId: aiml._id, isActive: true }).lean();
  console.log('\nAIML mapping entries:', aimlMappings.length);

  await mongoose.disconnect();
})();
