const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Cutoff = require("../models/Cutoff");
const College = require("../models/College");
const Course = require("../models/Course");

async function cleanupDeadRecords() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB, finding records...");
    
    // We only need to check records that don't have legacy strings
    const cutoffs = await Cutoff.find({
      collegeName: { $exists: false },
      department: { $exists: false },
      course: { $exists: false }
    }).select("collegeId courseId");
    
    console.log(`Found ${cutoffs.length} potentially dead records.`);
    
    // Fetch all valid college and course IDs
    const collegeIds = new Set((await College.find().select("_id")).map(c => c._id.toString()));
    const courseIds = new Set((await Course.find().select("_id")).map(c => c._id.toString()));
    
    const idsToDelete = [];
    
    for (const c of cutoffs) {
      const colIdStr = c.collegeId ? c.collegeId.toString() : null;
      const crsIdStr = c.courseId ? c.courseId.toString() : null;
      
      const hasValidCollege = colIdStr && collegeIds.has(colIdStr);
      const hasValidCourse = crsIdStr && courseIds.has(crsIdStr);
      
      if (!hasValidCollege || !hasValidCourse) {
        idsToDelete.push(c._id);
      }
    }
    
    console.log(`Found ${idsToDelete.length} totally dead records. Deleting...`);
    
    if (idsToDelete.length > 0) {
      const res = await Cutoff.deleteMany({ _id: { $in: idsToDelete } });
      console.log(`Deleted ${res.deletedCount} records.`);
    }
    
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

cleanupDeadRecords();
