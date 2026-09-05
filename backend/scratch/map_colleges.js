
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const connectDB = require("../config/db");
const College = require("../models/College");
const Course = require("../models/Course");

dotenv.config({ path: path.join(__dirname, "../.env") });

const normalizeCourse = (name) => {
  if (!name) return "";
  return name.toUpperCase()
    .replace(/^B\.E\./, "")
    .replace(/^B\.TECH\./, "")
    .replace(/ENGINEERING$/, "")
    .replace(/ENGG$/, "")
    .replace(/\(.*\)$/, "") // Remove parenthetical info (Tamile Medium, etc)
    .trim()
    .replace(/\s+/g, " ");
};

const runMapping = async () => {
  try {
    await connectDB();
    console.log("Starting College-Course mapping...");

    // 1. Load data from cutoffs.json
    let rawData;
    const filePath = path.join(__dirname, "../../cutoffs.json");
    try {
      rawData = fs.readFileSync(filePath, "utf16le");
      // Strip potential BOM
      if (rawData.charCodeAt(0) === 0xFEFF) {
        rawData = rawData.slice(1);
      }
    } catch (e) {
      console.log("Failed to read with utf16le, trying utf8...");
      rawData = fs.readFileSync(filePath, "utf8");
    }

    const cutoffsRoot = JSON.parse(rawData);
    const cutoffs = cutoffsRoot.data || [];
    console.log(`Loaded ${cutoffs.length} cutoff records.`);

    // 2. Load all courses to memory for mapping
    const courses = await Course.find({}).lean();
    const courseMap = new Map(); // Normalized Name -> Course Object
    courses.forEach(c => {
      const norm = normalizeCourse(c.courseName);
      if (!courseMap.has(norm)) {
        courseMap.set(norm, c);
      }
    });

    // 3. Process mappings
    const collegeCourseMap = new Map(); // CollegeCode -> Set of Course IDs

    let matchedCoursesCount = 0;
    let unmatchedCourses = new Set();

    if (Array.isArray(cutoffs)) {
      cutoffs.forEach((record, index) => {
        if (!record.collegeId || !record.courseId) {
          console.log(`Skipping record at index ${index}: missing collegeId or courseId`);
          return;
        }

        const collegeCode = record.collegeId.collegeCode;
        const jsonCourseName = record.courseId.courseName;
        
        if (!collegeCode) {
          console.log(`Skipping record at index ${index}: missing collegeCode`);
          return;
        }

        const normName = normalizeCourse(jsonCourseName);
        const course = courseMap.get(normName);
        
        if (course) {
          if (!collegeCourseMap.has(collegeCode)) {
            collegeCourseMap.set(collegeCode, new Set());
          }
          collegeCourseMap.get(collegeCode).add(course._id.toString());
          matchedCoursesCount++;
        } else {
          unmatchedCourses.add(jsonCourseName);
        }
      });
    } else {
       console.log("Error: cutoffs.data is not an array");
    }



    console.log(`Successfully matched ${matchedCoursesCount} course occurrences across colleges.`);
    console.log(`Unique unmatched course names in JSON: ${unmatchedCourses.size}`);

    // 4. Update Colleges
    let updatedCollegesCount = 0;
    let collegesNotFound = 0;

    const collegeCodes = Array.from(collegeCourseMap.keys());
    console.log(`Updating coursesOffered for ${collegeCodes.length} colleges...`);

    for (const code of collegeCodes) {
      const courseIds = Array.from(collegeCourseMap.get(code)).map(id => new mongoose.Types.ObjectId(id));
      
      const result = await College.updateOne(
        { collegeCode: code },
        { $addToSet: { coursesOffered: { $each: courseIds } } }
      );

      if (result.matchedCount > 0) {
        updatedCollegesCount++;
      } else {
        collegesNotFound++;
      }
    }

    console.log(`Final Summary:`);
    console.log(`Colleges Updated: ${updatedCollegesCount}`);
    console.log(`Colleges Matched but not found in DB: ${collegesNotFound}`);

    process.exit(0);
  } catch (err) {
    console.error("Critical error during mapping:", err);
    process.exit(1);
  }
};

runMapping();
