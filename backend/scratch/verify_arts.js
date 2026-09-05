require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const College = require('../models/College');
const CollegeCourseMapping = require('../models/CollegeCourseMapping');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('=== ARTS & SCIENCE DATA VERIFICATION ===\n');

  const STREAM = 'Arts & Science';
  const CATEGORY = 'Arts & Science';

  // 1. Colleges
  const colleges = await College.find({ stream: STREAM }).lean();
  console.log(`[COLLEGES] Total: ${colleges.length}`);
  
  const govColleges = colleges.filter(c => c.collegeType === 'Government');
  const privColleges = colleges.filter(c => c.collegeType === 'Private');
  console.log(`  Government: ${govColleges.length}`);
  console.log(`  Private: ${privColleges.length}`);

  // College name duplicates
  const colNames = {};
  for (const c of colleges) {
    const k = c.collegeName.toLowerCase().trim();
    colNames[k] = (colNames[k] || 0) + 1;
  }
  const dupCols = Object.entries(colNames).filter(([, v]) => v > 1);
  console.log(`  Duplicate names: ${dupCols.length} ${dupCols.length === 0 ? '✓' : '✗'}`);

  // Colleges with 0 courses
  const noCourses = colleges.filter(c => !c.coursesOffered || c.coursesOffered.length === 0);
  console.log(`  With 0 courses: ${noCourses.length}`);

  // 2. Courses
  const courses = await Course.find({ category: CATEGORY }).lean();
  console.log(`\n[COURSES] Total: ${courses.length}`);
  
  const courseNames = {};
  for (const c of courses) {
    const k = c.courseName.toLowerCase().trim();
    courseNames[k] = (courseNames[k] || 0) + 1;
  }
  const dupCourses = Object.entries(courseNames).filter(([, v]) => v > 1);
  console.log(`  Unique names: ${Object.keys(courseNames).length}`);
  console.log(`  Duplicate names: ${dupCourses.length} ${dupCourses.length === 0 ? '✓' : '✗'}`);

  // 3. Mappings
  const mappings = await CollegeCourseMapping.find({ stream: STREAM }).lean();
  console.log(`\n[MAPPINGS] Total: ${mappings.length}`);
  
  const verifiedActive = mappings.filter(m => m.isVerified && m.isActive);
  console.log(`  Verified+Active: ${verifiedActive.length} ${verifiedActive.length === mappings.length ? '✓' : '✗'}`);

  // Mapping pair duplicates
  const mapPairs = {};
  for (const m of mappings) {
    const k = m.collegeId.toString() + '_' + m.courseId.toString();
    mapPairs[k] = (mapPairs[k] || 0) + 1;
  }
  const dupPairs = Object.entries(mapPairs).filter(([, v]) => v > 1);
  console.log(`  Duplicate pairs: ${dupPairs.length} ${dupPairs.length === 0 ? '✓' : '✗'}`);

  // Orphan mappings
  const courseIds = new Set(courses.map(c => c._id.toString()));
  const orphans = mappings.filter(m => !courseIds.has(m.courseId.toString()));
  console.log(`  Orphan mappings: ${orphans.length} ${orphans.length === 0 ? '✓' : '✗'}`);

  // 4. Sync check
  let mismatch = 0;
  for (const college of colleges) {
    if (!college.coursesOffered || college.coursesOffered.length === 0) continue;
    const cm = mappings.filter(m => m.collegeId.toString() === college._id.toString());
    const mapped = new Set(cm.map(m => m.courseId.toString()));
    const offered = new Set(college.coursesOffered.map(id => id.toString()));
    for (const cid of mapped) {
      if (!offered.has(cid)) { mismatch++; break; }
    }
  }
  console.log(`\n[SYNC] College.coursesOffered vs mappings mismatch: ${mismatch} ${mismatch === 0 ? '✓' : '✗'}`);

  // 5. Top courses by college count
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

  // 6. Sample college with courses
  const sample = colleges.find(c => c.coursesOffered && c.coursesOffered.length > 5);
  if (sample) {
    const cm = mappings.filter(m => m.collegeId.toString() === sample._id.toString());
    console.log(`\n[SAMPLE] "${sample.collegeName}" (${sample.collegeType}, ${sample.district})`);
    console.log(`  ${cm.length} mapped courses:`);
    for (const m of cm.slice(0, 8)) {
      console.log(`    - ${m.courseName}`);
    }
  }

  await mongoose.disconnect();
  console.log('\nDone.');
})();
