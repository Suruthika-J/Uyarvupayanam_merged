require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const College = require('../models/College');
const CollegeCourseMapping = require('../models/CollegeCourseMapping');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Delete all Arts & Science mappings
  const deletedMappings = await CollegeCourseMapping.deleteMany({ stream: 'Arts & Science' });
  console.log(`Deleted ${deletedMappings.deletedCount} mappings`);

  // Delete Arts & Science courses that have NO mappings from any other stream
  const artsCourses = await Course.find({ category: 'Arts & Science' }).lean();
  const artsIds = artsCourses.map(c => c._id);
  
  // Check if any of these courses are used in other streams' mappings
  const usedInOtherMappings = await CollegeCourseMapping.find({
    courseId: { $in: artsIds },
    stream: { $ne: 'Arts & Science' }
  }).lean();
  const usedIds = new Set(usedInOtherMappings.map(m => m.courseId.toString()));
  
  const toDelete = artsIds.filter(id => !usedIds.has(id.toString()));
  if (toDelete.length > 0) {
    await Course.deleteMany({ _id: { $in: toDelete } });
    console.log(`Deleted ${toDelete.length} orphan Arts & Science courses`);
  }

  // Reset coursesOffered for all Arts & Science colleges
  await College.updateMany({ stream: 'Arts & Science' }, { $set: { coursesOffered: [] } });
  console.log('Reset coursesOffered for all Arts & Science colleges');

  await mongoose.disconnect();
  console.log('Done');
})();
