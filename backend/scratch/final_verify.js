require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const College = require('../models/College');
const CollegeCourseMapping = require('../models/CollegeCourseMapping');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('=== FINAL DATA INTEGRITY VERIFICATION ===\n');

  // 1. Courses
  const courses = await Course.find({ category: 'Polytechnic' }).lean();
  const courseNames = {};
  for (const c of courses) {
    const k = c.courseName.toLowerCase().trim();
    courseNames[k] = (courseNames[k] || 0) + 1;
  }
  const dupCourses = Object.entries(courseNames).filter(([, v]) => v > 1);
  console.log(`[COURSES] Total: ${courses.length}`);
  console.log(`[COURSES] Unique names: ${Object.keys(courseNames).length}`);
  console.log(`[COURSES] Duplicate names: ${dupCourses.length} ${dupCourses.length === 0 ? '✓' : '✗'}`);

  // 2. Mappings
  const mappings = await CollegeCourseMapping.find({ stream: 'Polytechnic' }).lean();
  const mappingPairs = {};
  for (const m of mappings) {
    const k = m.collegeId.toString() + '_' + m.courseId.toString();
    mappingPairs[k] = (mappingPairs[k] || 0) + 1;
  }
  const dupMappings = Object.entries(mappingPairs).filter(([, v]) => v > 1);
  console.log(`\n[MAPPINGS] Total: ${mappings.length}`);
  console.log(`[MAPPINGS] Unique pairs: ${Object.keys(mappingPairs).length}`);
  console.log(`[MAPPINGS] Duplicate pairs: ${dupMappings.length} ${dupMappings.length === 0 ? '✓' : '✗'}`);

  // 3. Orphan mappings
  const courseIds = new Set(courses.map(c => c._id.toString()));
  const orphans = mappings.filter(m => !courseIds.has(m.courseId.toString()));
  console.log(`[MAPPINGS] Orphan (course not found): ${orphans.length} ${orphans.length === 0 ? '✓' : '✗'}`);

  // 4. Verified/Active status
  const activeVerified = mappings.filter(m => m.isVerified && m.isActive);
  const notVerified = mappings.filter(m => !m.isVerified);
  const notActive = mappings.filter(m => !m.isActive);
  console.log(`[MAPPINGS] Active+Verified: ${activeVerified.length}`);
  console.log(`[MAPPINGS] Not verified: ${notVerified.length} ${notVerified.length === 0 ? '✓' : '✗'}`);
  console.log(`[MAPPINGS] Not active: ${notActive.length} ${notActive.length === 0 ? '✓' : '✗'}`);

  // 5. Colleges
  const colleges = await College.find({ stream: 'Polytechnic' }).lean();
  const colNames = {};
  for (const c of colleges) {
    const k = (c.collegeName || '').toLowerCase().trim();
    colNames[k] = (colNames[k] || 0) + 1;
  }
  const dupCols = Object.entries(colNames).filter(([, v]) => v > 1);
  console.log(`\n[COLLEGES] Total: ${colleges.length}`);
  console.log(`[COLLEGES] Unique names: ${Object.keys(colNames).length}`);
  console.log(`[COLLEGES] Duplicate names: ${dupCols.length} ${dupCols.length === 0 ? '✓' : '✗'}`);

  // 6. Colleges with 0 courses
  const noCourses = colleges.filter(c => !c.coursesOffered || c.coursesOffered.length === 0);
  console.log(`[COLLEGES] With 0 courses: ${noCourses.length} ${noCourses.length === 0 ? '✓' : '✗'}`);

  // 7. Verify mapping data matches college.coursesOffered
  let mismatchCount = 0;
  for (const college of colleges) {
    if (!college.coursesOffered) continue;
    const collegeMappings = mappings.filter(m => m.collegeId.toString() === college._id.toString());
    const mappedCourseIds = new Set(collegeMappings.map(m => m.courseId.toString()));
    const offeredCourseIds = new Set(college.coursesOffered.map(id => id.toString()));

    // Check all mapped courses are in coursesOffered
    for (const cid of mappedCourseIds) {
      if (!offeredCourseIds.has(cid)) {
        mismatchCount++;
        break;
      }
    }
  }
  console.log(`\n[SYNC] College.coursesOffered vs mappings mismatch: ${mismatchCount} ${mismatchCount === 0 ? '✓' : '✗'}`);

  // 8. Per-course mapping summary (top 10)
  const courseMappingCounts = {};
  for (const m of mappings) {
    const cid = m.courseId.toString();
    courseMappingCounts[cid] = (courseMappingCounts[cid] || 0) + 1;
  }
  const sorted = Object.entries(courseMappingCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);
  
  console.log('\n[TOP 10 COURSES BY COLLEGE COUNT]');
  for (const [cid, count] of sorted) {
    const course = courses.find(c => c._id.toString() === cid);
    console.log(`  ${count} colleges: ${course?.courseName || cid}`);
  }

  // Summary
  const allPassed = 
    dupCourses.length === 0 &&
    dupMappings.length === 0 &&
    orphans.length === 0 &&
    notVerified.length === 0 &&
    notActive.length === 0 &&
    dupCols.length === 0 &&
    noCourses.length === 0 &&
    mismatchCount === 0;

  console.log(`\n${'='.repeat(50)}`);
  console.log(`RESULT: ${allPassed ? 'ALL CHECKS PASSED ✓' : 'SOME CHECKS FAILED ✗'}`);

  await mongoose.disconnect();
})();
