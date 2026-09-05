const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Cutoff = require("../models/Cutoff");
require("../models/Course");
require("../models/College");

async function checkFilter() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const cutoffs = await Cutoff.find({ year: 2024 })
      .lean()
      .populate("courseId", "courseName branchCode")
      .populate("collegeId", "collegeName collegeCode stream district location")
      .sort({ year: -1 })
      .limit(600);
      
    const validCutoffs = cutoffs.filter(c => {
      const hasCollege = c.collegeId || c.collegeName || c.college;
      const hasCourse = c.courseId || c.department || c.course || c.branchCode;
      return hasCollege && hasCourse;
    }).slice(0, 200);
    
    console.log(`Total fetched: ${cutoffs.length}`);
    console.log(`Valid after filter: ${validCutoffs.length}`);
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

checkFilter();
