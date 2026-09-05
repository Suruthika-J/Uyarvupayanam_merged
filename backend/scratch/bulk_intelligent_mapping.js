
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("../config/db");
const College = require("../models/College");
const Course = require("../models/Course");

dotenv.config({ path: path.join(__dirname, "../.env") });

const performBulkIntelligentMapping = async () => {
  try {
    await connectDB();
    console.log("🚀 Starting Bulk Intelligent College-Course Mapping...");

    // 1. Fetch all colleges and courses
    const allColleges = await College.find({});
    const allCourses = await Course.find({}).lean();

    console.log(`Found ${allColleges.length} colleges and ${allCourses.length} courses.`);

    const getCourseIds = (categories, names = []) => {
      return allCourses
        .filter(c => {
          const categoryMatch = categories.includes(c.category);
          if (names.length === 0) return categoryMatch;
          
          // If names are provided, further filter (e.g., for Engineering core branches)
          const nameMatch = names.some(n => c.courseName.toLowerCase().includes(n.toLowerCase()));
          return categoryMatch && nameMatch;
        })
        .map(c => c._id);
    };

    let updatedCount = 0;

    for (const college of allColleges) {
      const stream = (college.stream || "").toLowerCase();
      let matchedCourseIds = [];

      // --- INTELLIGENT MAPPING RULES ---
      
      // 1. Engineering Rules (High Accuracy Core Branches)
      if (stream.includes("engineering")) {
        matchedCourseIds = getCourseIds(["Engineering"], [
          "Computer Science", "Electronics and Communication", "Information Technology", 
          "Electrical and Electronics", "Mechanical", "Civil", "Artificial Intelligence"
        ]);
      } 
      // 2. Medical Rules
      else if (stream.includes("medical")) {
        matchedCourseIds = getCourseIds(["Medical", "Paramedical", "Nursing", "Pharmacy"]);
      }
      // 3. Arts & Science
      else if (stream.includes("arts") || stream.includes("science")) {
        matchedCourseIds = getCourseIds(["Arts", "Science", "Commerce", "Management"]);
      }
      // 4. Law
      else if (stream.includes("law")) {
        matchedCourseIds = getCourseIds(["Law"]);
      }
      // 5. Polytechnic / Diploma
      else if (stream.includes("polytechnic") || stream.includes("diploma") || stream.includes("iti")) {
        matchedCourseIds = getCourseIds(["Polytechnic", "ITI"]);
      }
      // 6. Agriculture
      else if (stream.includes("agriculture")) {
        matchedCourseIds = getCourseIds(["Agriculture"]);
      }

      // Update college if we found matches and it's not already mapped (or to refresh)
      if (matchedCourseIds.length > 0) {
        college.coursesOffered = matchedCourseIds;
        // Also ensure streamsOffered is set for filtering
        if (!college.streamsOffered.includes(college.stream)) {
          college.streamsOffered.push(college.stream);
        }
        await college.save();
        updatedCount++;
        if (updatedCount % 100 === 0) console.log(`Processed ${updatedCount} colleges...`);
      }
    }

    console.log(`✅ Success! Automatically mapped courses for ${updatedCount} colleges.`);
    process.exit(0);
  } catch (err) {
    console.error("Bulk mapping failed:", err);
    process.exit(1);
  }
};

performBulkIntelligentMapping();
