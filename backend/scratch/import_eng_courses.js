
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const connectDB = require("../config/db");
const Course = require("../models/Course");

dotenv.config({ path: path.join(__dirname, "../.env") });

const toTitleCase = (str) => {
  return str.toLowerCase().split(' ').map(word => {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
};

const runImport = async () => {
  try {
    await connectDB();
    console.log("Importing Engineering courses from cutoff data...");

    // 1. Read cutoffs.json and extract unique courses
    const filePath = path.join(__dirname, "../../cutoffs.json");
    let rawData = fs.readFileSync(filePath, "utf16le");
    if (rawData.charCodeAt(0) === 0xFEFF) rawData = rawData.slice(1);
    const json = JSON.parse(rawData);
    const cutoffData = json.data || [];

    const engCoursesMap = new Map(); // Name -> BranchCode
    cutoffData.forEach(r => {
      if (r.courseId && r.courseId.courseName) {
        engCoursesMap.set(r.courseId.courseName.toUpperCase(), r.courseId.branchCode);
      }
    });

    console.log(`Extracted ${engCoursesMap.size} unique engineering branches.`);

    let insertedCount = 0;
    
    for (const [name, code] of engCoursesMap.entries()) {
      const formattedName = toTitleCase(name);
      
      // Check if already exists in Eng category
      const existing = await Course.findOne({
        courseName: new RegExp(`^${formattedName}$`, "i"),
        category: "Engineering"
      });

      if (!existing) {
        const newCourse = new Course({
          courseName: formattedName,
          level: "after12th",
          category: "Engineering",
          duration: "4 Years",
          branchCode: code,
          eligibility: "12th Standard Pass (MPC)",
          shortDescription: `${formattedName} - A comprehensive 4-year undergraduate program in technology.`,
          isImported: true,
          status: "active",
          isPublished: true
        });
        await newCourse.save();
        insertedCount++;
        console.log(`Added: ${formattedName} [${code}]`);
      }
    }

    console.log(`Done. Inserted ${insertedCount} new engineering courses.`);
    process.exit(0);
  } catch (err) {
    console.error("Critical error:", err);
    process.exit(1);
  }
};

runImport();
