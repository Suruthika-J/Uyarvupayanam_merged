const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const College = require('../models/College');
const Course = require('../models/Course');
const Mapping = require('../models/CollegeCourseMapping');

const csvPath = path.resolve(__dirname, '../uploads/college.csv');

function parseCSV(raw) {
  raw = raw.replace(/\\,/g, '|||COMMA|||');
  const lines = raw.split('\n').filter(l => l.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = [];
    let current = '';
    let inQuote = false;
    for (let j = 0; j < line.length; j++) {
      if (line[j] === '"') { inQuote = !inQuote; continue; }
      if (line[j] === ',' && !inQuote) { parts.push(current.trim()); current = ''; continue; }
      current += line[j];
    }
    parts.push(current.trim());
    const name = (parts[2] || '').replace(/\|\|\|COMMA\|\|\|/g, ',').trim().replace(/\\+$/, '').trim();
    let category = (parts[3] || '').replace(/\|\|\|COMMA\|\|\|/g, ',').trim();
    const district = (parts[4] || '').replace(/\|\|\|COMMA\|\|\|/g, ',').trim();
    const coursesStr = (parts[5] || '').replace(/\|\|\|COMMA\|\|\|/g, ',').trim();
    if (!name || !coursesStr || !coursesStr.match(/Diploma/i)) continue;
    if (!category.match(/GOVERNMENT|SELF|AUTONOMOUS|AFFILIATED/i)) category = 'SELF FINANCING';
    if (category === 'GOVERNMENT AIDED POLYTECHNIC COLLEGES') category = 'GOVERNMENT AIDED';
    const courses = coursesStr.split(',').map(c => c.trim()).filter(c => c.match(/Diploma/i));
    if (courses.length === 0) continue;
    rows.push({ name, category, district, courses });
  }
  return rows;
}

