const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Cutoff = require("../models/Cutoff");
const College = require("../models/College");
const Course = require("../models/Course");

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const cutoffs = await Cutoff.find({}).limit(5).lean();
    console.log("Sample Cutoffs (Raw):", JSON.stringify(cutoffs, null, 2));

    const populated = await Cutoff.find({}).limit(5)
      .populate("collegeId", "collegeName")
      .populate("courseId", "courseName")
      .lean();
    console.log("Sample Cutoffs (Populated):", JSON.stringify(populated, null, 2));

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

checkData();
