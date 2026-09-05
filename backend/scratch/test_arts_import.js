require('dotenv').config();
const mongoose = require('mongoose');
const { importArtsScienceExcel } = require('../utils/artsScienceImporter');
const Course = require('../models/Course');
const College = require('../models/College');
const CollegeCourseMapping = require('../models/CollegeCourseMapping');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  const beforeCourses = await Course.countDocuments({ category: 'Arts & Science' });
  const beforeColleges = await College.countDocuments({ stream: 'Arts & Science' });
  const beforeMappings = await CollegeCourseMapping.countDocuments({ stream: 'Arts & Science' });
  console.log(`Before: ${beforeColleges} colleges, ${beforeCourses} courses, ${beforeMappings} mappings`);

  console.log('\nRunning Arts & Science importer...');
  const result = await importArtsScienceExcel(true);
  console.log('\nImport result:', JSON.stringify(result, null, 2));

  const afterCourses = await Course.countDocuments({ category: 'Arts & Science' });
  const afterColleges = await College.countDocuments({ stream: 'Arts & Science' });
  const afterMappings = await CollegeCourseMapping.countDocuments({ stream: 'Arts & Science' });
  console.log(`\nAfter: ${afterColleges} colleges, ${afterCourses} courses, ${afterMappings} mappings`);

  // Check for duplicates
  const courses = await Course.find({ category: 'Arts & Science' }).lean();
  const courseNames = {};
  for (const c of courses) {
    const k = c.courseName.toLowerCase().trim();
    courseNames[k] = (courseNames[k] || 0) + 1;
  }
  const dups = Object.entries(courseNames).filter(([, v]) => v > 1);
  console.log(`\nDuplicate course names: ${dups.length}`);
  for (const [name, count] of dups.slice(0, 10)) {
    console.log(`  "${name}" x${count}`);
  }

  // Check mappings
  const mappings = await CollegeCourseMapping.find({ stream: 'Arts & Science' }).lean();
  const mapPairs = {};
  for (const m of mappings) {
    const k = m.collegeId.toString() + '_' + m.courseId.toString();
    mapPairs[k] = (mapPairs[k] || 0) + 1;
  }
  const dupPairs = Object.entries(mapPairs).filter(([, v]) => v > 1);
  console.log(`Duplicate mapping pairs: ${dupPairs.length}`);

  // Check orphans
  const courseIds = new Set(courses.map(c => c._id.toString()));
  const orphans = mappings.filter(m => !courseIds.has(m.courseId.toString()));
  console.log(`Orphan mappings: ${orphans.length}`);

  // Sample data
  const sampleCollege = await College.findOne({ stream: 'Arts & Science' }).lean();
  if (sampleCollege) {
    const collegeMappings = mappings.filter(m => m.collegeId.toString() === sampleCollege._id.toString());
    console.log(`\nSample: "${sampleCollege.collegeName}" has ${collegeMappings.length} mapped courses`);
    for (const m of collegeMappings.slice(0, 5)) {
      console.log(`  - ${m.courseName}`);
    }
  }

  await mongoose.disconnect();
  console.log('\nDone.');
})();
