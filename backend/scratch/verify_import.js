const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function verify() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const College = require('../models/College');
  const Course = require('../models/Course');
  const CollegeCourseMapping = require('../models/CollegeCourseMapping');
  
  const polyCount = await College.countDocuments({ stream: 'Polytechnic' });
  console.log('Polytechnic colleges in DB:', polyCount);
  
  const polyCourses = await Course.countDocuments({ category: 'Polytechnic' });
  console.log('Polytechnic courses in DB:', polyCourses);
  
  const activeMappings = await CollegeCourseMapping.countDocuments({ stream: 'Polytechnic', isActive: true, isVerified: true });
  console.log('Active verified Polytechnic mappings:', activeMappings);
  
  const sample = await College.findOne({ stream: 'Polytechnic' }).populate('coursesOffered');
  console.log('\nSample college:', sample?.collegeName);
  console.log('  Code:', sample?.collegeCode);
  console.log('  District:', sample?.district);
  console.log('  Courses offered:', sample?.coursesOffered?.length);
  if (sample?.coursesOffered?.length > 0) {
    sample.coursesOffered.forEach(c => console.log('    -', c.courseName));
  }
  
  const dupPipeline = [
    { $match: { stream: 'Polytechnic', isActive: true } },
    { $group: { _id: { collegeId: '$collegeId', courseId: '$courseId' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ];
  const dups = await CollegeCourseMapping.aggregate(dupPipeline);
  console.log('\nDuplicate mappings:', dups.length);
  
  const noCourses = await College.countDocuments({ stream: 'Polytechnic', coursesOffered: { $size: 0 } });
  console.log('Polytechnic colleges with 0 courses:', noCourses);
  
  const districts = await College.distinct('district', { stream: 'Polytechnic' });
  console.log('Unique districts:', districts.length);

  const allCourses = await Course.find({ category: 'Polytechnic' }).select('courseName').sort({ courseName: 1 });
  console.log('\nAll Polytechnic courses:');
  allCourses.forEach(c => console.log('  -', c.courseName));

  await mongoose.disconnect();
}
verify().catch(e => { console.error(e); process.exit(1); });
