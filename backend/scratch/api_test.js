require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Course = require('../models/Course');
const http = require('http');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Get slugs for the 8 target courses
  const targets = [
    'COMPUTER SCIENCE AND ENGINEERING',
    'INFORMATION TECHNOLOGY',
    'MECHANICAL ENGINEERING',
    'ELECTRONICS AND COMMUNICATION ENGINEERING',
    'ELECTRICAL AND ELECTRONICS ENGINEERING',
    'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE',
    'ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING',
  ];

  // Add Civil - use B.E. variant since standalone doesn't exist
  targets.splice(3, 0, 'B.E. Civil Engineering');

  const courses = await Course.find({ category: 'Engineering', status: 'active' }).lean();

  for (const name of targets) {
    const c = courses.find(ec => ec.courseName === name);
    if (!c) { console.log(`❌ ${name}: not found`); continue; }

    // Call the API
    const slug = c.slug || c._id;
    try {
      const result = await new Promise((resolve, reject) => {
        http.get(`http://localhost:${process.env.PORT || 5000}/api/student/courses/${slug}`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try { resolve(JSON.parse(data)); } catch(e) { reject(e); }
          });
        }).on('error', reject);
      });
      console.log(`${name}: ${result.collegeCount || 0} colleges`);
    } catch (err) {
      console.log(`${name}: API error - ${err.message}`);
    }
  }

  await mongoose.disconnect();
})();
