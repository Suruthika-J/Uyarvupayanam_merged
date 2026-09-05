
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("../config/db");
const Course = require("../models/Course");
const data = require("./after10th_data");

dotenv.config({ path: path.join(__dirname, "../.env") });

const run = async () => {
  try {
    await connectDB();
    console.log("Importing new courses for Class 10 and 12...");

    let insertedCount = 0;
    
    for (const item of data) {
      const sectionsToInsert = [];
      
      // If the data says "after10th", we might also want it in "after12th" as per user request
      if (item.section === "after10th") {
        sectionsToInsert.push("after10th");
        sectionsToInsert.push("after12th"); // User wants 12th updated with these
      } else if (item.section === "diploma") {
        sectionsToInsert.push("diploma");
      }

      for (const section of sectionsToInsert) {
        // Double check uniqueness with case insensitive regex for name AND field match for section
        const existing = await Course.findOne({
          courseName: new RegExp(`^${item.courseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i"),
          level: section
        });

        if (!existing) {
          const newCourse = new Course({
            courseName: item.courseName,
            level: section,
            category: item.category,
            duration: item.duration || "Not Specified",
            eligibility: section === "after10th" ? "10th Standard Pass" : "12th Standard Pass",
            shortDescription: `${item.courseName} - A specialized career pathway in the field of ${item.category}.`,
            isImported: true,
            status: "active",
            isPublished: true
          });
          await newCourse.save();
          insertedCount++;
          console.log(`Added: ${item.courseName} (${section})`);
        }
      }
    }

    console.log(`Done. Inserted ${insertedCount} new course-section records.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
