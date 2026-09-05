
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("../config/db");
const Course = require("../models/Course");
const coursesData = require("./pdf_courses_data");

dotenv.config({ path: path.join(__dirname, "../.env") });

const normalize = (str) => {
  if (!str) return "";
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ") // Normalize multiple spaces to single space
    .replace(/[.\-]/g, ""); // Remove dots and dashes for better comparison (e.g. B.E vs BE)
};

const runImport = async () => {
  try {
    await connectDB();
    console.log("Starting bulk import from PDF data...");

    let totalExtracted = coursesData.length;
    let insertedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    // Fetch all existing courses to check against in memory for performance
    const existingCourses = await Course.find({}, "courseName level category duration").lean();
    
    // Function to check if a course is a duplicate
    const isDuplicate = (newCourse) => {
      return existingCourses.some(existing => {
        const nameMatch = normalize(existing.courseName) === normalize(newCourse.courseName);
        const typeMatch = normalize(existing.level) === normalize(newCourse.type);
        const categoryMatch = normalize(existing.category) === normalize(newCourse.category);
        const durationMatch = (existing.duration || "").trim() === (newCourse.duration || "").trim();
        
        return nameMatch && typeMatch && categoryMatch && durationMatch;
      });
    };

    for (const data of coursesData) {
      try {
        if (isDuplicate(data)) {
          console.log(`Skipping duplicate: ${data.courseName} | ${data.type} | ${data.category}`);
          skippedCount++;
          continue;
        }

        // Secondary DB check just in case (for courseName uniqueness)
        const dbCheck = await Course.findOne({
          courseName: new RegExp(`^${data.courseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i")
        });

        if (dbCheck) {
          console.log(`Skipping existing name match in DB: ${data.courseName}`);
          skippedCount++;
          continue;
        }

        const newCourse = new Course({
          courseName: data.courseName,
          category: data.category,
          level: data.type, // Map Type to level field
          duration: data.duration || "Not Specified", // Model requires duration
          eligibility: "12th Standard Pass", // Default required field
          shortDescription: `Information about ${data.courseName} (${data.type}) in the field of ${data.category}.`, // Default required field
          isImported: true,
          status: "active",
          isPublished: true
        });

        await newCourse.save();
        insertedCount++;
        console.log(`Successfully added: ${data.courseName}`);
        
        // Add to existingCourses to prevent duplicates within the same batch
        existingCourses.push({
          courseName: newCourse.courseName,
          level: newCourse.level,
          category: newCourse.category,
          duration: newCourse.duration
        });

      } catch (err) {
        console.error(`Error inserting ${data.courseName}:`, err.message);
        failedCount++;
      }
    }

    console.log("\n--- Import Summary ---");
    console.log(`Total Extracted: ${totalExtracted}`);
    console.log(`Total Inserted: ${insertedCount}`);
    console.log(`Total Duplicates Skipped: ${skippedCount}`);
    console.log(`Total Failed Rows: ${failedCount}`);
    console.log("----------------------\n");

    process.exit(0);
  } catch (err) {
    console.error("Critical error during import:", err);
    process.exit(1);
  }
};

runImport();
