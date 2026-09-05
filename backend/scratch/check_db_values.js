const mongoose = require("mongoose");
require("dotenv").config();

const College = require("../models/College");
const Course = require("../models/Course");
const CollegeCourseMapping = require("../models/CollegeCourseMapping");

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  const collegeCount = await College.countDocuments();
  console.log("Total Colleges:", collegeCount);
  
  const courseCount = await Course.countDocuments();
  console.log("Total Courses:", courseCount);

  const sampleColleges = await College.find({}).limit(3).lean();
  console.log("Sample Colleges:", JSON.stringify(sampleColleges, null, 2));

  const sampleCourses = await Course.find({}).limit(3).lean();
  console.log("Sample Courses:", JSON.stringify(sampleCourses, null, 2));

  const uniqueLevels = await Course.distinct("level");
  console.log("Unique course levels in DB:", uniqueLevels);

  const uniqueCategories = await Course.distinct("category");
  console.log("Unique course categories in DB:", uniqueCategories);

  await mongoose.disconnect();
}

check();
