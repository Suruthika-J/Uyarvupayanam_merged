require('dotenv').config();
const mongoose = require('mongoose');
const { importDiplomaCSV } = require('../utils/diplomaImporter');
const Course = require('../models/Course');
const CollegeCourseMapping = require('../models/CollegeCourseMapping');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  // Count before
  const beforeCourses = await Course.countDocuments({ category: 'Polytechnic' });
  const beforeMappings = await CollegeCourseMapping.countDocuments({ stream: 'Polytechnic' });
  console.log(`Before: ${beforeCourses} courses, ${beforeMappings} mappings`);

  // Run import with forceSync (bypasses file-change check)
  console.log('\nRunning importer with forceSync...');
  const result = await importDiplomaCSV(true);
  console.log('\nImport result:', JSON.stringify(result, null, 2));

  // Count after
  const afterCourses = await Course.countDocuments({ category: 'Polytechnic' });
  const afterMappings = await CollegeCourseMapping.countDocuments({ stream: 'Polytechnic' });
  console.log(`\nAfter: ${afterCourses} courses, ${afterMappings} mappings`);

  // Check for duplicates
  const courses = await Course.find({ category: 'Polytechnic' }).lean();
  const courseMap = {};
  for (const c of courses) {
    const key = c.courseName.toLowerCase().trim();
    if (!courseMap[key]) courseMap[key] = [];
    courseMap[key].push(c._id.toString());
  }
  const dups = Object.entries(courseMap).filter(([, v]) => v.length > 1);
  console.log(`\nDuplicate course names: ${dups.length}`);
  if (dups.length > 0) {
    for (const [name, ids] of dups) {
      console.log(`  "${name}" x${ids.length}`);
    }
  }

  // Check for duplicate mappings
  const mappings = await CollegeCourseMapping.find({ stream: 'Polytechnic' }).lean();
  const mapKey = {};
  for (const m of mappings) {
    const k = m.collegeId.toString() + '_' + m.courseId.toString();
    if (!mapKey[k]) mapKey[k] = [];
    mapKey[k].push(m._id.toString());
  }
  const dupMappings = Object.entries(mapKey).filter(([, v]) => v.length > 1);
  console.log(`Duplicate mapping pairs: ${dupMappings.length}`);

  await mongoose.disconnect();
  console.log('\nDone.');
})();
