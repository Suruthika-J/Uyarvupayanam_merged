require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const College = require('../models/College');
const CollegeCourseMapping = require('../models/CollegeCourseMapping');

const normalizeCourseName = (name) => {
  if (!name) return '';
  return name.toString().toLowerCase()
    .replace(/^(part-time\s+)?diploma\s+in\s+/i, '')
    .replace(/\s*\(polytechnic\)/i, '')
    .replace(/\s*\(diploma\)/i, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  // 1. Load all Polytechnic courses
  const courses = await Course.find({ category: 'Polytechnic' }).lean();
  console.log(`Total Polytechnic courses: ${courses.length}`);

  // 2. Group by normalized name
  const groups = {};
  for (const c of courses) {
    const key = normalizeCourseName(c.courseName);
    if (!key) continue;
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  }

  // 3. Load all Polytechnic mappings
  const mappings = await CollegeCourseMapping.find({ stream: 'Polytechnic' }).lean();
  console.log(`Total Polytechnic mappings: ${mappings.length}`);

  // Build mapping count per courseId
  const mappingCountPerCourse = {};
  for (const m of mappings) {
    const cid = m.courseId.toString();
    mappingCountPerCourse[cid] = (mappingCountPerCourse[cid] || 0) + 1;
  }

  // 4. For each group, pick canonical and identify duplicates
  const canonicalMap = {}; // courseId -> canonicalCourseId
  const coursesToDelete = [];
  const coursesToKeep = [];

  for (const [normName, group] of Object.entries(groups)) {
    if (group.length === 1) {
      // No duplicates
      coursesToKeep.push(group[0]);
      continue;
    }

    // Sort: prefer course with most mappings, then oldest
    group.sort((a, b) => {
      const aCount = mappingCountPerCourse[a._id.toString()] || 0;
      const bCount = mappingCountPerCourse[b._id.toString()] || 0;
      if (bCount !== aCount) return bCount - aCount;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    const canonical = group[0];
    coursesToKeep.push(canonical);

    for (let i = 1; i < group.length; i++) {
      canonicalMap[group[i]._id.toString()] = canonical._id;
      coursesToDelete.push(group[i]._id);
    }
  }

  console.log(`\nUnique course names: ${Object.keys(groups).length}`);
  console.log(`Courses to KEEP (canonical): ${coursesToKeep.length}`);
  console.log(`Courses to DELETE (duplicates): ${coursesToDelete.length}`);

  // 5. Remap all CollegeCourseMapping entries
  let remappedCount = 0;
  let alreadyExistsCount = 0;
  let duplicateMappingDeletes = [];

  // First pass: find all mappings that reference duplicate courses
  const mappingsToRemap = mappings.filter(m => canonicalMap[m.courseId.toString()]);
  console.log(`\nMappings to remap: ${mappingsToRemap.length}`);

  // Check for conflicts (mapping to canonical already exists)
  const existingMappingKeys = new Set();
  for (const m of mappings) {
    existingMappingKeys.add(m.collegeId.toString() + '_' + m.courseId.toString());
  }

  const bulkRemapOps = [];
  const bulkDeleteIds = [];

  for (const m of mappingsToRemap) {
    const oldCourseId = m.courseId.toString();
    const newCourseId = canonicalMap[oldCourseId];
    const newKey = m.collegeId.toString() + '_' + newCourseId.toString();

    if (existingMappingKeys.has(newKey)) {
      // Canonical mapping already exists, just delete the duplicate
      bulkDeleteIds.push(m._id);
      alreadyExistsCount++;
    } else {
      // Remap to canonical
      bulkRemapOps.push({
        updateOne: {
          filter: { _id: m._id },
          update: {
            $set: {
              courseId: newCourseId,
              courseName: coursesToKeep.find(c => c._id.toString() === newCourseId.toString())?.courseName || m.courseName
            }
          }
        }
      });
      existingMappingKeys.add(newKey);
      remappedCount++;
    }
  }

  // Also find orphan mappings (pointing to courses being deleted that weren't remapped)
  const allCourseIds = new Set(courses.map(c => c._id.toString()));
  const orphans = mappings.filter(m => {
    const cid = m.courseId.toString();
    return !allCourseIds.has(cid);
  });
  console.log(`Orphan mappings (course no longer exists): ${orphans.length}`);
  for (const o of orphans) {
    bulkDeleteIds.push(o._id);
  }

  console.log(`\nMapping operations:`);
  console.log(`  Remap to canonical: ${remappedCount}`);
  console.log(`  Delete (canonical already exists): ${alreadyExistsCount}`);
  console.log(`  Delete (orphan): ${orphans.length}`);

  // 6. Execute mapping operations
  if (bulkRemapOps.length > 0) {
    await CollegeCourseMapping.bulkWrite(bulkRemapOps);
    console.log(`\nRemapped ${bulkRemapOps.length} mappings.`);
  }

  if (bulkDeleteIds.length > 0) {
    await CollegeCourseMapping.deleteMany({ _id: { $in: bulkDeleteIds } });
    console.log(`Deleted ${bulkDeleteIds.length} duplicate/orphan mappings.`);
  }

  // 7. Update College.coursesOffered - replace duplicate course IDs with canonical
  const colleges = await College.find({ stream: 'Polytechnic' }).lean();
  console.log(`\nUpdating College.coursesOffered for ${colleges.length} colleges...`);

  const collegeUpdateOps = [];
  let collegesUpdated = 0;

  for (const college of colleges) {
    if (!college.coursesOffered || college.coursesOffered.length === 0) continue;

    let changed = false;
    const newOffered = college.coursesOffered.map(cid => {
      const cidStr = cid.toString();
      if (canonicalMap[cidStr]) {
        changed = true;
        return canonicalMap[cidStr];
      }
      return cid;
    });

    // Deduplicate
    const unique = [...new Set(newOffered.map(id => id.toString()))];
    const uniqueObjIds = unique.map(id => new mongoose.Types.ObjectId(id));

    if (changed || unique.length !== college.coursesOffered.length) {
      collegeUpdateOps.push({
        updateOne: {
          filter: { _id: college._id },
          update: { $set: { coursesOffered: uniqueObjIds } }
        }
      });
      collegesUpdated++;
    }
  }

  if (collegeUpdateOps.length > 0) {
    await College.bulkWrite(collegeUpdateOps);
    console.log(`Updated ${collegesUpdated} colleges' coursesOffered.`);
  }

  // 8. Delete duplicate course records
  if (coursesToDelete.length > 0) {
    const deleteResult = await Course.deleteMany({ _id: { $in: coursesToDelete } });
    console.log(`\nDeleted ${deleteResult.deletedCount} duplicate course records.`);
  }

  // 9. Final verification
  const finalCourses = await Course.find({ category: 'Polytechnic' }).lean();
  const finalMappings = await CollegeCourseMapping.find({ stream: 'Polytechnic' }).lean();
  const finalColleges = await College.find({ stream: 'Polytechnic' }).lean();

  // Check for any remaining duplicates
  const finalCourseNames = {};
  for (const c of finalCourses) {
    const key = normalizeCourseName(c.courseName);
    finalCourseNames[key] = (finalCourseNames[key] || 0) + 1;
  }
  const remainingDups = Object.entries(finalCourseNames).filter(([, v]) => v > 1);

  // Check for orphan mappings
  const finalCourseIds = new Set(finalCourses.map(c => c._id.toString()));
  const remainingOrphans = finalMappings.filter(m => !finalCourseIds.has(m.courseId.toString()));

  // Check for colleges with 0 courses
  const collegesWithNoCourses = finalColleges.filter(c => !c.coursesOffered || c.coursesOffered.length === 0);

  console.log('\n=== FINAL VERIFICATION ===');
  console.log(`Polytechnic courses: ${finalCourses.length}`);
  console.log(`Unique course names: ${Object.keys(finalCourseNames).length}`);
  console.log(`Remaining duplicate course names: ${remainingDups.length}`);
  for (const [name, count] of remainingDups) {
    console.log(`  "${name}" x${count}`);
  }
  console.log(`Polytechnic mappings: ${finalMappings.length}`);
  console.log(`Remaining orphan mappings: ${remainingOrphans.length}`);
  console.log(`Polytechnic colleges: ${finalColleges.length}`);
  console.log(`Colleges with 0 courses: ${collegesWithNoCourses.length}`);

  // List all final unique courses
  console.log('\n=== ALL UNIQUE POLYTECHNIC COURSES ===');
  const sortedCourses = finalCourses.sort((a, b) => a.courseName.localeCompare(b.courseName));
  for (const c of sortedCourses) {
    const mapCount = finalMappings.filter(m => m.courseId.toString() === c._id.toString()).length;
    console.log(`  "${c.courseName}" (${mapCount} colleges)`);
  }

  await mongoose.disconnect();
  console.log('\nDone.');
})();
