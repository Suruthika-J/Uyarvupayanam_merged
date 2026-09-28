require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');
const College = require('./models/College');
const Mapping = require('./models/CollegeCourseMapping');
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const levels = await Course.distinct('level');
    const targets = await Course.distinct('targetLevel');
    console.log('LEVEL distinct:', JSON.stringify(levels));
    console.log('targetLevel distinct:', JSON.stringify(targets));
    const sample = await Course.find({}, 'courseName level targetLevel category status').limit(40).lean();
    console.log('SAMPLES:');
    for (const c of sample) console.log(JSON.stringify({ n: c.courseName, l: c.level, t: c.targetLevel, cat: c.category, st: c.status }));
    console.log('College count:', await College.countDocuments());
    console.log('Mapping count:', await Mapping.countDocuments());
    const withCourses = await College.countDocuments({ coursesOffered: { $exists: true, $ne: [] } });
    console.log('Colleges with coursesOffered:', withCourses);
    const mapLevels = await Mapping.distinct('courseLevel');
    console.log('Mapping courseLevel distinct:', JSON.stringify(mapLevels));
    process.exit(0);
  } catch (e) { console.error('ERR', e.message); process.exit(1); }
})();
