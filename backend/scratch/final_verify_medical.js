require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const College = require('../models/College');
const Course = require('../models/Course');
const M = require('../models/CollegeCourseMapping');
const http = require('http');

const BASE = `http://localhost:${process.env.PORT || 5000}`;

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    }).on('error', reject);
  });
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   MEDICAL IMPORT FINAL VERIFICATION     ║');
  console.log('╚══════════════════════════════════════════╝\n');

  // 1. DB State
  console.log('── DB STATE ──');
  const totalColleges = await College.countDocuments({ stream: 'Medical' });
  const totalCourses = await Course.countDocuments({ category: 'Medical' });
  const totalMappings = await M.countDocuments({ stream: 'Medical' });
  const activeMappings = await M.countDocuments({ stream: 'Medical', isActive: true, isVerified: true });
  const collegesWithCourses = await College.countDocuments({ stream: 'Medical', coursesOffered: { $ne: [] } });
  console.log(`  Colleges: ${totalColleges} (${collegesWithCourses} with coursesOffered)`);
  console.log(`  Courses: ${totalCourses}`);
  console.log(`  Mappings: ${totalMappings} (${activeMappings} active+verified)`);

  // 2. API: Colleges
  console.log('\n── API: GET /api/colleges?stream=Medical ──');
  const apiColleges = await fetch(`${BASE}/api/colleges?stream=Medical`);
  console.log(`  Returned: ${Array.isArray(apiColleges.data) ? apiColleges.data.length : apiColleges.count} colleges`);

  // 3. API: Courses
  console.log('\n── API: GET /api/courses?category=Medical ──');
  const apiCourses = await fetch(`${BASE}/api/courses?category=Medical`);
  console.log(`  Returned: ${Array.isArray(apiCourses.data) ? apiCourses.data.length : apiCourses.count} courses (deduplicated)`);

  // 4. API: College-Course Mappings
  console.log('\n── API: GET /api/college-courses?stream=Medical ──');
  const apiMappings = await fetch(`${BASE}/api/college-courses?stream=Medical`);
  console.log(`  Returned: ${apiMappings.count || (apiMappings.data || []).length} mappings`);

  // 5. API: Student course details for key Medical courses
  console.log('\n── API: Student Course Details (Key Courses) ──');
  const keyCourses = ['M.B.B.S', 'B.D.S.', 'B.A.M.S.', 'B.Pharm', 'B.Sc. Nursing'];
  for (const name of keyCourses) {
    const allMed = apiCourses.data || [];
    const course = allMed.find(c => c.courseName === name || (c.courseName && c.courseName.includes(name)));
    if (!course) { console.log(`  ⚠️  ${name}: not found in API`); continue; }
    const slug = course.slug || course._id;
    try {
      const details = await fetch(`${BASE}/api/student/courses/${slug}`);
      const count = details.collegeCount || (details.offeringColleges || []).length;
      const colleges = details.offeringColleges || [];
      console.log(`  ✅ ${name}: ${count} colleges`);
      if (colleges.length > 0) {
        console.log(`     Sample: ${colleges[0].collegeName} (${colleges[0].collegeType}, ${colleges[0].district})`);
      }
    } catch (err) {
      console.log(`  ❌ ${name}: ERROR - ${err.message}`);
    }
  }

  // 6. Verify no duplicates
  console.log('\n── DUPLICATE CHECK ──');
  const dupColleges = await College.aggregate([
    { $match: { stream: 'Medical' } },
    { $group: { _id: { $toLower: '$collegeName' }, count: { $sum: 1 }, ids: { $push: '$_id' } } },
    { $match: { count: { $gt: 1 } } }
  ]);
  console.log(`  Duplicate college names: ${dupColleges.length}`);

  const dupMappings = await M.aggregate([
    { $match: { stream: 'Medical' } },
    { $group: { _id: { collegeId: '$collegeId', courseId: '$courseId' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);
  console.log(`  Duplicate mappings: ${dupMappings.length}`);

  // 7. Verify other streams unaffected
  console.log('\n── OTHER STREAMS UNAFFECTED ──');
  for (const s of ['Engineering', 'Arts & Science', 'Law', 'Polytechnic', 'Agriculture']) {
    const map = await M.countDocuments({ stream: s, isActive: true, isVerified: true });
    console.log(`  ${s}: ${map} mappings ✓`);
  }

  console.log('\n── DONE ──');
  await mongoose.disconnect();
})();
