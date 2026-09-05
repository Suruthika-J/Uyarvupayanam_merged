require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Course = require('../models/Course');
const M = require('../models/CollegeCourseMapping');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Fix inactive AIML mappings
  const aiml = await Course.findOne({ courseName: 'ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING', category: 'Engineering' }).lean();
  const result = await M.updateMany(
    { courseId: aiml._id, isActive: false },
    { $set: { isActive: true } }
  );
  console.log('AIML mappings activated:', result.modifiedCount);

  // Check if any other Engineering mappings have isActive: false
  const inactiveEng = await M.countDocuments({ stream: 'Engineering', isActive: false });
  console.log('Other inactive Engineering mappings:', inactiveEng);

  // Also fix those
  const fixAll = await M.updateMany(
    { stream: 'Engineering', isActive: false },
    { $set: { isActive: true } }
  );
  console.log('All Engineering mappings activated:', fixAll.modifiedCount);

  // Final count
  const total = await M.countDocuments({ stream: 'Engineering', isActive: true, isVerified: true });
  console.log('Total active+verified Engineering mappings:', total);

  await mongoose.disconnect();
})();
