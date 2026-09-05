const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Cutoff = require("../models/Cutoff");
require("../models/Course");
require("../models/College");

async function checkPopulate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const cutoffs = await Cutoff.find({ "cutoffData.score": 152.5 })
      .lean()
      .populate("courseId", "courseName branchCode")
      .populate("collegeId", "collegeName collegeCode stream district location")
      .limit(1);
    
    console.log("Record collegeId:", cutoffs[0].collegeId);
    console.log("Record courseId:", cutoffs[0].courseId);
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

checkPopulate();
