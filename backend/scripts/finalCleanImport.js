const mongoose = require("mongoose");
const path = require('path');
require("dotenv").config({ path: path.resolve(__dirname, '../.env') });
const Course = require("../models/Course");

const coursesData = [
  // MEDICAL (DIPLOMA)
  "Diploma in Medical Laboratory Technology (DMLT) | Diploma | Medical | 2 Years | AICTE/College",
  "Diploma in Patient Care (Nursing) | Diploma | Medical | 2 Years | College",
  "Diploma in X-Ray and Imaging Technology | Diploma | Medical | 2 Years | College",
  "Diploma in Physician Assistant | Diploma | Medical | 2 Years | College",
  "Diploma in Anesthesia Technology | Diploma | Medical | 2 Years | College",
  "Diploma in Operation Theatre Technology | Diploma | Medical | 2 Years | College",
  "Diploma in Accident and Emergency Technology | Diploma | Medical | 2 Years | College",
  "Diploma in Critical Care Management | Diploma | Medical | 2 Years | College",

  // ARTS (AFTER 12TH)
  "B.A. Tamil Literature | After 12th | Arts | 3 Years | UGC",
  "B.A. English Language & Literature | After 12th | Arts | 3 Years | UGC",
  "B.A. English Literature with Computer Applications | After 12th | Arts | 3 Years | UGC",
  "B.A. History | After 12th | Arts | 3 Years | UGC",
  "B.A. History and Tourism | After 12th | Arts | 3 Years | UGC",
  "B.A. History with Civil Services | After 12th | Arts | 3 Years | UGC",
  "B.A. Tourism and Travel Management | After 12th | Arts | 3 Years | UGC",
  "B.A. Economics | After 12th | Arts | 3 Years | UGC",
  "B.A. Economics with Portfolio Management | After 12th | Arts | 3 Years | UGC",
  "B.A. Economics with Logistics & Freight Management | After 12th | Arts | 3 Years | UGC",
  "B.A. Economics with Insurance & Finance | After 12th | Arts | 3 Years | UGC",
  "B.A. Economics with Computer Application | After 12th | Arts | 3 Years | UGC",
  "B.A. Economics with Global Business | After 12th | Arts | 3 Years | UGC",
  "B.A. Economics with Retailing | After 12th | Arts | 3 Years | UGC",
  "B.A. Defence and Strategic Studies | After 12th | Arts | 3 Years | UGC",

  // CERTIFICATE (AGRICULTURE)
  "Certificate Course in Mushroom Cultivation | Certificate | Agriculture | 6 Months | Govt Agriculture Dept",
  "Certificate Course in Wheat Grass Production | Certificate | Agriculture | 6 Months | Govt Agriculture Dept",
  "Certificate Course in Exotic Vegetables and Aromatics | Certificate | Agriculture | 6 Months | Govt Agriculture Dept",

  // COMMERCE (AFTER 12TH)
  "B.Com. | After 12th | Commerce | 3 Years | UGC",
  "B.Com. C.A. | After 12th | Commerce | 3 Years | UGC",
  "B.Com. E-Commerce | After 12th | Commerce | 3 Years | UGC",
  "B.Com. Corporate Secretaryship | After 12th | Commerce | 3 Years | UGC",
  "B.Com. Corporate Secretaryship with C.A. | After 12th | Commerce | 3 Years | UGC",
  "B.Com. Retail Marketing | After 12th | Commerce | 3 Years | UGC",
  "B.Com. Information Technology | After 12th | Commerce | 3 Years | UGC",
  "B.Com. Banking & Insurance | After 12th | Commerce | 3 Years | UGC",
  "B.Com. Co-operation | After 12th | Commerce | 3 Years | UGC",
  "B.Com. Co-operative Management | After 12th | Commerce | 3 Years | UGC",
  "B.Com – Professional Accounting | After 12th | Commerce | 3 Years | UGC",
  "B.Com – with Diploma in Cooperative Management | After 12th | Commerce | 3 Years | UGC",
  "B.Com International Business | After 12th | Commerce | 3 Years | UGC",
  "B.Com - Finance | After 12th | Commerce | 3 Years | UGC",
  "B.Com. Garment Cost Accounting | After 12th | Commerce | 3 Years | UGC",

  // MANAGEMENT (AFTER 12TH)
  "B.B.A. | After 12th | Management | 3 Years | UGC",
  "B.B.A. with C.A. | After 12th | Management | 3 Years | UGC",
  "B.B.A. International Business | After 12th | Management | 3 Years | UGC",
  "B.B.A. Retail Management | After 12th | Management | 3 Years | UGC",
  "B.B.A. Service Management | After 12th | Management | 3 Years | UGC",
  "B.B.A. Information Systems | After 12th | Management | 3 Years | UGC",
  "B.B.A. Information Management | After 12th | Management | 3 Years | UGC",
  "B.B.A. Banking | After 12th | Management | 3 Years | UGC",
  "B.B.A. Insurance | After 12th | Management | 3 Years | UGC",
  "B.B.A. Marketing Management | After 12th | Management | 3 Years | UGC",
  "B.B.A. Financial Management | After 12th | Management | 3 Years | UGC",
  "B.B.A. Investment | After 12th | Management | 3 Years | UGC",

  // SCIENCE (AFTER 12TH)
  "B.Sc. Mathematics | After 12th | Science | 3 Years | UGC",
  "B.Sc. Physics | After 12th | Science | 3 Years | UGC",
  "B.Sc. Chemistry | After 12th | Science | 3 Years | UGC",
  "B.Sc. Computer Science | After 12th | IT & Computer | 3 Years | UGC",
  "B.C.A. | After 12th | IT & Computer | 3 Years | UGC",
  "B.Sc. Biotechnology | After 12th | Science | 3 Years | UGC",
  "B.Sc. Microbiology | After 12th | Science | 3 Years | UGC",
  "B.Sc. Nutrition & Dietetics | After 12th | Medical | 3 Years | UGC",
  "B.Sc. Catering Science & Hotel Management | After 12th | Hotel Management | 3 Years | UGC",
  "B.Sc. Visual Communication & Electronic Media | After 12th | Media & Journalism | 3 Years | UGC",

  // ENGINEERING (AFTER 12TH)
  "B.E. Civil Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Environmental Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Geoinformatics Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Agriculture Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Aeronautical Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Automobile Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Mechanical Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Materials Science and Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Manufacturing Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Production Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Industrial Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Industrial Engineering and Management | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Marine Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Mechatronics Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Mechanical and Automation Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Robotics and Automation | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Mechanical Engineering (Sandwich) | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Aerospace Engineering (I & II Semesters) | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Electrical and Electronics Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Electronics and Instrumentation Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Instrumentation and Control Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Electronics and Communication Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Computer Science and Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.Tech. Information Technology | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Biomedical Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Medical Electronics | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Computer and Communication Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Electronics and Telecommunication Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.Tech. Chemical Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.Tech. Chemical and Electrochemical Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.Tech. Petroleum Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.Tech. Petrochemical Technology | After 12th | Engineering | 4 Years | AICTE",
  "B.E. Petrochemical Engineering | After 12th | Engineering | 4 Years | AICTE",
  "B.Tech. Biotechnology | After 12th | Engineering | 4 Years | AICTE",
  "B.Tech. Pharmaceutical Technology | After 12th | Engineering | 4 Years | AICTE",
  "B.Tech. Food Technology | After 12th | Engineering | 4 Years | AICTE",
  "B.Tech. Polymer Technology | After 12th | Engineering | 4 Years | AICTE",
  "B.Tech. Plastics Technology | After 12th | Engineering | 4 Years | AICTE",
  "B.Tech. Textile Technology | After 12th | Engineering | 4 Years | AICTE",
  "B.Tech. Fashion Technology | After 12th | Engineering | 4 Years | AICTE",
  "B.Tech. Textile Chemistry | After 12th | Engineering | 4 Years | AICTE",
  "B.Tech. Handloom and Textile Technology | After 12th | Engineering | 4 Years | AICTE",
  "B. Arch | After 12th | Architecture | 5 Years | COA"
];

async function run() {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/uyarvu_payanam";
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");

    // Clear existing
    await Course.deleteMany({});
    console.log("🗑 Cleared old data.");

    const processed = coursesData.map(line => {
      const [name, type, category, duration, source] = line.split('|').map(s => s.trim());
      
      // Determine targetLevel for student portal mapping
      let targetLevel = "After 12th";
      let eligibility = "12th Pass";
      
      if (type === "Diploma") {
         targetLevel = "After 10th"; // For Class 10/12 guidance mapping
         eligibility = "10th Pass";
      }

      return {
        courseName: name,
        level: type,       // After 12th / Diploma / Certificate
        targetLevel,       // Mapping to Student Portal Class Level
        category,          // Professional category
        duration,
        sourceName: source,
        eligibility,
        shortDescription: `${name} - Professional ${type} course.`,
        isImported: false,
        isPublished: true,
        status: 'active'
      };
    });

    const result = await Course.insertMany(processed);
    console.log(`🚀 Successfully inserted ${result.length} cleaned courses!`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
}

run();
