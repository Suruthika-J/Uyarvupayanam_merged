require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Course = require('../models/Course');
const M = require('../models/CollegeCourseMapping');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Check the exact normalization for AIML course
  const aiml = await Course.findOne({ courseName: 'ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING', category: 'Engineering' }).lean();
  const normalizeCourseName = (name) =>
    (name || '')
      .replace(/^b\.?e\.?\s*/i, '')
      .replace(/^b\.?tech\.?\s*/i, '')
      .replace(/^m\.?e\.?\s*/i, '')
      .replace(/^m\.?tech\.?\s*/i, '')
      .replace(/\s*\(.*?\)\s*/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

  const aimlNorm = normalizeCourseName(aiml.courseName);
  console.log('AIML normalized:', aimlNorm);

  // What about the B.E. variant - does its normalization include "artificial intelligence and machine learning"?
  const beAiml = await Course.findOne({ courseName: 'B.E. Computer Science And Engineering (artificial Intelligence And Machine Learning)' }).lean();
  if (beAiml) {
    const beAimlNorm = normalizeCourseName(beAiml.courseName);
    console.log('B.E. CSE(AI&ML) normalized:', beAimlNorm);
    console.log('Match?', aimlNorm === beAimlNorm);
  }

  // So AIML only matches itself. Check its actual mappings
  const aimlMappings = await M.countDocuments({ courseId: aiml._id, isActive: true, isVerified: true });
  console.log('AIML direct mappings:', aimlMappings);

  // For validation: show how many unique colleges each target course would return
  const targets = [
    'COMPUTER SCIENCE AND ENGINEERING',
    'INFORMATION TECHNOLOGY', 
    'MECHANICAL ENGINEERING',
    'CIVIL ENGINEERING',
    'ELECTRONICS AND COMMUNICATION ENGINEERING',
    'ELECTRICAL AND ELECTRONICS ENGINEERING',
    'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE',
    'ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING',
  ];

  const allEng = await Course.find({ category: 'Engineering', status: 'active' }).lean();
  console.log('\n=== FINAL VALIDATION ===');
  for (const name of targets) {
    const c = allEng.find(ec => ec.courseName === name);
    if (!c) { console.log(`❌ ${name}: course not found`); continue; }
    const tNorm = normalizeCourseName(c.courseName);
    const variantIds = allEng.filter(ec => normalizeCourseName(ec.courseName) === tNorm).map(ec => ec._id);
    const collegeCount = await M.distinct('collegeId', {
      courseId: { $in: variantIds },
      isActive: true,
      isVerified: true
    }).then(ids => ids.length);
    console.log(`✅ ${name}: ${collegeCount} unique colleges`);
  }

  await mongoose.disconnect();
})();
