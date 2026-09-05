require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const College = require('../models/College');
const CollegeCourseMapping = require('../models/CollegeCourseMapping');
const Course = require('../models/Course');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const names = [
    'Community Science College and Research Institute',
    'Forest College and Research Institute',
    'Agricultural Engineering College and Research Institute',
    'Agricultural College and Research Institute, Coimbatore'
  ];

  for (const name of names) {
    const colleges = await College.find({ collegeName: { $regex: name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }).lean();
    console.log('\nQuery:', name);
    console.log('Matches:', colleges.length);
    colleges.forEach((c) => {
      console.log({ id: c._id.toString(), name: c.collegeName, stream: c.stream, coursesOffered: (c.coursesOffered || []).length });
    });

    if (colleges.length > 0) {
      const college = colleges[0];
      const mappings = await CollegeCourseMapping.find({ collegeId: college._id }).populate('courseId').lean();
      console.log('Mappings for first match:', mappings.length);
      console.log(JSON.stringify(mappings.map(m => ({ course: m.courseId?.courseName, id: m.courseId?._id?.toString(), source: m.source, verified: m.isVerified })), null, 2));
    }
  }

  await mongoose.disconnect();
})();
