
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("../config/db");
const Course = require("../models/Course");

dotenv.config({ path: path.join(__dirname, "../.env") });

const runPrefix = async () => {
  try {
    await connectDB();
    console.log("Adding B.E. / B.Tech. prefixes to Engineering courses...");

    const courses = await Course.find({ category: "Engineering" });
    let updatedCount = 0;

    for (const course of courses) {
      let name = course.courseName;
      // Skip if already has prefix
      if (name.startsWith("B.E.") || name.startsWith("B.Tech.")) continue;

      const lower = name.toLowerCase();
      let prefix = "B.E."; // Default

      if (
        lower.includes("technology") || 
        lower.includes("it ") || 
        lower.includes("information technology") ||
        lower.includes("chemical") ||
        lower.includes("biotech") ||
        lower.includes("food") ||
        lower.includes("petroleum") ||
        lower.includes("textile") ||
        lower.includes("pharmaceutical") ||
        lower.includes("leather") ||
        lower.includes("plastic") ||
        lower.includes("rubber") ||
        lower.includes("ceramic") ||
        lower.includes("material science") ||
        lower.includes("fashion")
      ) {
        prefix = "B.Tech.";
      }

      course.courseName = `${prefix} ${name}`;
      await course.save();
      updatedCount++;
    }

    console.log(`Updated ${updatedCount} courses with professional prefixes.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

runPrefix();
