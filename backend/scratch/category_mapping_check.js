require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const CollegeCourseMapping = require('../models/CollegeCourseMapping');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const courses = await Course.find({ status: 'active' }).lean();
  const mappings = await CollegeCourseMapping.find({ isActive: true }).select('courseId collegeId isVerified').lean();

  const courseIdStr = new Set(courses.map(c => c._id.toString()));
  const byCourse = {};
  const byCourseVerified = {};
  mappings.forEach(m => {
    const id = String(m.courseId);
    if (!courseIdStr.has(id)) return;
    if (!byCourse[id]) byCourse[id] = new Set();
    byCourse[id].add(String(m.collegeId));
    if (m.isVerified) {
      if (!byCourseVerified[id]) byCourseVerified[id] = new Set();
      byCourseVerified[id].add(String(m.collegeId));
    }
  });

  const totals = { totalCourses: courses.length, withMappings: 0, withoutMappings: 0, withVerified: 0 };

  const byCategory = {};
  for (const c of courses) {
    const cat = String(c.category || '(blank)').trim();
    if (!byCategory[cat]) byCategory[cat] = { total: 0, withMap: 0, noMap: 0, withVerified: 0, colleges: new Set() };
    byCategory[cat].total++;
    const maps = byCourse[c._id.toString()] || new Set();
    const verifiedMaps = byCourseVerified[c._id.toString()] || new Set();
    if (maps.size > 0) { byCategory[cat].withMap++; totals.withMappings++; }
    else { byCategory[cat].noMap++; totals.withoutMappings++; }
    if (verifiedMaps.size > 0) { byCategory[cat].withVerified++; totals.withVerified++; }
    maps.forEach(cl => byCategory[cat].colleges.add(cl));
  }

  console.log('TOTAL active courses:', totals.totalCourses);
  console.log('  with ANY college mappings :', totals.withMappings);
  console.log('  with VERIFIED mappings    :', totals.withVerified);
  console.log('  WITHOUT mappings          :', totals.withoutMappings, '\n');

  console.log('=== PER-CATEGORY COUNTS ===');
  const rows = Object.entries(byCategory).sort((a, b) => b[1].total - a[1].total);
  for (const [cat, d] of rows) {
    console.log(
      [ String(cat).padEnd(28),
        'total:' + String(d.total).padStart(4),
        'anyMap:' + String(d.withMap).padStart(4),
        'verified:' + String(d.withVerified).padStart(4),
        'noMap:' + String(d.noMap).padStart(4),
        'distinctColleges:' + String(d.colleges.size).padStart(4)
      ].join(' | ')
    );
  }

  console.log('\n=== DISTINCT level values ===');
  const levelCounts = {};
  courses.forEach(c => { const l = String(c.level || '(blank)'); levelCounts[l] = (levelCounts[l]||0)+1; });
  Object.entries(levelCounts).sort((a,b)=>b[1]-a[1]).forEach(([l,c]) => console.log(String(l).padEnd(20), ':', c));

  await mongoose.disconnect();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
