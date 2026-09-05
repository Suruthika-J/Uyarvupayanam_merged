
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
    console.log("Starting efficient College-Course mapping...");

    // 1. Fetch all Courses and group them by Category
    const allCourses = await Course.find({}).lean();
    const cat = {};
    allCourses.forEach(c => {
      if (!cat[c.category]) cat[c.category] = [];
      cat[c.category].push(c._id);
    });

    const getIds = (list) => {
       let res = [];
       list.forEach(cname => {
         if (cat[cname]) res = res.concat(cat[cname]);
       });
       return res;
    };

    // 2. Perform bulk updates per stream
    const updateTasks = [
      { stream: "Medical", categories: ["Medical"] },
      { stream: "Arts & Science", categories: ["Arts", "Science", "Commerce", "Design"] },
      { stream: "Polytechnic", categories: ["Polytechnic"] },
      { stream: "Agriculture", categories: ["Agriculture"] },
      { stream: "Law", categories: ["Law"] }
    ];

    for (const task of updateTasks) {
       const ids = getIds(task.categories);
       if (ids.length > 0) {
          const result = await College.updateMany(
            { stream: task.stream },
            { $set: { coursesOffered: ids } }
          );
          console.log(`Updated ${result.modifiedCount} colleges in stream: ${task.stream}`);
       }
    }

    // 3. Special handling for Engineering (using cutoffs.json)
    console.log("Updating Engineering colleges...");
    const cutoffPath = path.join(__dirname, "../../cutoffs.json");
    let cutoffs = [];
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

    const courseLookup = {};
    allCourses.forEach(c => courseLookup[normalize(c.courseName)] = c._id);

    const specificEngineerMap = new Map();
    cutoffs.forEach(r => {
      if (r.collegeId && r.courseId) {
        const courseId = courseLookup[normalize(r.courseId.courseName)];
        if (courseId) {
          if (!specificEngineerMap.has(r.collegeId.collegeCode)) specificEngineerMap.set(r.collegeId.collegeCode, new Set());
          specificEngineerMap.get(r.collegeId.collegeCode).add(courseId.toString());
        }
      }
    });

    const coreEngIds = getIds(["Engineering", "IT & Computer"]);
    
    // For Engineering, we do individual updates for cutoffs, then bulk for the rest
    const engColleges = await College.find({ stream: "Engineering" });
    console.log(`Processing ${engColleges.length} engineering colleges...`);
    
    const bulkOps = [];
    engColleges.forEach(col => {
       const mappedIds = specificEngineerMap.has(col.collegeCode) 
         ? Array.from(specificEngineerMap.get(col.collegeCode)).map(id => new mongoose.Types.ObjectId(id))
         : coreEngIds;
         
       bulkOps.push({
         updateOne: {
           filter: { _id: col._id },
           update: { $set: { coursesOffered: mappedIds } }
         }
       });
    });

    if (bulkOps.length > 0) {
       const res = await College.bulkWrite(bulkOps);
       console.log(`Engineering bulk write complete: ${res.modifiedCount} updated.`);
    }

    console.log("Adding ITI Colleges to database (from skilltraining.tn.gov.in)...");
    const itiColleges = [
      { collegeName: "Government ITI, North Chennai", stream: "ITI", district: "Chennai", location: "Tondiarpet" },
      { collegeName: "Government ITI, Salem", stream: "ITI", district: "Salem", location: "Salem" },
      { collegeName: "Government ITI, Coimbatore", stream: "ITI", district: "Coimbatore", location: "Gnanamani" },
      { collegeName: "Government ITI, Madurai", stream: "ITI", district: "Madurai", location: "Madurai" },
      { collegeName: "Government ITI, Trichy", stream: "ITI", district: "Tiruchirappalli", location: "Trichy" }
    ];
    
    const itiIds = getIds(["ITI"]);
    for (const col of itiColleges) {
       await College.findOneAndUpdate(
         { collegeName: col.collegeName },
         { ...col, coursesOffered: itiIds },
         { upsert: true, new: true }
       );
    }
    console.log("ITI Colleges updated.");

    process.exit(0);
  } catch (err) {
    console.error("Critical error:", err);
    process.exit(1);
  }
};

runMapping();
