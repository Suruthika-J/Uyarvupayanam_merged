const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Cutoff = require("../models/Cutoff");
// Need to require these so they are registered for populate
require("../models/Course");
require("../models/College");

async function testQuery() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const cutoffs = await Cutoff.find({ year: 2024 })
      .lean()
      .populate("courseId", "courseName branchCode")
      .populate("collegeId", "collegeName collegeCode stream district location")
      .sort({ year: -1 })
      .limit(2);
    
    console.log(JSON.stringify(cutoffs, null, 2));
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

testQuery();
