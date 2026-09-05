/**
 * Sync Engineering CollegeCourseMapping from College.coursesOffered
 * Uses bulkWrite for performance. Idempotent via upsert.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const College = require('../models/College');
const Course = require('../models/Course');
const CollegeCourseMapping = require('../models/CollegeCourseMapping');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB\n');

    const engColleges = await College.find({ stream: 'Engineering' }).lean();
    console.log(`Engineering colleges: ${engColleges.length}`);

    // Build all operations in memory first
    const ops = [];
    let noCourses = 0;

    for (const college of engColleges) {
      if (!college.coursesOffered || college.coursesOffered.length === 0) {
        noCourses++;
        continue;
      }
      for (const courseId of college.coursesOffered) {
        ops.push({
          updateOne: {
            filter: { collegeId: college._id, courseId: courseId },
            update: {
              $setOnInsert: {
                collegeId: college._id,
                courseId: courseId,
                stream: 'Engineering',
                source: 'Sync',
                isVerified: true,
                isActive: true,
                collegeName: college.collegeName,
              }
            },
            upsert: true
          }
        });
      }
    }

    console.log(`Total mapping operations to process: ${ops.length}`);
    console.log(`Colleges with 0 courses: ${noCourses}`);

    // Process in batches of 5000
    let totalCreated = 0;
    let totalExisting = 0;
    for (let i = 0; i < ops.length; i += 5000) {
      const batch = ops.slice(i, i + 5000);
      const result = await CollegeCourseMapping.bulkWrite(batch, { ordered: false });
      totalCreated += result.upsertedCount || 0;
      console.log(`  Batch ${Math.floor(i/5000)+1}: ${result.upsertedCount || 0} created, ${result.modifiedCount || 0} modified`);
    }

    console.log(`\n=== RESULTS ===`);
    console.log(`Mappings created: ${totalCreated}`);
    console.log(`Already existed: ${ops.length - totalCreated}`);
    console.log(`Total Engineering mappings: ${await CollegeCourseMapping.countDocuments({ stream: 'Engineering' })}`);

    // Verify specific courses
    const targetCourses = [
      'Computer Science and Engineering',
      'Information Technology',
      'Mechanical Engineering',
      'Civil Engineering',
      'Electronics and Communication Engineering',
      'Electrical and Electronics Engineering',
      'Artificial Intelligence and Data Science',
      'Artificial Intelligence and Machine Learning',
    ];

    console.log('\n=== VERIFICATION ===');
    for (const name of targetCourses) {
      const course = await Course.findOne({ courseName: name, category: 'Engineering' }).lean();
      if (!course) { console.log(`  ❌ ${name}: course not found`); continue; }
      const count = await CollegeCourseMapping.countDocuments({ courseId: course._id, isActive: true, isVerified: true });
      console.log(`  ✅ ${name}: ${count} colleges mapped`);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
})();
