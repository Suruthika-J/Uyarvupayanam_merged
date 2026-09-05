require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Course = require('../models/Course');
const http = require('http');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const courses = await Course.find({ category: 'Engineering', status: 'active' }).lean();
  const testNames = ['COMPUTER SCIENCE AND ENGINEERING', 'MECHANICAL ENGINEERING', 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE'];

  for (const name of testNames) {
    const c = courses.find(ec => ec.courseName === name);
    const slug = c.slug || c._id;

    const result = await new Promise((resolve, reject) => {
      http.get(`http://localhost:${process.env.PORT || 5000}/api/student/courses/${slug}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
      }).on('error', reject);
    });

    const colleges = result.offeringColleges || [];
    const ids = colleges.map(c => c._id);
    const uniqueIds = new Set(ids);
    const dupes = ids.length - uniqueIds.size;
    const sorted = colleges.every((c, i) => i === 0 || c.collegeName >= colleges[i-1].collegeName);

    console.log(`${name}: ${colleges.length} colleges | dupes: ${dupes} | sorted: ${sorted}`);
    // Show first 3
    colleges.slice(0, 3).forEach(c => console.log(`  ${c.collegeName} | ${c.collegeType} | ${c.district}`));
  }

  await mongoose.disconnect();
})();
