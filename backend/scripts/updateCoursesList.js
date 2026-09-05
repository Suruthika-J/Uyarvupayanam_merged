const mongoose = require("mongoose");
require("dotenv").config({ path: require('path').resolve(__dirname, '../.env') });
const Course = require("../models/Course");

const coursesData = [
  // MEDICAL -> Diploma
  { courseName: "Diploma in Medical Laboratory Technology (DMLT)" },
  { courseName: "Diploma in Patient Care (Nursing)" },
  { courseName: "Diploma in X-Ray and Imaging Technology" },
  { courseName: "Diploma in Physician Assistant" },
  { courseName: "Diploma in Anesthesia Technology" },
  { courseName: "Diploma in Operation Theatre Technology" },
  { courseName: "Diploma in Accident and Emergency Technology" },
  { courseName: "Diploma in Critical Care Management" }
].map(c => ({
  ...c,
  category: "Medical",
  level: "Diploma",
  targetLevel: "Diploma",
  duration: "2 Years",
  eligibility: "12th Standard Pass",
  shortDescription: "A comprehensive diploma program.",
  sourceName: "Manual",
  isImported: false
}));

const artsData = [
  // ARTS -> After 12th
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
].map(c => ({
  courseName: c,
  category: "Arts",
  level: "After 12th",
  targetLevel: "After 12th",
  duration: "3 Years",
  eligibility: "12th Standard Pass",
  shortDescription: "A comprehensive degree program.",
  sourceName: "Manual",
  isImported: false
}));

const commerceData = [
  // COMMERCE -> After 12th
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
  "B.Com – Professional Accounting",
  "B.Com – with Diploma in Cooperative Management",
  "B.Com International Business",
  "B.Com - Finance",
  "B.Com. Garment Cost Accounting"
].map(c => ({
  courseName: c,
  category: "Commerce",
  level: "After 12th",
  targetLevel: "After 12th",
  duration: "3 Years",
  eligibility: "12th Standard Pass",
  shortDescription: "A comprehensive degree program.",
  sourceName: "Manual",
  isImported: false
}));

const managementData = [
  // MANAGEMENT / BUSINESS -> After 12th
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
].map(c => ({
  courseName: c,
  category: "Management / Business",
  level: "After 12th",
  targetLevel: "After 12th",
  duration: "3 Years",
  eligibility: "12th Standard Pass",
  shortDescription: "A comprehensive degree program.",
  sourceName: "Manual",
  isImported: false
}));

const scienceData = [
  // SCIENCE -> After 12th
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
  "B.Sc. Advanced Zoology and Biotechnology / B.Sc. Zoology",
  "B.Sc. Zoology (Wildlife Biology)",
  "B.Sc. Costume Design and Fashion",
  "B.Sc. Apparel Fashion Designing",
  "B.Sc. Apparel Manufacturing Merchandising",
  "B.Sc. Fashion Apparel Management",
  "B.Sc. Garment Production Processing / Garment Designing & Production",
  "B.Sc. Nutrition & Dietetics",
  "B.Sc. Food Science & Nutrition",
  "B.Sc. Catering Science & Hotel Management",
  "B.Sc. Visual Communication & Electronic Media"
].map(c => ({
  courseName: c,
  category: "Science",
  level: "After 12th",
  targetLevel: "After 12th",
  duration: "3 Years",
  eligibility: "12th Standard Pass",
  shortDescription: "A comprehensive degree program.",
  sourceName: "Manual",
  isImported: false
}));

const engineeringData = [
  // ENGINEERING -> After 12th
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
  "B.Tech. Textile Technology",
  "B.Tech. Fashion Technology",
  "B.Tech. Textile Chemistry",
  "B.Tech. Handloom and Textile Technology",
  "B. Arch"
].map(c => ({
  courseName: c,
  category: "Engineering",
  level: "After 12th",
  targetLevel: "After 12th",
  duration: "4 Years",
  eligibility: "12th Standard Pass",
  shortDescription: "A comprehensive degree program.",
  sourceName: "Manual",
  isImported: false
}));

const agricultureData = [
  // AGRICULTURE -> Certificate
  "Certificate Course in Mushroom Cultivation",
  "Certificate Course in Wheat Grass Production",
  "Certificate Course in Exotic Vegetables and Aromatics"
].map(c => ({
  courseName: c,
  category: "Agriculture",
  level: "Certificate",
  targetLevel: "Certificate",
  duration: "6 Months",
  eligibility: "12th Standard Pass",
  shortDescription: "A comprehensive certificate program.",
  sourceName: "Manual",
  isImported: false
}));

const allCourses = [
  ...coursesData,
  ...artsData,
  ...commerceData,
  ...managementData,
  ...scienceData,
  ...engineeringData,
  ...agricultureData
];

async function run() {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/uyarvu_payanam";
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");

    await Course.deleteMany({});
    console.log("Deleted all existing courses");

    for (const c of allCourses) {
      const course = new Course(c);
      await course.save();
    }
    
    console.log(`Inserted ${allCourses.length} courses successfully.`);
    process.exit(0);
  } catch (error) {
    console.error("Error updating courses:", error.message);
    if(error.code) console.error("Error code:", error.code);
    if(error.keyPattern) console.error("Key pattern:", error.keyPattern);
    if(error.keyValue) console.error("Key value:", error.keyValue);
    process.exit(1);
  }
}

run();
