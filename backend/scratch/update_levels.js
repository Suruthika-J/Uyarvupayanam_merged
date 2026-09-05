
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("../config/db");
const Course = require("../models/Course");

dotenv.config({ path: path.join(__dirname, "../.env") });

const runUpdate = async () => {
  try {
    await connectDB();
    console.log("Updating 'level' field to match system standard types...");

    const courses = await Course.find({});
    console.log(`Processing ${courses.length} courses...`);

    let updatedCount = 0;

    for (const course of courses) {
      let oldLevel = course.level;
      let newLevel = oldLevel;

      // Map existing descriptive types to system-friendly filter types
      // Allowed: "after10th", "after12th", "diploma", "certificate"
      
      const normalizedOld = String(oldLevel || "").toLowerCase();

      if (normalizedOld.includes("diploma")) {
        newLevel = "diploma";
      } else if (normalizedOld.includes("certificate") || normalizedOld.includes("short term")) {
        newLevel = "certificate";
      } else if (normalizedOld.includes("after10th")) {
        newLevel = "after10th";
      } else {
        // Default for Degree, Integrated, Professional, etc. from the PDF
        newLevel = "after12th";
      }

      if (course.level !== newLevel) {
        course.level = newLevel;
        await course.save();
        updatedCount++;
      }
    }

    console.log(`Update complete. Updated ${updatedCount} courses with proper system Types.`);
    process.exit(0);
  } catch (err) {
    console.error("Error during level update:", err);
    process.exit(1);
  }
};

runUpdate();
