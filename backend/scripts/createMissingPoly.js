const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const College = require('../models/College');
const Course = require('../models/Course');
const Mapping = require('../models/CollegeCourseMapping');

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

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const raw = fs.readFileSync(path.resolve(__dirname, '../uploads/college.csv'), 'utf8');
  const csvRows = parseCSV(raw);

  const csvByCollege = new Map();
  csvRows.forEach(r => csvByCollege.set(r.name, r));
  const uniqueCsv = [...csvByCollege.values()];

  const allColleges = await College.find({});
  const collegeByNorm = new Map();
  allColleges.forEach(c => { const n = norm(c.collegeName); if (n) collegeByNorm.set(n, c); });

  const activeMappings = await Mapping.find({ stream: 'Polytechnic', isActive: true });
  const matchedNames = new Set();
  activeMappings.forEach(m => matchedNames.add(norm(m.collegeName)));

  const unmatched = uniqueCsv.filter(r => !matchedNames.has(norm(r.name)));
  console.log('Unmatched colleges to create:', unmatched.length);

  const allCourses = await Course.find({});
  const courseByNorm = new Map();
  allCourses.forEach(c => { const n = norm(c.courseName); if (n) courseByNorm.set(n, c); });

  const batchId = `POLY-FIX-${Date.now()}`;
  let created = 0;
  let mapped = 0;

  for (const row of unmatched) {
    const college = new College({
      collegeName: row.name, stream: 'Polytechnic', streamsOffered: ['Polytechnic'],
      district: row.district, state: 'Tamil Nadu', category: row.category,
      type: row.category, collegeType: row.category, coursesOffered: []
    });
    await college.save();
    created++;

    const courseIds = [];
    for (const csvCourseName of row.courses) {
      const displayName = COURSE_MAP[csvCourseName] || csvCourseName;
      const n = norm(displayName);
      let dbCourse = courseByNorm.get(n);
      if (!dbCourse) {
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
        courseByNorm.set(norm(displayName), dbCourse);
      }
      courseIds.push(dbCourse._id);
      await Mapping.create({
        collegeId: college._id, courseId: dbCourse._id,
        source: 'CSV Import', sourceFileName: 'college.csv', importBatchId: batchId,
        isVerified: true, isActive: true,
        collegeName: college.collegeName, courseName: dbCourse.courseName,
        stream: 'Polytechnic'
      });
      mapped++;
    }

    college.coursesOffered = courseIds;
    await college.save();
  }

  console.log(`Created ${created} colleges, ${mapped} mappings`);

  const finalActive = await Mapping.find({ stream: 'Polytechnic', isActive: true });
  const finalColleges = await College.find({ stream: 'Polytechnic', coursesOffered: { $exists: true, $ne: [] } });
  console.log(`\nFinal: ${finalActive.length} active Polytechnic mappings, ${finalColleges.length} colleges with courses`);

  const byCourse = {};
  finalActive.forEach(m => { byCourse[m.courseName] = (byCourse[m.courseName] || 0) + 1; });
  console.log('\nMappings by course:');
  Object.entries(byCourse).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => console.log(`  ${n}x ${c}`));

  process.exit(0);
})();
