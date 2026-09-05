const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const College = require('../models/College');
const Course = require('../models/Course');
const Cutoff = require('../models/Cutoff');
const CollegeCourseMapping = require('../models/CollegeCourseMapping');

const CATEGORY_TO_STREAM = {
  Engineering: 'Engineering',
  Architecture: 'Engineering',
  Design: 'Engineering',
  Medical: 'Medical',
  Nursing: 'Medical',
  Pharmacy: 'Medical',
  Law: 'Law',
  Agriculture: 'Agriculture',
  Polytechnic: 'Polytechnic',
  ITI: 'Diploma',
  Arts: 'Arts & Science',
  Science: 'Arts & Science',
  Commerce: 'Arts & Science',
  Management: 'Arts & Science',
  'IT & Computer': 'Arts & Science',
  'Media & Journalism': 'Media & Journalism',
  'Hotel Management': 'Arts & Science',
};

function deriveStreamFromCategories(categoryCounts) {
  let bestStream = null;
  let bestCount = 0;

  for (const [category, count] of Object.entries(categoryCounts)) {
    const stream = CATEGORY_TO_STREAM[category];
    if (stream && stream !== 'Agriculture' && count > bestCount) {
      bestStream = stream;
      bestCount = count;
    }
  }

  return bestStream;
}

async function analyzeCollege(college, mappings, cutoffs, courseMap) {
  const hasCutoffs = cutoffs.length > 0;
  const hasNonExcelMapping = mappings.some(
    (m) => m.source && m.source !== 'Excel Import'
  );

  const categoryCounts = {};
  const courseIds = new Set();

  for (const m of mappings) {
    courseIds.add(m.courseId.toString());
  }
  for (const id of college.coursesOffered || []) {
    courseIds.add(id.toString());
  }

  for (const courseId of courseIds) {
    const course = courseMap[courseId];
    if (course?.category) {
      categoryCounts[course.category] = (categoryCounts[course.category] || 0) + 1;
    }
  }

  const hasAgricultureMappings = mappings.some((m) => {
    const course = courseMap[m.courseId.toString()];
    return (
      m.source === 'Excel Import' ||
      course?.category === 'Agriculture' ||
      (m.stream && m.stream.toLowerCase().includes('agriculture'))
    );
  });

  let derivedStream = null;

  if (hasCutoffs) {
    derivedStream = 'Engineering';
  } else if (hasNonExcelMapping) {
    derivedStream = deriveStreamFromCategories(categoryCounts);
  } else {
    derivedStream = deriveStreamFromCategories(categoryCounts);
  }

  const agricultureOnly =
    !hasCutoffs &&
    !hasNonExcelMapping &&
    Object.keys(categoryCounts).every((c) => c === 'Agriculture' || !CATEGORY_TO_STREAM[c]);

  const isAgricultureInstitution =
    /agricultural|agriculture|horticultural|community science|forest college/i.test(
      college.collegeName
    );

  const needsRepair =
    college.stream === 'Agriculture' &&
    !agricultureOnly &&
    (hasCutoffs ||
      hasNonExcelMapping ||
      (derivedStream &&
        derivedStream !== 'Agriculture' &&
        !(isAgricultureInstitution && !hasCutoffs && !hasNonExcelMapping)));

  return {
    needsRepair,
    derivedStream: derivedStream || college.stream,
    hasAgricultureMappings,
    hasCutoffs,
    hasNonExcelMapping,
    categoryCounts,
  };
}

async function runRepair(dryRun = false) {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI not found in environment variables.');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log(dryRun ? 'DRY RUN — no writes' : 'LIVE RUN — applying repairs');
  console.log('Connected to MongoDB\n');

  const [colleges, allCourses, allMappings, allCutoffs] = await Promise.all([
    College.find({ stream: 'Agriculture' }).lean(),
    Course.find({}).lean(),
    CollegeCourseMapping.find({}).lean(),
    Cutoff.find({}).lean(),
  ]);

  const courseMap = {};
  allCourses.forEach((c) => {
    courseMap[c._id.toString()] = c;
  });

  const mappingsByCollege = {};
  allMappings.forEach((m) => {
    if (!m.collegeId) return;
    const id = m.collegeId.toString();
    if (!mappingsByCollege[id]) mappingsByCollege[id] = [];
    mappingsByCollege[id].push(m);
  });

  const cutoffsByCollege = {};
  allCutoffs.forEach((c) => {
    if (!c.collegeId) return;
    const id = c.collegeId.toString();
    if (!cutoffsByCollege[id]) cutoffsByCollege[id] = [];
    cutoffsByCollege[id].push(c);
  });

  const repairs = [];

  for (const college of colleges) {
    const collegeId = college._id.toString();
    const mappings = mappingsByCollege[collegeId] || [];
    const cutoffs = cutoffsByCollege[collegeId] || [];

    const analysis = await analyzeCollege(college, mappings, cutoffs, courseMap);

    if (!analysis.needsRepair) continue;

    const newStream = analysis.derivedStream;
    const streamsOffered = [...(college.streamsOffered || [])];

    if (analysis.hasAgricultureMappings) {
      if (!streamsOffered.includes('Agriculture')) {
        streamsOffered.push('Agriculture');
      }
    } else {
      const agIdx = streamsOffered.indexOf('Agriculture');
      if (agIdx !== -1) streamsOffered.splice(agIdx, 1);
    }

    if (!streamsOffered.includes(newStream)) {
      streamsOffered.unshift(newStream);
    }

    repairs.push({
      collegeId,
      collegeName: college.collegeName,
      oldStream: college.stream,
      newStream,
      streamsOffered,
      ...analysis,
    });
  }

  console.log(`Found ${repairs.length} colleges to repair:\n`);

  for (const r of repairs) {
    console.log(`  ${r.collegeName}`);
    console.log(`    stream: "${r.oldStream}" -> "${r.newStream}"`);
    console.log(`    streamsOffered: [${r.streamsOffered.join(', ')}]`);
    console.log(`    signals: cutoffs=${r.hasCutoffs}, nonExcelMapping=${r.hasNonExcelMapping}`);
    console.log('');
  }

  if (dryRun || repairs.length === 0) {
    await mongoose.disconnect();
    console.log(dryRun ? 'Dry run complete. Re-run without --dry-run to apply.' : 'Nothing to repair.');
    process.exit(0);
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      for (const r of repairs) {
        await College.updateOne(
          { _id: r.collegeId },
          { $set: { stream: r.newStream, streamsOffered: r.streamsOffered } },
          { session }
        );
      }
    });

    console.log(`Successfully repaired ${repairs.length} colleges.`);
  } catch (error) {
    console.error('Repair failed — transaction rolled back:', error);
    process.exit(1);
  } finally {
    await session.endSession();
    await mongoose.disconnect();
  }
}

const dryRun = process.argv.includes('--dry-run');
runRepair(dryRun);
