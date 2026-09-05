require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Course = require('../models/Course');
const M = require('../models/CollegeCourseMapping');
const http = require('http');

const BASE = `http://localhost:${process.env.PORT || 5000}`;

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    }).on('error', reject);
  });
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Get all visible Medical courses (after dedup in getAllCourses)
  const allCourses = await fetch(`${BASE}/api/courses?category=Medical`);
  const courses = Array.isArray(allCourses.data) ? allCourses.data : [];

  console.log(`=== TESTING ${courses.length} MEDICAL COURSES VIA STUDENT API ===\n`);

  let pass = 0, fail = 0;
  for (const c of courses) {
    const slug = c.slug || c._id;
    try {
      const details = await fetch(`${BASE}/api/student/courses/${slug}`);
      const count = details.collegeCount || (details.offeringColleges || []).length;
      const marker = count > 0 ? '✅' : '⚠️';
      if (count > 0) pass++; else fail++;
      console.log(`${marker} ${c.courseName}: ${count} colleges`);
    } catch (err) {
      fail++;
      console.log(`❌ ${c.courseName}: ERROR - ${err.message}`);
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Pass: ${pass} | Fail: ${fail} | Total: ${courses.length}`);

  await mongoose.disconnect();
})();
