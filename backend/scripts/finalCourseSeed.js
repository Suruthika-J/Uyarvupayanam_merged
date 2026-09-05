const mongoose = require("mongoose");
const path = require('path');
require("dotenv").config({ path: path.resolve(__dirname, '../.env') });
const Course = require("../models/Course");

const coursesData = [
  // DIPLOMA (Eligibility: 10th or 12th usually, but labeled as After 10th internally for tracking)
  ...[
    "Diploma in Medical Laboratory Technology (DMLT)",
    "Diploma in Patient Care (Nursing)",
    "Diploma in X-Ray and Imaging Technology",
    "Diploma in Physician Assistant",
    "Diploma in Anesthesia Technology",
    "Diploma in Operation Theatre Technology",
    "Diploma in Accident and Emergency Technology",
    "Diploma in Critical Care Management"
  ].map(name => ({
    courseName: name,
    category: "Medical",
    level: "Diploma",
    targetLevel: "After 10th",
    duration: "2 Years",
    eligibility: "10th Pass",
    shortDescription: "A specialized diploma in medical services.",
    sourceName: "Manual"
  })),

  // ARTS -> After 12th
  ...[
    "B.A. Tamil Literature",
    "B.A. English Language & Literature",
    "B.A. English Literature with Computer Applications",
    "B.A. History",
    "B.A. History and Tourism",
    "B.A. History with Civil Services",
    "B.A. Tourism and Travel Management",
    "B.A. Economics",
    "B.A. Economics with Portfolio Management",
    "B.A. Economics with Logistics & Freight Management",
    "B.A. Economics with Insurance & Finance",
    "B.A. Economics with Computer Application",
    "B.A. Economics with Global Business",
    "B.A. Economics with Retailing",
    "B.A. Defence and Strategic Studies"
  ].map(name => ({
    courseName: name,
    category: "Arts & Science",
    level: "After 12th",
    targetLevel: "After 12th",
    duration: "3 Years",
    eligibility: "12th Pass",
    shortDescription: "A comprehensive degree in Arts.",
    sourceName: "Manual"
  })),

  // CERTIFICATION -> After 12th
  ...[
    "Certificate Course in Mushroom Cultivation",
    "Certificate Course in Wheat Grass Production",
    "Certificate Course in Exotic Vegetables and Aromatics"
  ].map(name => ({
    courseName: name,
    category: "Agriculture",
    level: "Certificate",
    targetLevel: "After 12th",
    duration: "6 Months",
    eligibility: "12th Pass",
    shortDescription: "Short term certification for skill development.",
    sourceName: "Manual"
  })),

  // COMMERCE -> After 12th
  ...[
    "B.Com.",
    "B.Com. C.A.",
    "B.Com. E-Commerce",
    "B.Com. Corporate Secretaryship",
    "B.Com. Corporate Secretaryship with C.A.",
    "B.Com. Retail Marketing",
    "B.Com. Information Technology",
    "B.Com. Banking & Insurance",
    "B.Com. Co-operation",
    "B.Com. Co-operative Management",
    "B.Com – PA ( Professional Accounting )",
    "B.Com – with Diploma in Cooperative Management",
    "B.Com International Business",
    "B.Com - Finance",
    "B.Com. Garment Cost Accounting"
  ].map(name => ({
    courseName: name,
    category: "Arts & Science",
    level: "After 12th",
    targetLevel: "After 12th",
    duration: "3 Years",
    eligibility: "12th Pass",
    shortDescription: "A comprehensive degree in Commerce.",
    sourceName: "Manual"
  })),

  // MANAGEMENT -> After 12th
  ...[
    "B.B.A.",
    "B.B.A. with C.A.",
    "B.B.A. International Business",
    "B.B.A. Retail Management",
    "B.B.A. Service Management",
    "B.B.A. Information Systems",
    "B.B.A. Information Management",
    "B.B.A. Banking",
    "B.B.A. Insurance",
    "B.B.A. Marketing Management",
    "B.B.A. Financial Management",
    "B.B.A. Investment"
  ].map(name => ({
    courseName: name,
    category: "Arts & Science",
    level: "After 12th",
    targetLevel: "After 12th",
    duration: "3 Years",
    eligibility: "12th Pass",
    shortDescription: "A professional degree in Management.",
    sourceName: "Manual"
  })),

  // SCIENCE -> After 12th
  ...[
    "B.Sc. Mathematics",
    "B.Sc. Mathematics with CA",
    "B.Sc. Applied Mathematics",
    "B.Sc. Statistics",
    "B.Sc. Physics",
    "B.Sc. Physics with Material Science",
    "B.Sc. Physics with Nano-Technology",
    "B.Sc. Physics with C.A.",
    "B.Sc. Plant Biology and Plant Biotechnology / B.Sc. Botany",
    "B.Sc. Chemistry",
    "B.Sc. Chemistry with Nanotechnology",
    "B.Sc. Industrial Chemistry",
    "B.Sc. Biochemistry",
    "B.Sc. Biochemistry with Nanotechnology",
    "B.Sc. Pharmaceutical Chemistry",
    "B.Sc. Polymer Technology",
    "B.C.A.",
    "B.Sc. Computer Science",
    "B.Sc. Computer Science and Applications",
    "B.Sc. Information Technology",
    "B.Sc. Software Systems",
    "B.Sc. Computer Technology",
    "B.Sc. Multimedia & Web Technology",
    "B.Sc. Clinical Laboratory Technology",
    "B.Sc. Electronics",
    "B.Sc. Electronics & Communication System",
    "B.Sc. Biotechnology",
    "B.Sc. Interior Design",
    "B.Sc. Interior Design with Computer Applications",
    "B.Sc. Microbiology",
    "B.Sc. Microbiology with Nanotechnology",
    "B.Sc. Geography",
    "B.Sc. Advanced Zoology and Biotech with Sericulture",
    "B.Sc. Advanced Zoology and Biotechnology / B.Sc. Zoology",
    "B.Sc. Zoology (Wildlife Biology)",
    "B.Sc. Costume Design and Fashion - Vocational",
    "B.Sc. Costume Design and Fashion",
    "B.Sc. Apparel Fashion Designing",
    "B.Sc. Apparel Manufacturing Merchandising",
    "B.Sc. Fashion Apparel Management",
    "B.Sc. Garment Production Processing / Garment Designing & Production",
    "B.Sc. Nutrition & Dietetics",
    "B.Sc. Food Science & Nutrition / B.Sc. Food Science & Nutrition with CA",
    "B.Sc. Catering Science & Hotel Management",
    "B.Sc. Visual Communication & Electronic Media"
  ].map(name => ({
    courseName: name,
    category: "Arts & Science",
    level: "After 12th",
    targetLevel: "After 12th",
    duration: "3 Years",
    eligibility: "12th Pass",
    shortDescription: "A fundamental degree in Science.",
    sourceName: "Manual"
  })),

  // ENGINEERING -> After 12th
  ...[
    "B.E. Civil Engineering",
    "B.E. Environmental Engineering",
    "B.E. Geoinformatics Engineering",
    "B.E. Agriculture Engineering",
    "B.E. Aeronautical Engineering",
    "B.E. Automobile Engineering",
    "B.E. Mechanical Engineering",
    "B.E. Materials Science and Engineering",
    "B.E. Manufacturing Engineering",
    "B.E. Production Engineering",
    "B.E. Industrial Engineering",
    "B.E. Industrial Engineering and Management",
    "B.E. Marine Engineering",
    "B.E. Mechatronics Engineering",
    "B.E. Mechanical and Automation Engineering",
    "B.E. Robotics and Automation",
    "B.E. Mechanical Engineering (Sandwich)",
    "B.E. Aerospace Engineering (I & II Semesters)",
    "B.E. Electrical and Electronics Engineering",
    "B.E. Electronics and Instrumentation Engineering",
    "B.E. Instrumentation and Control Engineering",
    "B.E. Electronics and Communication Engineering",
    "B.E. Computer Science and Engineering",
    "B.Tech. Information Technology",
    "B.E. Biomedical Engineering",
    "B.E. Medical Electronics",
    "B.E. Computer and Communication Engineering",
    "B.E. Electronics and Telecommunication Engineering",
    "B.Tech. Chemical Engineering",
    "B.Tech. Chemical and Electrochemical Engineering",
    "B.Tech. Petroleum Engineering",
    "B.Tech. Petrochemical Technology",
    "B.E. Petrochemical Engineering",
    "B.Tech. Biotechnology",
    "B.Tech. Pharmaceutical Technology",
    "B.Tech. Food Technology",
    "B.Tech. Polymer Technology",
    "B.Tech. Plastics Technology",
    "B.Tech.Textile Technology",
    "B.Tech. Fashion Technology",
    "B.Tech. Textile Chemistry",
    "B.Tech. Handloom and Textile Technology",
    "B. Arch."
  ].map(name => ({
    courseName: name,
    category: "Engineering",
    level: "After 12th",
    targetLevel: "After 12th",
    duration: "4 Years",
    eligibility: "12th Pass",
    shortDescription: "A professional degree in Engineering.",
    sourceName: "Manual"
  }))
];

async function run() {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/uyarvu_payanam";
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");

    // Clear and re-populate
    await Course.deleteMany({});
    console.log("🗑 Cleared existing courses.");

    const result = await Course.insertMany(coursesData.map(c => ({
       ...c,
       isImported: false,
       isPublished: true,
       status: 'active'
    })));
    
    console.log(`🚀 Successfully imported ${result.length} courses!`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
}

run();
