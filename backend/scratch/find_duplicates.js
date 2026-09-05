require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const College = require('../models/College');
const CollegeCourseMapping = require('../models/CollegeCourseMapping');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // 1. Duplicate courses
  const courses = await Course.find({ category: 'Polytechnic' }).lean();
  console.log('\n=== TOTAL POLYTECHNIC COURSES:', courses.length);

  const courseMap = {};
  for (const c of courses) {
    const key = c.courseName.toLowerCase().trim();
    if (!courseMap[key]) courseMap[key] = [];
    courseMap[key].push({ id: c._id.toString(), name: c.courseName, slug: c.slug });
  }

  const dupCourses = Object.entries(courseMap).filter(([, v]) => v.length > 1);
  console.log('Duplicate course name groups:', dupCourses.length);
  let totalDupCourses = 0;
  for (const [name, items] of dupCourses) {
    console.log(`  "${name}" (${items.length} copies):`, items.map(i => i.id));
    totalDupCourses += items.length - 1;
  }
  console.log('Total duplicate course records:', totalDupCourses);

  // 2. Duplicate mappings
  const mappings = await CollegeCourseMapping.find({ stream: 'Polytechnic' }).lean();
  console.log('\n=== TOTAL POLYTECHNIC MAPPINGS:', mappings.length);

  const mapKey = {};
  for (const m of mappings) {
    const key = m.collegeId.toString() + '_' + m.courseId.toString();
    if (!mapKey[key]) mapKey[key] = [];
    mapKey[key].push(m._id.toString());
  }

  const dupMaps = Object.entries(mapKey).filter(([, v]) => v.length > 1);
  console.log('Duplicate mapping groups:', dupMaps.length);
  let totalDupMappings = 0;
  for (const [key, ids] of dupMaps) {
    console.log(`  ${key} (${ids.length}):`, ids);
    totalDupMappings += ids.length - 1;
  }
  console.log('Total duplicate mapping records:', totalDupMappings);

  // 3. Duplicate colleges
  const colleges = await College.find({ stream: 'Polytechnic' }).lean();
  console.log('\n=== TOTAL POLYTECHNIC COLLEGES:', colleges.length);

  const colMap = {};
  for (const c of colleges) {
    const key = (c.collegeName || c.name || '').toLowerCase().trim();
    if (!colMap[key]) colMap[key] = [];
    colMap[key].push(c._id.toString());
  }

  const dupCols = Object.entries(colMap).filter(([, v]) => v.length > 1);
  console.log('Duplicate college name groups:', dupCols.length);
  let totalDupCols = 0;
  for (const [name, ids] of dupCols) {
    console.log(`  "${name}" (${ids.length}):`, ids);
    totalDupCols += ids.length - 1;
  }
  console.log('Total duplicate college records:', totalDupCols);

  // 4. Check for mappings referencing non-existent courses
  const allCourseIds = courses.map(c => c._id.toString());
  const orphanMappings = mappings.filter(m => !allCourseIds.includes(m.courseId.toString()));
  console.log('\n=== ORPHAN MAPPINGS (course not found):', orphanMappings.length);

  // 5. List all unique course names for reference
  const uniqueCourseNames = Object.keys(courseMap).sort();
  console.log('\n=== ALL UNIQUE POLY TECHNIC COURSE NAMES:', uniqueCourseNames.length);
  for (const name of uniqueCourseNames) {
    console.log(`  "${name}" (${courseMap[name].length}x)`);
  }

  await mongoose.disconnect();
  console.log('\nDone.');
})();
