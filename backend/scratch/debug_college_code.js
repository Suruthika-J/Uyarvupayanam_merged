const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const College = require('../models/College');

async function test() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    
    // Find college with code "352" or 352
    const codeMatch = await College.findOne({
      $or: [
        { collegeCode: "352" },
        { collegeCode: 352 },
        { collegeName: /\(352\)/ }
      ]
    }).lean();

    console.log('College by code "352":', codeMatch);

    // Let's print the total count of colleges in the DB
    const totalColleges = await College.countDocuments({});
    console.log('Total colleges in DB:', totalColleges);

    // Let's count colleges by stream
    const streams = await College.aggregate([
      { $group: { _id: "$stream", count: { $sum: 1 } } }
    ]);
    console.log('Colleges by stream:', streams);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

test();
