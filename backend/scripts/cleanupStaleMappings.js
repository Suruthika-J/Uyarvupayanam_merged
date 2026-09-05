const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('../models/College');
require('../models/Course');

const CollegeCourseMapping = require('../models/CollegeCourseMapping');

async function cleanup() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // 1. Delete orphan mappings (no collegeId or courseId)
  const r1 = await CollegeCourseMapping.deleteMany({
    $or: [{ collegeId: null }, { courseId: null }]
  });
  console.log('Deleted orphan mappings:', r1.deletedCount);

  // 2. Deactivate all mappings without a stream field
  const r2 = await CollegeCourseMapping.updateMany(
    { stream: { $exists: false }, isActive: true },
    { $set: { isActive: false } }
  );
  console.log('Deactivated streamless mappings:', r2.modifiedCount);

  // 3. Deactivate ALL non-Law, non-Agriculture, non-Diploma, non-Engineering stale mappings
  const r3 = await CollegeCourseMapping.updateMany(
    { stream: { $exists: true, $nin: ['Law', 'Agriculture', 'Polytechnic', 'Engineering', 'Medical'] }, isActive: true },
    { $set: { isActive: false } }
  );
  console.log('Deactivated stale other-stream mappings:', r3.modifiedCount);

  // Count remaining active mappings
  const active = await CollegeCourseMapping.find({ isActive: true });
  const byStream = {};
  active.forEach(m => {
    const s = m.stream || 'unknown';
    byStream[s] = (byStream[s] || 0) + 1;
  });
  console.log('\nActive mappings by stream:', byStream);
  console.log('Total active mappings:', active.length);

  process.exit(0);
}

cleanup().catch(e => { console.error(e); process.exit(1); });
