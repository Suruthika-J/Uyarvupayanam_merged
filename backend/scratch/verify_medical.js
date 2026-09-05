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
  const mmActive = await M.countDocuments({ stream: 'Medical', isActive: true, isVerified: true });
  console.log('Medical colleges:', mc);
  console.log('Medical courses:', cc);
  console.log('Medical mappings:', mm);
  console.log('Medical active+verified mappings:', mmActive);

  // Check if all Medical colleges have coursesOffered
  const noCourses = await College.countDocuments({ stream: 'Medical', coursesOffered: { $size: 0 } });
  console.log('Medical colleges with 0 coursesOffered:', noCourses);

  // Sample: which colleges were matched
  const sample = await College.find({ stream: 'Medical' }).limit(5).lean();
  for (const c of sample) {
    const mappingCount = await M.countDocuments({ collegeId: c._id, isActive: true });
    console.log(`  ${c.collegeName} | courses: ${(c.coursesOffered || []).length} | mappings: ${mappingCount}`);
  }

  // Verify all streams
  console.log('\n=== ALL STREAMS ===');
  for (const s of ['Engineering', 'Medical', 'Arts & Science', 'Law', 'Polytechnic', 'Agriculture']) {
    const col = await College.countDocuments({ stream: s });
    const cor = await Course.countDocuments({ category: s });
    const map = await M.countDocuments({ stream: s, isActive: true, isVerified: true });
    console.log(`${s}: ${col} colleges, ${cor} courses, ${map} mappings`);
  }

  await mongoose.disconnect();
})();
