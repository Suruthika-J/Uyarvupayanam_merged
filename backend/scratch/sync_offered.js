require('dotenv').config();
const mongoose = require('mongoose');
const College = require('../models/College');
const CollegeCourseMapping = require('../models/CollegeCourseMapping');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const mappings = await CollegeCourseMapping.find({ stream: 'Polytechnic' }).lean();
  const colleges = await College.find({ stream: 'Polytechnic' }).lean();

  const ops = [];
  let count = 0;

  for (const college of colleges) {
    const collegeMappings = mappings.filter(m => m.collegeId.toString() === college._id.toString());
    const mappedIds = [...new Set(collegeMappings.map(m => m.courseId.toString()))];
    const currentIds = (college.coursesOffered || []).map(id => id.toString());
    const mappedSorted = mappedIds.sort();
    const currentSorted = currentIds.sort();

    if (JSON.stringify(mappedSorted) !== JSON.stringify(currentSorted)) {
      ops.push({
        updateOne: {
          filter: { _id: college._id },
          update: { $set: { coursesOffered: mappedIds.map(id => new mongoose.Types.ObjectId(id)) } }
        }
      });
      count++;
    }
  }

  if (ops.length > 0) {
    await College.bulkWrite(ops);
  }
  console.log(`Synced ${count} colleges`);

  // Verify
  const verifyMappings = await CollegeCourseMapping.find({ stream: 'Polytechnic' }).lean();
  const verifyColleges = await College.find({ stream: 'Polytechnic' }).lean();
  let mismatch = 0;
  for (const college of verifyColleges) {
    if (!college.coursesOffered) continue;
    const cm = verifyMappings.filter(m => m.collegeId.toString() === college._id.toString());
    const mapped = new Set(cm.map(m => m.courseId.toString()));
    const offered = new Set(college.coursesOffered.map(id => id.toString()));
    for (const cid of mapped) {
      if (!offered.has(cid)) { mismatch++; break; }
    }
  }
  console.log(`Remaining mismatches: ${mismatch}`);

  await mongoose.disconnect();
})();
