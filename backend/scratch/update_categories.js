
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("../config/db");
const Course = require("../models/Course");

dotenv.config({ path: path.join(__dirname, "../.env") });

const runUpdate = async () => {
  try {
    await connectDB();
    console.log("Updating categories based on Type and Screenshot mapping...");

    const courses = await Course.find({});
    console.log(`Processing ${courses.length} courses...`);

    let updatedCount = 0;

    for (const course of courses) {
      const type = course.level; // Type is stored in level
      const name = course.courseName.toLowerCase();
      let oldCategory = course.category;
      let newCategory = oldCategory;

      // 1. Special Type-based Mappings (Rule: "use type for that")
      if (type === "Diploma") {
        newCategory = "Polytechnic";
      } else if (["Vocational Diploma", "Certificate", "Short Term Course"].includes(type)) {
        newCategory = "ITI";
      } else {
        // 2. Keyword-based Mappings (High priority for specific groupings)
        if (name.includes("computer") || name.includes(" it") || name.includes("information technology") || 
            name.includes("data science") || name.includes("artificial intelligence") || name.includes("cyber security") ||
            name.includes("application") || name.includes("big data") || name.includes("software")) {
          newCategory = "IT & Computer";
        } else if (name.includes("hotel") || name.includes("catering") || name.includes("hospitality")) {
          newCategory = "Hotel Management";
        } else if (name.includes("design") || name.includes("animation") || name.includes("multimedia") || 
                   name.includes("graphic") || name.includes("fashion") || name.includes("interior") ||
                   name.includes("textile") || name.includes("apparel") || name.includes("visual communication")) {
          newCategory = "Design";
        } else {
          // 3. General Category Consolidation (to match screenshot dropdown)
          switch (oldCategory) {
            case "Medical":
            case "Allied Health Science":
              newCategory = "Medical";
              break;
            case "Agriculture":
            case "Forestry":
            case "Horticulture":
            case "Fisheries":
            case "Food Technology":
              newCategory = "Agriculture";
              break;
            case "Architecture & Planning":
              newCategory = "Architecture";
              break;
            case "Mass Communication & Media":
              newCategory = "Media & Journalism";
              break;
            case "Foreign Languages":
            case "Teacher Education":
            case "Music and Fine Arts":
            case "Physical Education":
              newCategory = "Arts";
              break;
            case "Technology":
              newCategory = "Engineering";
              break;
            case "Management":
              // If not mapped by keyword to Hotel Management, put BBA-style mgmt under Commerce
              newCategory = "Commerce"; 
              break;
            case "Government Exam Preparation":
            case "Entrance Exam":
              // Place these under Science or Arts depending on context? 
              // Usually Entrance Exams are for Engineering/Medical. 
              // Leaving as is or mapping to Arts if general.
              newCategory = "Science"; 
              break;
            default:
              // Keep as is if it matches or is unknown
              break;
          }
        }
      }

      // Final check against allowed list from screenshot
      const allowedCategories = [
        "Agriculture", "Architecture", "Arts", "Commerce", "Design", "Engineering",
        "Hotel Management", "IT & Computer", "ITI", "Law", "Media & Journalism",
        "Medical", "Polytechnic", "Science"
      ];

      // If mapped to something not in the list, default to Science/Arts or keep as is if reasonable
      if (!allowedCategories.includes(newCategory)) {
          if (["Engineering", "Technology"].includes(newCategory)) newCategory = "Engineering";
          else if (["Medical", "Nursing", "Pharma"].includes(newCategory)) newCategory = "Medical";
          else newCategory = "Science"; // Default fallback
      }

      if (course.category !== newCategory) {
        course.category = newCategory;
        await course.save();
        updatedCount++;
      }
    }

    console.log(`Update complete. Updated ${updatedCount} courses.`);
    process.exit(0);
  } catch (err) {
    console.error("Error during update:", err);
    process.exit(1);
  }
};

runUpdate();
