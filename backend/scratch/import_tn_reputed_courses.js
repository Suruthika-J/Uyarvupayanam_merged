
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("../config/db");
const Course = require("../models/Course");

dotenv.config({ path: path.join(__dirname, "../.env") });

const coursesData = [
  // ── MEDICAL & ALLIED HEALTH ──
  { name: "M.B.B.S.", level: "after12th", category: "Medical", duration: "5.5 Years", eligibility: "12th Pass with Physics, Chemistry, Biology/Botany & Zoology + NEET" },
  { name: "B.D.S. (Dental Surgery)", level: "after12th", category: "Medical", duration: "5 Years", eligibility: "12th Pass with PCB + NEET" },
  { name: "B.A.M.S. (Ayurveda)", level: "after12th", category: "Medical", duration: "5.5 Years", eligibility: "12th Pass with PCB" },
  { name: "B.S.M.S. (Siddha)", level: "after12th", category: "Medical", duration: "5.5 Years", eligibility: "12th Pass with PCB" },
  { name: "B.H.M.S. (Homeopathy)", level: "after12th", category: "Medical", duration: "5.5 Years", eligibility: "12th Pass with PCB" },
  { name: "B.Pharm (Pharmacy)", level: "after12th", category: "Medical", duration: "4 Years", eligibility: "12th Pass with PCB/PCM" },
  { name: "B.P.T. (Physiotherapy)", level: "after12th", category: "Medical", duration: "4.5 Years", eligibility: "12th Pass with PCB" },
  { name: "B.Sc. Nursing", level: "after12th", category: "Medical", duration: "4 Years", eligibility: "12th Pass with PCB" },
  { name: "B.O.T. (Occupational Therapy)", level: "after12th", category: "Medical", duration: "4.5 Years", eligibility: "12th Pass with PCB" },
  { name: "B.Sc. Medical Laboratory Technology", level: "after12th", category: "Medical", duration: "3 Years", eligibility: "12th Pass with PCB" },
  { name: "B.Sc. Radiology & Imaging Technology", level: "after12th", category: "Medical", duration: "3 Years", eligibility: "12th Pass with PCB" },
  { name: "B.Sc. Cardiac Care Technology", level: "after12th", category: "Medical", duration: "3 Years", eligibility: "12th Pass with PCB" },

  // ── ARTS, SCIENCE & COMMERCE (University of Madras / Bharathiar etc.) ──
  { name: "B.A. English Literature", level: "after12th", category: "Arts", duration: "3 Years", eligibility: "12th Pass (Any stream)" },
  { name: "B.A. Economics", level: "after12th", category: "Arts", duration: "3 Years", eligibility: "12th Pass (Any stream)" },
  { name: "B.A. Tamil", level: "after12th", category: "Arts", duration: "3 Years", eligibility: "12th Pass (Any stream)" },
  { name: "B.A. Psychology", level: "after12th", category: "Arts", duration: "3 Years", eligibility: "12th Pass (Any stream)" },
  { name: "B.A. Journalism & Mass Communication", level: "after12th", category: "Arts", duration: "3 Years", eligibility: "12th Pass (Any stream)" },
  
  { name: "B.Sc. Mathematics", level: "after12th", category: "Science", duration: "3 Years", eligibility: "12th Pass with Mathematics" },
  { name: "B.Sc. Physics", level: "after12th", category: "Science", duration: "3 Years", eligibility: "12th Pass with Physics & Maths" },
  { name: "B.Sc. Chemistry", level: "after12th", category: "Science", duration: "3 Years", eligibility: "12th Pass with Chemistry" },
  { name: "B.Sc. Computer Science", level: "after12th", category: "Science", duration: "3 Years", eligibility: "12th Pass with Maths/CS" },
  { name: "B.Sc. Information Technology", level: "after12th", category: "Science", duration: "3 Years", eligibility: "12th Pass with Maths/CS" },
  { name: "B.Sc. Biotechnology", level: "after12th", category: "Science", duration: "3 Years", eligibility: "12th Pass with Biology" },
  { name: "B.Sc. Microbiology", level: "after12th", category: "Science", duration: "3 Years", eligibility: "12th Pass with Biology" },
  { name: "B.Sc. Visual Communication", level: "after12th", category: "Science", duration: "3 Years", eligibility: "12th Pass (Any stream)" },
  
  { name: "B.Com General", level: "after12th", category: "Commerce", duration: "3 Years", eligibility: "12th Pass with Commerce & Accountancy" },
  { name: "B.Com Computer Applications", level: "after12th", category: "Commerce", duration: "3 Years", eligibility: "12th Pass with Commerce & Accountancy" },
  { name: "B.Com Corporate Secretaryship", level: "after12th", category: "Commerce", duration: "3 Years", eligibility: "12th Pass with Commerce & Accountancy" },
  { name: "B.Com Accounting & Finance", level: "after12th", category: "Commerce", duration: "3 Years", eligibility: "12th Pass with Commerce & Accountancy" },
  
  { name: "B.B.A. (Business Administration)", level: "after12th", category: "Management", duration: "3 Years", eligibility: "12th Pass (Any stream)" },
  { name: "B.C.A. (Computer Applications)", level: "after12th", category: "Science", duration: "3 Years", eligibility: "12th Pass with Maths/CS" },

  // ── AGRICULTURE & VETERINARY (TNAU / TANUVAS) ──
  { name: "B.Sc. (Hons) Agriculture", level: "after12th", category: "Agriculture", duration: "4 Years", eligibility: "12th Pass with PCB/PCM" },
  { name: "B.Sc. (Hons) Horticulture", level: "after12th", category: "Agriculture", duration: "4 Years", eligibility: "12th Pass with PCB/PCM" },
  { name: "B.Sc. (Hons) Forestry", level: "after12th", category: "Agriculture", duration: "4 Years", eligibility: "12th Pass with PCB/PCM" },
  { name: "B.V.Sc. & A.H. (Veterinary Science)", level: "after12th", category: "Medical", duration: "5.5 Years", eligibility: "12th Pass with PCB" },
  { name: "B.F.Sc. (Fisheries Science)", level: "after12th", category: "Agriculture", duration: "4 Years", eligibility: "12th Pass with PCB" },

  // ── LAW (TNDALU) ──
  { name: "B.A. L.L.B. (Honours) - Integrated", level: "after12th", category: "Law", duration: "5 Years", eligibility: "12th Pass (Any stream) with min 45%" },
  { name: "B.B.A. L.L.B. (Honours) - Integrated", level: "after12th", category: "Law", duration: "5 Years", eligibility: "12th Pass (Any stream) with min 45%" },
  { name: "B.Com L.L.B. (Honours) - Integrated", level: "after12th", category: "Law", duration: "5 Years", eligibility: "12th Pass with Commerce" }
];

const runImport = async () => {
  try {
    await connectDB();
    console.log("Importing reputable Tamil Nadu courses...");

    let insertedCount = 0;
    for (const c of coursesData) {
      const existing = await Course.findOne({ courseName: c.name, category: c.category });
      if (!existing) {
        await Course.create({
          courseName: c.name,
          level: c.level,
          category: c.category,
          duration: c.duration,
          eligibility: c.eligibility,
          shortDescription: `${c.name} - A reputed undergraduate program offered across various colleges in Tamil Nadu.`,
          status: "active",
          isPublished: true,
          isImported: true
        });
        insertedCount++;
        console.log(`Added: ${c.name}`);
      }
    }

    console.log(`Successfully added ${insertedCount} new reputable courses.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

runImport();
