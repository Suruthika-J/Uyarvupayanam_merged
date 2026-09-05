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

  const allEng = await Course.find({ category: 'Engineering', status: 'active' }).lean();

  // Simulate what the student sees after getAllCourses dedup
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

  // For each unique visible course, simulate getStudentCourseDetails normalization
  console.log('=== VISIBLE ENGINEERING COURSES WITH COLLEGE COUNTS ===\n');
  const results = [];
  for (const course of unique) {
    const tNorm = normalizeCourseName(course.courseName);
    const variantIds = allEng
      .filter(c => normalizeCourseName(c.courseName) === tNorm)
      .map(c => c._id);
    const collegeIds = await M.distinct('collegeId', {
      courseId: { $in: variantIds },
      isActive: true,
      isVerified: true
    });
    results.push({ name: course.courseName, colleges: collegeIds.length, variants: variantIds.length });
  }

  // Sort by name
  results.sort((a, b) => a.name.localeCompare(b.name));
  for (const r of results) {
    const marker = r.colleges === 0 ? ' ⚠️' : '';
    console.log(`  ${r.name} (${r.variants} variants) → ${r.colleges} colleges${marker}`);
  }

  const noColleges = results.filter(r => r.colleges === 0);
  console.log(`\nTotal: ${results.length} courses, ${noColleges.length} with 0 colleges`);

  await mongoose.disconnect();
})();
