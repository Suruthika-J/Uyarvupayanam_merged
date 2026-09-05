require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const College = require('../models/College');
const CollegeCourseMapping = require('../models/CollegeCourseMapping');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Cleaning up remaining issues...\n');

  // 1. Delete orphan mappings (course no longer exists)
  const courses = await Course.find({ category: 'Polytechnic' }).lean();
  const courseIds = new Set(courses.map(c => c._id.toString()));
  const allMappings = await CollegeCourseMapping.find({ stream: 'Polytechnic' }).lean();
  
  const orphanIds = allMappings
    .filter(m => !courseIds.has(m.courseId.toString()))
    .map(m => m._id);
  
  if (orphanIds.length > 0) {
    await CollegeCourseMapping.deleteMany({ _id: { $in: orphanIds } });
    console.log(`Deleted ${orphanIds.length} orphan mappings`);
  }

  // 2. Check for the mystery courseId "69ea75b43de2eee3fbb4ab09"
  const mysteryMappings = allMappings.filter(m => m.courseId.toString() === '69ea75b43de2eee3fbb4ab09');
  console.log(`\nMystery courseId 69ea75b43de2eee3fbb4ab09: ${mysteryMappings.length} mappings`);
  const mysteryCourse = await Course.findById('69ea75b43de2eee3fbb4ab09');
  console.log(`Course exists in DB: ${mysteryCourse ? 'YES - ' + mysteryCourse.courseName : 'NO'}`);

  // 3. Fix not-active mappings (set isActive = true for all verified Polytechnic mappings)
  const inactiveResult = await CollegeCourseMapping.updateMany(
    { stream: 'Polytechnic', isActive: false },
    { $set: { isActive: true } }
  );
  console.log(`\nReactivated ${inactiveResult.modifiedCount} inactive mappings`);

  // 4. Re-check after fixes
  const finalMappings = await CollegeCourseMapping.find({ stream: 'Polytechnic' }).lean();
  const finalCourseIds = new Set(courses.map(c => c._id.toString()));
  const remainingOrphans = finalMappings.filter(m => !finalCourseIds.has(m.courseId.toString()));
  const remainingInactive = finalMappings.filter(m => !m.isActive);
  console.log(`\nRemaining orphans: ${remainingOrphans.length}`);
  console.log(`Remaining inactive: ${remainingInactive.length}`);

  // 5. Fix College.coursesOffered sync
  const colleges = await College.find({ stream: 'Polytechnic' }).lean();
  const collegeUpdateOps = [];
  let collegesUpdated = 0;

  for (const college of colleges) {
    const collegeMappings = finalMappings.filter(m => m.collegeId.toString() === college._id.toString());
    const mappedIds = [...new Set(collegeMappings.map(m => m.courseId.toString()))].sort();
    const currentIds = (college.coursesOffered || []).map(id => id.toString()).sort();

    if (JSON.stringify(mappedIds) !== JSON.stringify(currentIds)) {
      collegeUpdateOps.push({
        updateOne: {
          filter: { _id: college._id },
          update: { $set: { coursesOffered: mappedIds.map(id => new mongoose.Types.ObjectId(id)) } }
        }
      });
      collegesUpdated++;
    }
  }

  if (collegeUpdateOps.length > 0) {
    await College.bulkWrite(collegeUpdateOps);
    console.log(`\nSynced ${collegesUpdated} colleges' coursesOffered`);
  }

  // 6. Final counts
  const finalCourses = await Course.countDocuments({ category: 'Polytechnic' });
  const finalMappingCount = await CollegeCourseMapping.countDocuments({ stream: 'Polytechnic' });
  const finalCollegeCount = await College.countDocuments({ stream: 'Polytechnic' });
  console.log(`\n=== FINAL STATE ===`);
  console.log(`Courses: ${finalCourses}`);
  console.log(`Mappings: ${finalMappingCount}`);
  console.log(`Colleges: ${finalCollegeCount}`);

  await mongoose.disconnect();
})();
