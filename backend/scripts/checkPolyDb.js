const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const College = require('../models/College');
const Course = require('../models/Course');
const Mapping = require('../models/CollegeCourseMapping');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const polyColleges = await College.find({ stream: 'Polytechnic' });
  console.log('Polytechnic colleges in DB:', polyColleges.length);

  const diplomaColleges = await College.find({ stream: 'Diploma' });
  console.log('Diploma colleges in DB:', diplomaColleges.length);

  const polyMappings = await Mapping.find({ stream: 'Polytechnic', isActive: true });
  console.log('Active Polytechnic mappings:', polyMappings.length);

  const diplomaMappings = await Mapping.find({ stream: 'Diploma', isActive: true });
  console.log('Active Diploma mappings:', diplomaMappings.length);

  const polyCourses = await Course.find({ category: 'Polytechnic', status: 'active' });
  console.log('Polytechnic courses:', polyCourses.length);
  polyCourses.forEach(c => console.log('  ', c.courseName));

  const diplomaCourses = await Course.find({ category: 'Diploma', status: 'active' });
  console.log('Diploma courses:', diplomaCourses.length);
  diplomaCourses.forEach(c => console.log('  ', c.courseName));

  // Check all colleges with Polytechnic or Diploma in streamsOffered
  const allPolyDiploma = await College.find({
    $or: [
      { stream: 'Polytechnic' },
      { stream: 'Diploma' },
      { streamsOffered: { $in: ['Polytechnic', 'Diploma'] } }
    ]
  });
  console.log('\nAll Polytechnic/Diploma colleges:', allPolyDiploma.length);

  // Check all active mappings with Diploma courses
  const allDiplomaMaps = await Mapping.find({
    $or: [{ stream: 'Polytechnic' }, { stream: 'Diploma' }],
    isActive: true
  }).populate('collegeId', 'collegeName stream').populate('courseId', 'courseName');
  console.log('All active Poly/Diploma mappings:', allDiplomaMaps.length);

  // Sample some mappings
  console.log('\nSample mappings:');
  allDiplomaMaps.slice(0, 10).forEach(m => {
    console.log('  ', m.collegeId?.collegeName, '->', m.courseId?.courseName, '| stream:', m.stream);
  });

  process.exit(0);
})();
