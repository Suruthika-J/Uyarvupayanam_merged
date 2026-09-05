const mongoose = require('mongoose');
const { importCoursesFromPdf } = require('../controllers/collegeController');
require('dotenv').config({ path: 'backend/.env' });

async function testImport() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log("Connected to DB...");

    const req = {};
    const res = {
      status: (code) => ({
        json: (data) => {
          console.log(`Response Code: ${code}`);
          console.log('Response Data:', JSON.stringify(data, null, 2));
          process.exit(0);
        }
      })
    };

    await importCoursesFromPdf(req, res);
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

testImport();
