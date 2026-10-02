const mongoose = require('mongoose');
const path = require('path');

async function testBackend() {
  await mongoose.connect('mongodb://localhost:27017/uyarvu-payanam');
  console.log("Connected to Mongo DB");

  const AhpFuzzyResult = require(path.join(__dirname, '../models/AhpFuzzyResult'));
  const CollegeStudentProfile = require(path.join(__dirname, '../models/CollegeStudentProfile'));

  const result = await AhpFuzzyResult.findOne().sort({ completedAt: -1, createdAt: -1 });
  console.log("Latest AhpFuzzyResult in DB:", JSON.stringify(result, null, 2));

  const profile = await CollegeStudentProfile.findOne().sort({ updatedAt: -1 });
  console.log("Latest Profile in DB:", JSON.stringify(profile, null, 2));

  await mongoose.disconnect();
}

testBackend().catch(console.error);