function norm(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

const COURSE_MAP = {
  'Diploma in Civil Engineering': 'Civil Engineering (Polytechnic)',
  'Diploma in Mechanical Engineering': 'Mechanical Engineering (Polytechnic)',
  'Diploma in Electrical and Electronics Engineering': 'Electrical and Electronics Engineering (Polytechnic)',
  'Diploma in Electronics and Communication Engineering': 'Electronics and Communication Engineering (Polytechnic)',
  'Diploma in Computer Engineering': 'Computer Engineering (Polytechnic)',
  'Diploma in Information Technology': 'Information Technology (Polytechnic)',
  'Diploma in Automobile Engineering': 'Automobile Engineering (Polytechnic)',
  'Diploma in Textile Technology': 'Textile Technology (Polytechnic)',
  'Diploma in Chemical Engineering': 'Chemical Engineering (Polytechnic)',
  'Diploma in Instrumentation and Control Engineering': 'Instrumentation and Control Engineering (Polytechnic)',
  'Diploma in Mechatronics Engineering': 'Mechatronics Engineering (Polytechnic)',
  'Diploma in Printing Technology': 'Printing Technology (Polytechnic)',
  'Diploma in Leather Technology': 'Leather Technology (Polytechnic)',
  'Diploma in Ceramic Technology': 'Ceramic Technology (Polytechnic)',
  'Diploma in Petrochemical Technology': 'Petrochemical Technology (Polytechnic)',
  'Diploma in Textile Processing': 'Textile Processing (Polytechnic)',
  'Diploma in Fashion Technology': 'Fashion Technology (Polytechnic)',
  'Diploma in Apparel Technology': 'Apparel Technology (Polytechnic)',
  'Diploma in Leather Goods Technology': 'Leather Goods Technology (Polytechnic)',
  'Diploma in Biomedical Electronics': 'Biomedical Electronics (Polytechnic)',
  'Diploma in Commercial Practice': 'Commercial Practice (Polytechnic)',
  'Diploma in Modern Office Practice': 'Modern Office Practice (Polytechnic)',
  'Diploma in Tool Engineering': 'Tool Engineering (Polytechnic)',
  'Diploma in Tool and Die Engineering': 'Tool and Die Engineering (Polytechnic)',
  'Diploma in Mechanical Engineering (Tool & Die)': 'Mechanical Engineering Tool and Die (Polytechnic)',
  'Diploma in Industrial Safety / Labour Welfare and Safety Engineering': 'Industrial Safety Engineering (Polytechnic)',
  'Diploma in Automation and Robotics': 'Automation and Robotics (Polytechnic)',
  'Diploma in Digital Manufacturing': 'Digital Manufacturing (Polytechnic)',
  'Diploma in Internet of Things (IoT)': 'Internet of Things IoT (Polytechnic)',
  'Diploma in Renewable Energy Engineering': 'Renewable Energy Engineering (Polytechnic)',
  'Diploma in Electronics (Robotics)': 'Electronics Robotics (Polytechnic)',
  'Diploma in Technical Teacher Training / Engineering Instructor Training Programmes': 'Technical Teacher Training (Polytechnic)',
  'Part-Time Diploma in Civil Engineering': 'Part-Time Civil Engineering (Polytechnic)',
  'Part-Time Diploma in Mechanical Engineering': 'Part-Time Mechanical Engineering (Polytechnic)',
  'Part-Time Diploma in Electrical and Electronics Engineering': 'Part-Time Electrical and Electronics Engineering (Polytechnic)',
};

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  const raw = fs.readFileSync(csvPath, 'utf8');
  const csvRows = parseCSV(raw);
  console.log(`Loaded ${csvRows.length} valid rows from CSV`);

  // Deduplicate by college name (keep last occurrence)
  const csvByCollege = new Map();
  csvRows.forEach(r => {
    csvByCollege.set(r.name, r);
  });
  const uniqueCsv = [...csvByCollege.values()];
  console.log(`Unique colleges in CSV: ${uniqueCsv.length}\n`);

  // Step 0: Deactivate ALL Polytechnic mappings
  console.log('Step 1: Deactivating ALL Polytechnic mappings...');
  await Mapping.updateMany({ stream: 'Polytechnic' }, { $set: { isActive: false } });
  console.log('  Done\n');

  // Step 1: Bulk load all DB data
  console.log('Step 2: Loading DB data...');
  const allColleges = await College.find({});
  const allCourses = await Course.find({});
  console.log(`  ${allColleges.length} colleges, ${allCourses.length} courses in DB`);

  // Build lookup maps
  const collegeByNorm = new Map();
  allColleges.forEach(c => { const n = norm(c.collegeName); if (n) collegeByNorm.set(n, c); });

  const courseByNorm = new Map();
  allCourses.forEach(c => { const n = norm(c.courseName); if (n) courseByNorm.set(n, c); });

  // Step 2: Create all needed courses upfront (bulk)
  console.log('\nStep 3: Creating/updating courses...');
  const allCsvCourseNames = new Set();
  uniqueCsv.forEach(r => r.courses.forEach(c => allCsvCourseNames.add(c)));

  const courseNameToDbCourse = new Map();
  let coursesCreated = 0;
  let coursesReused = 0;

  for (const csvCourseName of allCsvCourseNames) {
    const displayName = COURSE_MAP[csvCourseName] || csvCourseName;
    const n = norm(displayName);
    let dbCourse = courseByNorm.get(n);
    if (!dbCourse) {
      // Try loose match
      for (const [key, c] of courseByNorm) {
        if (key.includes(n) || n.includes(key)) {
          if (Math.abs(key.length - n.length) < 10) { dbCourse = c; break; }
        }
      }
    }
    if (!dbCourse) {
      const slug = displayName.toLowerCase().split(' ').join('-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substr(2, 5);
      dbCourse = new Course({
        courseName: displayName, slug, level: 'after10th', category: 'Polytechnic',
        duration: '3 Years', eligibility: '10th Pass',
        shortDescription: `${displayName} - Polytechnic diploma program`,
        status: 'active', isPublished: true, isImported: true, sourceName: 'Polytechnic CSV Import'
      });
      await dbCourse.save();
      allCourses.push(dbCourse);
      courseByNorm.set(norm(displayName), dbCourse);
      coursesCreated++;
    } else {
      coursesReused++;
    }
    courseNameToDbCourse.set(csvCourseName, dbCourse);
  }
  console.log(`  Courses reused: ${coursesReused}, created: ${coursesCreated}`);

  // Step 3: Match and create/update colleges (bulk)
  console.log('\nStep 4: Processing colleges...');
  const batchId = `POLY-${Date.now()}`;
  const mappingsToCreate = [];
  const collegesToUpdate = [];
  const collegesToCreate = [];
  let collegesMatched = 0;
  let collegesCreated = 0;

  for (const row of uniqueCsv) {
    let college = collegeByNorm.get(norm(row.name));
    if (!college) {
      // Loose match
      const rowWords = norm(row.name).split(/\s+/).filter(w => w.length > 4);
      for (const [key, c] of collegeByNorm) {
        const dbWords = key.split(/\s+/).filter(w => w.length > 4);
        const overlap = rowWords.filter(w => dbWords.some(dw => dw.includes(w) || w.includes(dw)));
        if (overlap.length >= 2 && overlap.length >= rowWords.length * 0.6) { college = c; break; }
      }
    }

    if (!college) {
      college = new College({
        collegeName: row.name, stream: 'Polytechnic', streamsOffered: ['Polytechnic'],
        district: row.district, state: 'Tamil Nadu', category: row.category,
        type: row.category, collegeType: row.category, coursesOffered: []
      });
      await college.save();
      collegeByNorm.set(norm(row.name), college);
      collegesCreated++;
    } else {
      collegesMatched++;
      college.district = row.district || college.district;
      college.collegeType = row.category;
      college.type = row.category;
      college.category = row.category;
      college.stream = 'Polytechnic';
      if (!college.streamsOffered) college.streamsOffered = [];
      if (!college.streamsOffered.includes('Polytechnic')) college.streamsOffered.push('Polytechnic');
      collegesToUpdate.push(college);
    }

    const courseIds = [];
    for (const csvCourseName of row.courses) {
      const dbCourse = courseNameToDbCourse.get(csvCourseName);
      if (!dbCourse) continue;
      courseIds.push(dbCourse._id);
      mappingsToCreate.push({
        collegeId: college._id,
        courseId: dbCourse._id,
        source: 'CSV Import', sourceFileName: 'college.csv', importBatchId: batchId,
        isVerified: true, isActive: true,
        collegeName: college.collegeName, courseName: dbCourse.courseName,
        stream: 'Polytechnic'
      });
    }
    college.coursesOffered = courseIds;
    collegesToUpdate.push(college);
  }

  // Deduplicate collegesToUpdate
  const uniqueCollegesToUpdate = [...new Map(collegesToUpdate.map(c => [c._id.toString(), c])).values()];
  console.log(`  Colleges matched: ${collegesMatched}, created: ${collegesCreated}`);
  console.log(`  Mappings to create: ${mappingsToCreate.length}`);

  // Bulk save colleges
  console.log('\nStep 5: Saving colleges...');
  const collegeOps = uniqueCollegesToUpdate.map(c => ({
    updateOne: { filter: { _id: c._id }, update: { $set: {
      district: c.district, collegeType: c.collegeType, type: c.type,
      category: c.category, stream: c.stream, streamsOffered: c.streamsOffered,
      coursesOffered: c.coursesOffered
    }}}
  }));
  if (collegeOps.length > 0) {
    await College.bulkWrite(collegeOps);
  }
  console.log(`  Updated ${uniqueCollegesToUpdate.length} colleges`);

  // Bulk upsert mappings (in batches of 500)
  console.log('\nStep 6: Creating mappings...');
  const BATCH = 500;
  let mappingsCreated = 0;
  for (let i = 0; i < mappingsToCreate.length; i += BATCH) {
    const batch = mappingsToCreate.slice(i, i + BATCH);
    const ops = batch.map(m => ({
      updateOne: {
        filter: { collegeId: m.collegeId, courseId: m.courseId },
        update: { $set: m },
        upsert: true
      }
    }));
    const result = await Mapping.bulkWrite(ops);
    mappingsCreated += result.upsertedCount + result.modifiedCount;
    console.log(`  Batch ${Math.floor(i / BATCH) + 1}: ${batch.length} mappings`);
  }
  console.log(`  Total mappings upserted/updated: ${mappingsCreated}`);

  // Reactivate all Polytechnic mappings that we just created
  await Mapping.updateMany({ stream: 'Polytechnic', importBatchId: batchId }, { $set: { isActive: true } });

  console.log('\n==============================================');
  console.log('    POLYTECHNIC CSV IMPORT SUMMARY             ');
  console.log('==============================================');
  console.log(`Total CSV colleges:             ${uniqueCsv.length}`);
  console.log(`Colleges Matched:               ${collegesMatched}`);
  console.log(`New Colleges Created:           ${collegesCreated}`);
  console.log(`Courses Reused:                 ${coursesReused}`);
  console.log(`New Courses Created:            ${coursesCreated}`);
  console.log(`Mappings Created/Upserted:      ${mappingsCreated}`);
  console.log('==============================================\n');

  const finalActive = await Mapping.find({ stream: 'Polytechnic', isActive: true });
  const collegesWithMappings = await College.find({ stream: 'Polytechnic', coursesOffered: { $exists: true, $ne: [] } });
  console.log(`Final active Polytechnic mappings: ${finalActive.length}`);
  console.log(`Colleges with Polytechnic courses: ${collegesWithMappings.length}`);

  const byCourse = {};
  finalActive.forEach(m => { byCourse[m.courseName] = (byCourse[m.courseName] || 0) + 1; });
  console.log('\nMappings by course:');
  Object.entries(byCourse).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => console.log(`  ${n}x ${c}`));

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
