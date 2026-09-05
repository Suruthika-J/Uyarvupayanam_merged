const path = require('path');
const moduleAlias = require('module');
// Add backend node_modules to search path
module.paths.push(path.join(__dirname, '..', 'backend', 'node_modules'));

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

const College = require('../backend/models/College');
const Course = require('../backend/models/Course');

const normalizeCourseName = (name) => {
  if (!name) return "";
  let n = name.toLowerCase().replace(/\s+/g, " ").replace(/[.,]/g, "").trim();
  n = n.replace(/ engg$/g, " engineering");
  n = n.replace(/ engg /g, " engineering ");
  return n;
};

const runCleanup = async () => {
  try {
    console.log("🚀 Starting Global Course Offering Deduplication...");
    await mongoose.connect(process.env.MONGO_URI);
    
    const [colleges, allCourses] = await Promise.all([
      College.find({}),
      Course.find({})
    ]);

    // Map normalized names to proper ObjectIds
    const courseLookup = {};
    allCourses.forEach(c => {
      const norm = normalizeCourseName(c.courseName);
      if (!courseLookup[norm]) courseLookup[norm] = c._id;
    });

    let totalFixed = 0;

    for (const college of colleges) {
      if (!college.coursesOffered || college.coursesOffered.length === 0) continue;

      const currentIds = college.coursesOffered.map(id => id.toString());
      const cleanedSet = new Set();
      let changed = false;

      // Map each existing ObjectId back to its normalized "best" ObjectId
      for (const id of currentIds) {
        const courseObj = allCourses.find(c => c._id.toString() === id);
        if (!courseObj) continue;

        const bestId = courseLookup[normalizeCourseName(courseObj.courseName)];
        if (bestId) {
          cleanedSet.add(bestId.toString());
          if (bestId.toString() !== id) changed = true;
        }
      }

      // Check for size change (removes duplicates)
      if (cleanedSet.size !== currentIds.length) changed = true;

      if (changed) {
        college.coursesOffered = Array.from(cleanedSet);
        await college.save();
        totalFixed++;
        console.log(`✅ Fixed: ${college.collegeName} (${currentIds.length} -> ${cleanedSet.size} courses)`);
      }
    }

    console.log(`\n✨ DONE! deduplicated ${totalFixed} colleges.`);
    process.exit(0);
  } catch (err) {
    console.error("Cleanup failed:", err);
    process.exit(1);
  }
};

runCleanup();
