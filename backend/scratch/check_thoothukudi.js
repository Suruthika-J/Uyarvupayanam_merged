const mongoose = require('mongoose');

async function checkColleges() {
  await mongoose.connect('mongodb://localhost:27017/uyarvu-payanam');
  const College = require('../models/College');

  const allColleges = await College.find({}).lean();
  console.log('Total Colleges in DB:', allColleges.length);

  // Group by stream
  const streams = {};
  allColleges.forEach(c => {
    const s = c.stream || c.type || 'Unknown';
    streams[s] = (streams[s] || 0) + 1;
  });
  console.log('Streams distribution:', streams);

  // Find all colleges in DB matching Thoothukudi or Tuticorin
  const thoothukudiMatches = allColleges.filter(c => {
    const dist = (c.district || '').toLowerCase();
    const loc = (c.location || '').toLowerCase();
    const name = (c.collegeName || '').toLowerCase();
    return dist.includes('thoothukudi') || dist.includes('tuticorin') ||
           loc.includes('thoothukudi') || loc.includes('tuticorin') ||
           name.includes('thoothukudi') || name.includes('tuticorin') || name.includes('kovilpatti');
  });

  console.log('\n--- MATCHES FOR THOOTHUKUDI / TUTICORIN IN DB ---');
  console.log(`Count: ${thoothukudiMatches.length}`);
  thoothukudiMatches.forEach(c => {
    console.log(`Name: ${c.collegeName} | District: "${c.district}" | Location: "${c.location}" | Stream: "${c.stream}" | Type: "${c.type}"`);
  });

  // Check Engineering stream colleges in DB
  const engColleges = allColleges.filter(c => (c.stream === 'Engineering' || c.type === 'Engineering College'));
  console.log(`\nTotal Engineering Colleges in DB: ${engColleges.length}`);

  // Print all distinct districts for Engineering colleges
  const engDistricts = {};
  engColleges.forEach(c => {
    engDistricts[c.district] = (engDistricts[c.district] || 0) + 1;
  });
  console.log('Engineering Colleges by District:', engDistricts);

  await mongoose.disconnect();
}

checkColleges().catch(err => {
  console.error(err);
  process.exit(1);
});
