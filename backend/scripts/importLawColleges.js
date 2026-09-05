const path = require('path');
const xlsx = require('xlsx');
const mongoose = require('mongoose');

// Load environment variables from backend/.env
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const College = require('../models/College');
const Course = require('../models/Course');
const CollegeCourseMapping = require('../models/CollegeCourseMapping');

const excelPath = `C:\\Users\\harin\\OneDrive\\Desktop\\Uyarvu Payanam\\Uyarvu-Payanam\\backend\\uploads\\Course Offered Law Colleges Detais.xlsx`;

// Robust normalization for course names to avoid duplicates
const normalizeForMatch = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/\./g, "")      // remove dots
    .replace(/\s+/g, "")     // remove all spaces
    .replace(/,/g, "")       // remove commas
    .replace(/[\(\)]/g, "")  // remove parentheses
    .replace(/-/g, "")       // remove hyphens
    .trim();
};

// College name normalization for matching
const normalizeCollegeName = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\(autonomous\)/g, "")
    .replace(/autonomous/g, "")
    .replace(/\(a\)/g, "")
    .replace(/[.,]/g, "")
    .trim();
};

async function runImport() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI not found in environment variables.");
    }
    
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Load workbook
    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
    
    console.log(`📊 Loaded Excel with ${rows.length} rows.`);

    // Summary statistics
    const summary = {
      totalCollegesUpdated: 0,
      totalNewCoursesAdded: 0,
      totalExistingCoursesReused: 0,
      totalMappingsCreated: 0,
      duplicatesSkipped: 0,
      errors: []
    };

    // Load existing courses and colleges for fast in-memory matching
    const allCoursesInDb = await Course.find({});
    const allCollegesInDb = await College.find({});

    const uniqueCollegesUpdatedSet = new Set();

    // Set of course names to ignore
    const ignoredCourses = new Set(["llb", "llm", "l.l.b.", "l.l.m.", "ll.b.", "ll.m.", "l.l.b", "l.l.m"]);

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const collegeCodeRaw = row['College Code'];
      const collegeNameRaw = row['College Name'];
      
      // Skip empty rows
      if (!collegeCodeRaw && !collegeNameRaw) {
        continue;
      }

      const collegeCode = (collegeCodeRaw || "").toString().trim();
      const collegeName = (collegeNameRaw || "").toString().trim();

      try {
        // 1. Resolve Courses offered in this row
        const courseNamesRaw = row['Course Name'];
        if (!courseNamesRaw) {
          console.log(`⚠️ Row ${index + 1} (${collegeName}): No courses listed.`);
          continue;
        }

        // Split courses by comma and normalize them
        const rawCoursesList = courseNamesRaw.split(',').map(c => c.trim()).filter(Boolean);
        const resolvedCourseIds = [];

        for (const rawCourseName of rawCoursesList) {
          // Check if it is LL.B. or LL.M. to ignore
          const normCourse = normalizeForMatch(rawCourseName);
          if (ignoredCourses.has(normCourse) || normCourse === "llb" || normCourse === "llm") {
            continue;
          }

          // Search Course Master for match
          let matchedCourse = allCoursesInDb.find(c => normalizeForMatch(c.courseName) === normCourse);

          if (matchedCourse) {
            resolvedCourseIds.push(matchedCourse._id);
            summary.totalExistingCoursesReused++;
          } else {
            // Create a new Course
            const newCourse = new Course({
              courseName: rawCourseName,
              level: "after12th",
              category: "Law",
              duration: "5 Years",
              eligibility: "12th Pass",
              shortDescription: "5-Year Integrated Bachelor's Law program.",
              status: "active",
              isPublished: true,
              isImported: true,
              sourceName: "TNDALU & Official College Website"
            });

            await newCourse.save();
            allCoursesInDb.push(newCourse); // Add to local cache
            resolvedCourseIds.push(newCourse._id);
            summary.totalNewCoursesAdded++;
            console.log(`🆕 Created Course: "${rawCourseName}"`);
          }
        }

        if (resolvedCourseIds.length === 0) {
          continue;
        }

        // 2. Resolve College
        let college = null;
        
        // Match by code first
        if (collegeCode) {
          college = allCollegesInDb.find(c => c.collegeCode && c.collegeCode.trim().toLowerCase() === collegeCode.toLowerCase());
        }

        // If not matched by code, match by name
        if (!college && collegeName) {
          const normRowCollegeName = normalizeCollegeName(collegeName);
          college = allCollegesInDb.find(c => normalizeCollegeName(c.collegeName) === normRowCollegeName);
        }

        if (college) {
          // Update existing college fields
          let updated = false;

          if (collegeCode && college.collegeCode !== collegeCode) {
            college.collegeCode = collegeCode;
            updated = true;
          }

          if (!college.streamsOffered.includes("Law")) {
            college.streamsOffered.push("Law");
            updated = true;
          }

          if (!college.stream) {
            college.stream = "Law";
            updated = true;
          }

          const website = row['Official Website'] ? row['Official Website'].trim() : "";
          if (website && !college.website) {
            college.website = website;
            updated = true;
          }

          const district = row['District'] ? row['District'].trim() : "";
          if (district && !college.district) {
            college.district = district;
            updated = true;
          }

          if (updated) {
            await college.save();
          }
        } else {
          // Create new college
          const type = row['College Type'] ? row['College Type'].trim() : "";
          let category = "Private";
          if (type.toLowerCase() === 'govt' || type.toLowerCase() === 'government') {
            category = "Government";
          }

          college = new College({
            collegeName: collegeName,
            collegeCode: collegeCode,
            stream: "Law",
            streamsOffered: ["Law"],
            district: row['District'] ? row['District'].trim() : "",
            website: row['Official Website'] ? row['Official Website'].trim() : "",
            state: "Tamil Nadu",
            category: category,
            type: type,
            coursesOffered: []
          });

          await college.save();
          allCollegesInDb.push(college); // Add to local cache
          console.log(`🆕 Created College: "${collegeName}" (Code: ${collegeCode})`);
        }

        uniqueCollegesUpdatedSet.add(college._id.toString());

        // 3. Map Courses to the College
        // Preserve all existing courses, append new ones
        const currentCourses = (college.coursesOffered || []).map(id => id.toString());
        let collegeCoursesUpdated = false;

        for (const courseId of resolvedCourseIds) {
          const courseIdStr = courseId.toString();
          if (!currentCourses.includes(courseIdStr)) {
            currentCourses.push(courseIdStr);
            collegeCoursesUpdated = true;
          }

          // Check CollegeCourseMapping collection
          const mappingExists = await CollegeCourseMapping.findOne({
            collegeId: college._id,
            courseId: courseId
          });

          if (mappingExists) {
            if (!mappingExists.isActive) {
              mappingExists.isActive = true;
              await mappingExists.save();
            }
            summary.duplicatesSkipped++;
          } else {
            // Create mapping
            const newMapping = new CollegeCourseMapping({
              collegeId: college._id,
              courseId: courseId,
              source: "Import",
              isActive: true,
              isVerified: true
            });
            await newMapping.save();
            summary.totalMappingsCreated++;
          }
        }

        if (collegeCoursesUpdated) {
          college.coursesOffered = currentCourses.map(id => new mongoose.Types.ObjectId(id));
          await college.save();
        }

      } catch (err) {
        console.error(`❌ Error processing row ${index + 1} (${collegeName}):`, err.message);
        summary.errors.push(`Row ${index + 1} (${collegeName}): ${err.message}`);
      }
    }

    summary.totalCollegesUpdated = uniqueCollegesUpdatedSet.size;

    // Display final summary
    console.log("\n==============================================");
    console.log("             IMPORT SUMMARY RESULTS           ");
    console.log("==============================================");
    console.log(`Total Colleges Updated:                 ${summary.totalCollegesUpdated}`);
    console.log(`Total New Courses Added:                ${summary.totalNewCoursesAdded}`);
    console.log(`Total Existing Courses Reused:          ${summary.totalExistingCoursesReused}`);
    console.log(`Total College-Course Mappings Created:  ${summary.totalMappingsCreated}`);
    console.log(`Duplicates Skipped:                     ${summary.duplicatesSkipped}`);
    
    if (summary.errors.length > 0) {
      console.log(`Errors encountered (${summary.errors.length}):`);
      summary.errors.forEach(e => console.log(` - ${e}`));
    } else {
      console.log("Errors:                                 None");
    }
    console.log("==============================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Fatal migration error:", error);
    process.exit(1);
  }
}

runImport();
