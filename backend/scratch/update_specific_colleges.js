
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("../config/db");
const College = require("../models/College");
const Course = require("../models/Course");

dotenv.config({ path: path.join(__dirname, "../.env") });

const runSpecificMapping = async () => {
  try {
    await connectDB();
    console.log("Updating specific high-accuracy mappings for top institutions...");

    const allCourses = await Course.find({}).lean();
    const findId = (name, cat) => {
      const c = allCourses.find(x => x.courseName.includes(name) && (cat ? x.category === cat : true));
      return c ? c._id : null;
    };

    const findIds = (names, cat) => names.map(n => findId(n, cat)).filter(id => id !== null);

    // ── 1. IIT MADRAS (Engineering) ──
    const iitIds = findIds([
      "Computer Science", "Electrical", "Mechanical", "Civil", "Chemical", "Aerospace", 
      "Metallurgical", "Naval Architecture", "Biotechnology", "Physics", "Chemistry"
    ], "Engineering");
    await College.updateOne({ collegeName: /IIT Madras/i }, { $set: { coursesOffered: iitIds } });
    console.log("Updated IIT Madras mappings.");

    // ── 2. ANNA UNIVERSITY CEG ──
    const cegIds = findIds([
      "Computer Science", "Information Technology", "Electronics", "Electrical", "Mechanical", "Civil", 
      "Chemical", "Bio Technology", "Printing", "Industrial", "Mining", "Manufacturing", "Material Science"
    ], "Engineering");
    await College.updateOne({ collegeName: /Anna University - CEG/i }, { $set: { coursesOffered: cegIds } });
    console.log("Updated Anna University CEG mappings.");

    // ── 3. MADRAS MEDICAL COLLEGE ──
    const mmcIds = findIds([
      "M.B.B.S.", "Physiotherapy", "Nursing", "Pharmacy", "Laboratory Technology"
    ], "Medical");
    await College.updateOne({ collegeName: /Madras Medical College/i }, { $set: { coursesOffered: mmcIds } });
    console.log("Updated Madras Medical College mappings.");

    // ── 4. LOYOLA COLLEGE ──
    const loyolaIds = [
      ...findIds(["English Literature", "Economics", "Tamil", "Psychology", "Journalism"], "Arts"),
      ...findIds(["Mathematics", "Physics", "Chemistry", "Computer Science", "Visual Communication"], "Science"),
      ...findIds(["General", "Corporate Secretaryship"], "Commerce"),
      ...findIds(["Business Administration"], "Management")
    ];
    await College.updateOne({ collegeName: /Loyola College/i }, { $set: { coursesOffered: loyolaIds } });
    console.log("Updated Loyola College mappings.");

    // ── 5. TNAU COIMBATORE ──
    const tnauIds = findIds([
      "Agriculture", "Horticulture", "Forestry", "Food Technology", "Agricultural Engineering", "Energy and Environmental"
    ], "Agriculture");
    await College.updateOne({ collegeName: /Tamil Nadu Agricultural University/i }, { $set: { coursesOffered: tnauIds } });
    console.log("Updated TNAU mappings.");

    // ── 6. SCHOOL OF EXCELLENCE IN LAW (TNDALU) ──
    const lawIds = findIds([
       "B.A. L.L.B.", "B.B.A. L.L.B.", "B.Com L.L.B."
    ], "Law");
    await College.updateOne({ collegeName: /School of Excellence in Law/i }, { $set: { coursesOffered: lawIds } });
    console.log("Updated TNDALU (SOEL) mappings.");

    console.log("All specific mappings successfully updated.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

runSpecificMapping();
