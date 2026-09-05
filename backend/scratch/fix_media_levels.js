const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Course = require('../models/Course');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function fixLevels() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const result = await Course.updateMany(
      { 
        category: "Media & Journalism", 
        courseName: /diploma/i 
      },
      { $set: { level: "diploma" } }
    );

    console.log(`Updated ${result.modifiedCount} courses to diploma level.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixLevels();
