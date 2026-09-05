
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const connectDB = require("../config/db");
const College = require("../models/College");
const Course = require("../models/Course");

dotenv.config({ path: path.join(__dirname, "../.env") });

const normalize = (str) => String(str || "").toUpperCase().replace(/[^A-Z]/g, " ").replace(/\s+/g, " ").trim();

const runMapping = async () => {
  try {
    await connectDB();
    console.log("Starting comprehensive College-Course mapping...");

    // 1. Fetch all Courses and group them by Category
    const allCourses = await Course.find({}).lean();
    const categoriesMap = {};
    allCourses.forEach(c => {
      if (!categoriesMap[c.category]) categoriesMap[c.category] = [];
      categoriesMap[c.category].push(c._id);
    });

    // 2. Load cutoffs.json for specific Engineering matches
    let cutoffs = [];
    const cutoffPath = path.join(__dirname, "../../cutoffs.json");
    if (fs.existsSync(cutoffPath)) {
      try {
        let rawData = fs.readFileSync(cutoffPath, "utf16le");
        if (rawData.charCodeAt(0) === 0xFEFF) rawData = rawData.slice(1);
        const json = JSON.parse(rawData);
        cutoffs = json.data || [];
      } catch (e) {
        let rawData = fs.readFileSync(cutoffPath, "utf8");
        const json = JSON.parse(rawData);
        cutoffs = json.data || [];
      }
    }

    // Map Normalized Name -> Course ID for cutoff matching
    const courseLookup = {};
    allCourses.forEach(c => {
      const norm = normalize(c.courseName);
      if (!courseLookup[norm]) courseLookup[norm] = c._id;
    });

    const specificEngineerMap = new Map(); // CollegeCode -> Set of CourseIDs
    cutoffs.forEach(r => {
      if (r.collegeId && r.courseId) {
        const normName = normalize(r.courseId.courseName);
        const courseId = courseLookup[normName];
        if (courseId) {
          if (!specificEngineerMap.has(r.collegeId.collegeCode)) {
            specificEngineerMap.set(r.collegeId.collegeCode, new Set());
          }
          specificEngineerMap.get(r.collegeId.collegeCode).add(courseId.toString());
        }
      }
    });

    // 3. Define Core Courses for fallbacks
    const coreEng = [
      ... (categoriesMap["Engineering"] || []).filter(id => {
         const c = allCourses.find(x => x._id.toString() === id.toString());
         const n = c.courseName.toLowerCase();
         return n.includes("civil") || n.includes("mechanical") || n.includes("electrical") || n.includes("electronics") || n.includes("computer science");
      })
    ];

    // 4. Update Colleges
    const colleges = await College.find({});
    console.log(`Updating ${colleges.length} colleges...`);

    let updatedCount = 0;

    for (const college of colleges) {
      const stream = college.stream;
      let courseIds = new Set();

      // Add stream-based courses
      switch (stream) {
        case "Engineering":
          if (specificEngineerMap.has(college.collegeCode)) {
            specificEngineerMap.get(college.collegeCode).forEach(id => courseIds.add(id));
          } else {
            // Fallback to core engineering
            coreEng.forEach(id => courseIds.add(id.toString()));
          }
          // Also add IT/IT&Computer for variety
          (categoriesMap["IT & Computer"] || []).forEach(id => courseIds.add(id.toString()));
          break;
        case "Medical":
          (categoriesMap["Medical"] || []).forEach(id => courseIds.add(id.toString()));
          break;
        case "Arts & Science":
          (categoriesMap["Arts"] || []).forEach(id => courseIds.add(id.toString()));
          (categoriesMap["Science"] || []).forEach(id => courseIds.add(id.toString()));
          (categoriesMap["Commerce"] || []).forEach(id => courseIds.add(id.toString()));
          (categoriesMap["Design"] || []).forEach(id => courseIds.add(id.toString()));
          break;
        case "Polytechnic":
          (categoriesMap["Polytechnic"] || []).forEach(id => courseIds.add(id.toString()));
          break;
        case "Agriculture":
          (categoriesMap["Agriculture"] || []).forEach(id => courseIds.add(id.toString()));
          break;
        case "Law":
          (categoriesMap["Law"] || []).forEach(id => courseIds.add(id.toString()));
          break;
        case "ITI":
          (categoriesMap["ITI"] || []).forEach(id => courseIds.add(id.toString()));
          break;
      }

      if (courseIds.size > 0) {
        college.coursesOffered = Array.from(courseIds).map(id => new mongoose.Types.ObjectId(id));
        await college.save();
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} colleges with course mappings.`);
    process.exit(0);
  } catch (err) {
    console.error("Critical error:", err);
    process.exit(1);
  }
};

runMapping();
