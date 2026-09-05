/**
 * seedScholarshipsClean.js
 *
 * Seeds accurate, stage-based Tamil Nadu scholarships into the database.
 * All data is filtered for school students (Class 5 / 8 / 10 / 12).
 * grades & targetClass use ONLY "Xth" format: "5th", "8th", "10th", "12th"
 *
 * Usage: node scripts/seedScholarshipsClean.js
 */

const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const Scholarship = require("../models/Scholarship");

// ═══════════════════════════════════════════════════════════════════════
// 🎯 AFTER 5th STANDARD
// ═══════════════════════════════════════════════════════════════════════
const after5th = [
  {
    scholarshipName: "Pre-Matric Scholarship for SC Students",
    provider: "TN Adi Dravidar Welfare Department",
    description: "Monthly scholarship for Scheduled Caste students studying in Classes 1 to 10. Covers maintenance allowance and books.",
    benefit: "₹100–₹150 per month + Book allowance",
    grades: ["5th"],
    targetClass: ["5th"],
    category: "Government",
    eligibility: "SC students in Classes 1–10, family income below ₹2.5 lakh/year",
    applicationLink: "https://www.scholarships.gov.in/",
    stepsToApply: [
      "Collect application form from school",
      "Submit community certificate & income certificate",
      "School forwards application to District Adi Dravidar Welfare Office",
      "Scholarship credited to student's bank account"
    ],
    deadline: "October every year",
    status: "published"
  },
  {
    scholarshipName: "Pre-Matric Scholarship for ST Students",
    provider: "TN Tribal Welfare Department",
    description: "Scholarship for Scheduled Tribe students to support their education from primary to high school level.",
    benefit: "Tuition fees + ₹150/month maintenance allowance",
    grades: ["5th"],
    targetClass: ["5th"],
    category: "Government",
    eligibility: "ST students in Classes 1–10, family income below ₹2.5 lakh/year",
    applicationLink: "https://www.scholarships.gov.in/",
    stepsToApply: [
      "Obtain application from school headmaster",
      "Attach community & income certificates",
      "School submits to Tribal Welfare Officer",
      "Amount disbursed through DBT"
    ],
    deadline: "October every year",
    status: "published"
  },
  {
    scholarshipName: "Pre-Matric Scholarship for Minority Students",
    provider: "Ministry of Minority Affairs (Central Govt via NSP)",
    description: "Central Government scholarship for minority community students (Muslim, Christian, Sikh, Buddhist, Jain, Parsi) studying in Classes 1–10.",
    benefit: "₹1,000–₹5,000 per year",
    grades: ["5th"],
    targetClass: ["5th"],
    category: "NSP",
    eligibility: "Minority community students, family income below ₹1 lakh/year, minimum 50% marks",
    applicationLink: "https://scholarships.gov.in/",
    stepsToApply: [
      "Register on National Scholarship Portal (NSP)",
      "Fill online application with Aadhaar verification",
      "Upload income certificate & community certificate",
      "Institute verifies and forwards to district authority"
    ],
    deadline: "November every year",
    status: "published"
  },
  {
    scholarshipName: "Differently Abled Students Scholarship (Primary)",
    provider: "TN Differently Abled Persons Welfare Department",
    description: "Monthly scholarship for differently abled students studying in Classes 1 to 8 in Tamil Nadu.",
    benefit: "₹100–₹300 per month",
    grades: ["5th"],
    targetClass: ["5th"],
    category: "Government",
    eligibility: "Students with 40%+ disability, enrolled in recognized school, valid disability certificate",
    applicationLink: "https://www.tnesevai.tn.gov.in/",
    stepsToApply: [
      "Obtain disability certificate from Government Hospital",
      "Apply through e-Sevai center or school",
      "Submit disability certificate & Aadhaar",
      "Amount credited monthly via DBT"
    ],
    deadline: "Rolling / School admission time",
    status: "published"
  },
  {
    scholarshipName: "MBC/DNC Girl Students Incentive Scheme",
    provider: "TN BC/MBC Welfare Department",
    description: "Special incentive for girl students from MBC/DNC communities studying in rural government schools to prevent dropout.",
    benefit: "₹500–₹1,000 per year",
    grades: ["5th"],
    targetClass: ["5th"],
    category: "State Schemes",
    eligibility: "Girl students from MBC/DNC communities in Classes 3–6, studying in rural government schools",
    applicationLink: "https://www.bcmbcmw.tn.gov.in/",
    stepsToApply: [
      "School identifies eligible girl students",
      "Community & income certificates submitted",
      "Application forwarded through school to BC/MBC Welfare Department",
      "Incentive amount disbursed to student's account"
    ],
    deadline: "August every year",
    status: "published"
  }
];

// ═══════════════════════════════════════════════════════════════════════
// 🎯 AFTER 8th STANDARD
// ═══════════════════════════════════════════════════════════════════════
const after8th = [
  {
    scholarshipName: "NMMS – National Means-cum-Merit Scholarship",
    provider: "Ministry of Education (Central Govt)",
    description: "National level merit-cum-means scholarship for Class 8 students. Selected students receive ₹12,000/year from Class 9 to 12. Requires clearing a state-level exam (MAT + SAT).",
    benefit: "₹12,000 per year (Class 9 to 12)",
    grades: ["8th"],
    targetClass: ["8th"],
    category: "Merit",
    eligibility: "Class 8 students in government/government-aided schools, family income ≤ ₹3.5 lakh/year, minimum 55% in Class 7",
    applicationLink: "https://scholarships.gov.in/",
    stepsToApply: [
      "School nominates eligible students for NMMS exam",
      "Students appear for MAT + SAT conducted by SCERT",
      "Qualified students apply on NSP portal",
      "Scholarship disbursed for Class 9–12 on renewal"
    ],
    deadline: "Exam in November, Application by January",
    status: "published"
  },
  {
    scholarshipName: "Pre-Matric Scholarship for SC/ST (Class 6–10)",
    provider: "TN Adi Dravidar & Tribal Welfare Department",
    description: "Continuation of pre-matric scholarship for SC/ST students in Classes 6–10 with enhanced monthly stipend.",
    benefit: "₹150–₹350 per month + ad-hoc grant for books",
    grades: ["8th"],
    targetClass: ["8th"],
    category: "Government",
    eligibility: "SC/ST students in Classes 6–10, family income below ₹2.5 lakh/year",
    applicationLink: "https://www.scholarships.gov.in/",
    stepsToApply: [
      "Submit application through school",
      "Attach community certificate, income certificate, Aadhaar",
      "School forwards to District Welfare Office",
      "Amount disbursed monthly via DBT"
    ],
    deadline: "October every year",
    status: "published"
  },
  {
    scholarshipName: "Pre-Matric Minority Scholarship (Class 6–10)",
    provider: "Ministry of Minority Affairs (Central Govt via NSP)",
    description: "Central scholarship for minority students in upper primary and secondary level to reduce dropout rates.",
    benefit: "₹5,000 per year",
    grades: ["8th"],
    targetClass: ["8th"],
    category: "NSP",
    eligibility: "Minority community students in Classes 6–10, family income ≤ ₹1 lakh/year, 50%+ marks",
    applicationLink: "https://scholarships.gov.in/",
    stepsToApply: [
      "Register on National Scholarship Portal",
      "Complete Aadhaar-verified application",
      "Upload income & community certificates",
      "Institute verifies, scholarship credited on approval"
    ],
    deadline: "November every year",
    status: "published"
  },
  {
    scholarshipName: "Differently Abled Students Scholarship (Middle School)",
    provider: "TN Differently Abled Persons Welfare Department",
    description: "Enhanced monthly scholarship for differently abled students in Classes 6–8.",
    benefit: "₹300 per month",
    grades: ["8th"],
    targetClass: ["8th"],
    category: "Government",
    eligibility: "Students with 40%+ disability, valid UDID card or disability certificate, enrolled in recognized school",
    applicationLink: "https://www.tnesevai.tn.gov.in/",
    stepsToApply: [
      "Obtain UDID card / disability certificate",
      "Apply at e-Sevai center with school bonafide",
      "District Differently Abled Welfare Officer verifies",
      "Monthly stipend credited via DBT"
    ],
    deadline: "Rolling / School admission time",
    status: "published"
  }
];

// ═══════════════════════════════════════════════════════════════════════
// 🎯 AFTER 10th STANDARD
// ═══════════════════════════════════════════════════════════════════════
const after10th = [
  {
    scholarshipName: "Post-Matric Scholarship for SC Students",
    provider: "TN Adi Dravidar Welfare Department",
    description: "Full scholarship for SC students pursuing Class 11, 12, Diploma, UG, or PG. Covers tuition fee, maintenance allowance, and special allowance for books.",
    benefit: "Full tuition fee + ₹230–₹1,200/month maintenance stipend",
    grades: ["10th"],
    targetClass: ["10th"],
    category: "Government",
    eligibility: "SC students who passed 10th, family income ≤ ₹2.5 lakh/year",
    applicationLink: "https://www.scholarships.gov.in/",
    stepsToApply: [
      "Enroll in Class 11 / Diploma / UG course",
      "Apply through college/school with community & income certificates",
      "Institution forwards to Adi Dravidar Welfare Department",
      "Tuition fees paid to institution, stipend to student's bank account"
    ],
    deadline: "October every year",
    status: "published"
  },
  {
    scholarshipName: "Post-Matric Scholarship for ST Students",
    provider: "TN Tribal Welfare Department",
    description: "Comprehensive scholarship for ST students after 10th covering higher secondary and undergraduate education.",
    benefit: "₹230–₹1,200 per month + full tuition fee waiver",
    grades: ["10th"],
    targetClass: ["10th"],
    category: "Government",
    eligibility: "ST students who passed 10th, family income ≤ ₹2.5 lakh/year",
    applicationLink: "https://www.scholarships.gov.in/",
    stepsToApply: [
      "Join Class 11 / higher education institution",
      "Apply through institution with ST community certificate",
      "Tribal Welfare Officer processes application",
      "Fees reimbursed to institution, maintenance to student"
    ],
    deadline: "October every year",
    status: "published"
  },
  {
    scholarshipName: "BC/MBC/DNC Scholarship (Post-Matric)",
    provider: "TN BC, MBC & Minorities Welfare Department",
    description: "Tuition fee scholarship for BC/MBC/DNC students pursuing education after 10th standard in Tamil Nadu.",
    benefit: "Full tuition fee reimbursement",
    grades: ["10th"],
    targetClass: ["10th"],
    category: "Government",
    eligibility: "BC/MBC/DNC students, family income ≤ ₹2 lakh/year (BC) or ₹1 lakh/year (MBC/DNC)",
    applicationLink: "https://www.bcmbcmw.tn.gov.in/",
    stepsToApply: [
      "Apply through e-Sevai or institution",
      "Submit community certificate, income certificate, 10th mark sheet",
      "BC/MBC Welfare Department verifies eligibility",
      "Tuition fee paid directly to institution"
    ],
    deadline: "September–October every year",
    status: "published"
  },
  {
    scholarshipName: "Post-Matric Scholarship for Minorities",
    provider: "Ministry of Minority Affairs (Central Govt via NSP)",
    description: "Central Government post-matric scholarship for minority community students pursuing Class 11 and above.",
    benefit: "₹10,000+ per year (varies by course level)",
    grades: ["10th"],
    targetClass: ["10th"],
    category: "NSP",
    eligibility: "Minority community students, family income ≤ ₹2 lakh/year, 50%+ marks in previous exam",
    applicationLink: "https://scholarships.gov.in/",
    stepsToApply: [
      "Register on NSP portal after passing 10th",
      "Fill application with course & institution details",
      "Upload income, community, Aadhaar, mark sheet",
      "Institute verifies, scholarship disbursed on approval"
    ],
    deadline: "November every year",
    status: "published"
  },
  {
    scholarshipName: "Differently Abled Scholarship (Post-Matric)",
    provider: "TN Differently Abled Persons Welfare Department",
    description: "Annual scholarship for differently abled students pursuing education after 10th standard.",
    benefit: "₹7,000 per year",
    grades: ["10th"],
    targetClass: ["10th"],
    category: "Government",
    eligibility: "Students with 40%+ disability, passed 10th, valid UDID card",
    applicationLink: "https://www.tnesevai.tn.gov.in/",
    stepsToApply: [
      "Apply at e-Sevai center after joining 11th/Diploma",
      "Submit UDID card, 10th mark sheet, school bonafide",
      "District Officer verifies and approves",
      "Amount credited annually via DBT"
    ],
    deadline: "Rolling / upon admission",
    status: "published"
  },
  {
    scholarshipName: "Thanthai Periyar Award (Diploma Students)",
    provider: "TN BC, MBC & Minorities Welfare Department",
    description: "Annual award for BC/MBC students pursuing polytechnic diploma courses in Tamil Nadu.",
    benefit: "₹3,000 per year",
    grades: ["10th"],
    targetClass: ["10th"],
    category: "State Schemes",
    eligibility: "BC/MBC students admitted to government polytechnic colleges",
    applicationLink: "https://www.bcmbcmw.tn.gov.in/",
    stepsToApply: [
      "Join a government polytechnic after 10th",
      "Apply through institution or District BC/MBC Office",
      "Submit community certificate and admission details",
      "Award amount credited to student account"
    ],
    deadline: "As per academic calendar",
    status: "published"
  },
  {
    scholarshipName: "Vidyadhan Scholarship (Class 11–12)",
    provider: "Sarojini Damodaran Foundation (Private)",
    description: "Merit-cum-means scholarship for students from low-income families who scored well in 10th board exams. Supports Class 11–12 education.",
    benefit: "₹6,000 per year",
    grades: ["10th"],
    targetClass: ["10th"],
    category: "Others",
    eligibility: "Students who scored 80%+ in 10th, family income ≤ ₹2 lakh/year",
    applicationLink: "https://www.vidyadhan.org/",
    stepsToApply: [
      "Visit vidyadhan.org after 10th results",
      "Register and fill the online application",
      "Upload 10th mark sheet and income proof",
      "Selected students receive scholarship after verification"
    ],
    deadline: "June–July (after 10th results)",
    status: "published"
  }
];

// ═══════════════════════════════════════════════════════════════════════
// 🎯 AFTER 12th STANDARD
// ═══════════════════════════════════════════════════════════════════════
const after12th = [
  {
    scholarshipName: "Post-Matric SC Scholarship (UG/PG)",
    provider: "TN Adi Dravidar Welfare Department",
    description: "Comprehensive scholarship for SC students pursuing undergraduate and postgraduate courses. Covers full tuition and living expenses.",
    benefit: "Full tuition fee + maintenance stipend",
    grades: ["12th"],
    targetClass: ["12th"],
    category: "Government",
    eligibility: "SC students who passed 12th, family income ≤ ₹2.5 lakh/year, admitted to recognized institution",
    applicationLink: "https://www.scholarships.gov.in/",
    stepsToApply: [
      "Get admitted to UG/PG program",
      "Apply through college with community & income certificates",
      "College forwards to Adi Dravidar Welfare Department",
      "Fee paid to college, stipend to student account"
    ],
    deadline: "October every year",
    status: "published"
  },
  {
    scholarshipName: "Post-Matric ST Scholarship (UG/PG)",
    provider: "TN Tribal Welfare Department",
    description: "Full support scholarship for ST students in UG/PG programs covering fees and monthly maintenance.",
    benefit: "Full fee reimbursement + monthly stipend",
    grades: ["12th"],
    targetClass: ["12th"],
    category: "Government",
    eligibility: "ST students who passed 12th, family income ≤ ₹2.5 lakh/year",
    applicationLink: "https://www.scholarships.gov.in/",
    stepsToApply: [
      "Secure admission in UG/PG course",
      "Apply with ST community certificate & income proof",
      "Tribal Welfare Department processes claim",
      "Fees reimbursed, maintenance disbursed monthly"
    ],
    deadline: "October every year",
    status: "published"
  },
  {
    scholarshipName: "BC/MBC/DNC Scholarship (UG/PG)",
    provider: "TN BC, MBC & Minorities Welfare Department",
    description: "Tuition fee scholarship for BC/MBC/DNC students pursuing higher education after 12th in Tamil Nadu.",
    benefit: "Full tuition fee reimbursement",
    grades: ["12th"],
    targetClass: ["12th"],
    category: "Government",
    eligibility: "BC/MBC/DNC students, family income ≤ ₹2 lakh (BC) or ₹1 lakh (MBC/DNC), admitted to recognized college",
    applicationLink: "https://www.bcmbcmw.tn.gov.in/",
    stepsToApply: [
      "Apply via e-Sevai or college portal",
      "Submit community certificate, income certificate, 12th mark sheet",
      "Department verifies eligibility",
      "Tuition fee reimbursed to institution"
    ],
    deadline: "September–October every year",
    status: "published"
  },
  {
    scholarshipName: "Central Sector Scholarship for College Students",
    provider: "Ministry of Education (Central Govt)",
    description: "Merit-based central scholarship for students who are in the top 20th percentile of their 12th board exam. Not restricted to any caste or community.",
    benefit: "₹10,000/year (UG) and ₹20,000/year (PG)",
    grades: ["12th"],
    targetClass: ["12th"],
    category: "Merit",
    eligibility: "Students in top 20th percentile of 12th board, family income ≤ ₹8 lakh/year",
    applicationLink: "https://scholarships.gov.in/",
    stepsToApply: [
      "Check eligibility cutoff for your state board",
      "Register on NSP portal after 12th results",
      "Fill application with 12th mark sheet & income proof",
      "Institute verifies, scholarship renewed annually on merit"
    ],
    deadline: "October–November every year",
    status: "published"
  },
  {
    scholarshipName: "AICTE Pragati Scholarship (for Girls)",
    provider: "AICTE (All India Council for Technical Education)",
    description: "Special scholarship for girl students admitted to AICTE-approved diploma/degree programs in engineering and technology. Only 2 girls per family eligible.",
    benefit: "₹50,000 per year (up to 4 years)",
    grades: ["12th"],
    targetClass: ["12th"],
    category: "Merit",
    eligibility: "Girl students admitted to AICTE-approved technical courses, family income ≤ ₹8 lakh/year",
    applicationLink: "https://scholarships.gov.in/",
    stepsToApply: [
      "Get admitted to AICTE-approved engineering/diploma program",
      "Apply on NSP portal with admission proof",
      "Upload 12th mark sheet, income certificate, Aadhaar",
      "AICTE verifies and disburses scholarship"
    ],
    deadline: "October–November every year",
    status: "published"
  },
  {
    scholarshipName: "AICTE Saksham Scholarship (Differently Abled)",
    provider: "AICTE (All India Council for Technical Education)",
    description: "Scholarship for differently abled students pursuing technical/professional courses at AICTE-approved institutions.",
    benefit: "₹50,000 per year",
    grades: ["12th"],
    targetClass: ["12th"],
    category: "Merit",
    eligibility: "Students with 40%+ disability, admitted to AICTE-approved technical course, family income ≤ ₹8 lakh/year",
    applicationLink: "https://scholarships.gov.in/",
    stepsToApply: [
      "Secure admission in AICTE-approved institution",
      "Apply on NSP with UDID card & admission details",
      "Submit disability certificate, income proof, 12th mark sheet",
      "Scholarship disbursed after AICTE verification"
    ],
    deadline: "October–November every year",
    status: "published"
  },
  {
    scholarshipName: "Vidyadhan Scholarship (UG)",
    provider: "Sarojini Damodaran Foundation (Private)",
    description: "Merit-cum-means scholarship for students from low-income families pursuing undergraduate education. Supports engineering, arts, science, and commerce courses.",
    benefit: "₹10,000–₹60,000 per year (based on course)",
    grades: ["12th"],
    targetClass: ["12th"],
    category: "Others",
    eligibility: "Students who scored well in 12th, family income ≤ ₹2 lakh/year",
    applicationLink: "https://www.vidyadhan.org/",
    stepsToApply: [
      "Visit vidyadhan.org after 12th results",
      "Register and fill online scholarship application",
      "Upload 12th mark sheet and income documents",
      "Attend interview if shortlisted, scholarship awarded"
    ],
    deadline: "June–July (after 12th results)",
    status: "published"
  },
  {
    scholarshipName: "Perarignar Anna Memorial Award",
    provider: "TN BC, MBC & Minorities Welfare Department",
    description: "Annual award for meritorious BC/MBC students pursuing UG courses in Tamil Nadu government or aided colleges.",
    benefit: "₹3,000 per year",
    grades: ["12th"],
    targetClass: ["12th"],
    category: "State Schemes",
    eligibility: "BC/MBC students admitted to government/aided UG colleges in TN",
    applicationLink: "https://www.bcmbcmw.tn.gov.in/",
    stepsToApply: [
      "Enroll in government/aided college for UG",
      "Apply through college or District BC/MBC Welfare Office",
      "Submit community certificate & admission details",
      "Award disbursed to student's bank account"
    ],
    deadline: "As per academic calendar",
    status: "published"
  },
  {
    scholarshipName: "Pudhumai Penn Scheme",
    provider: "Government of Tamil Nadu",
    description: "Flagship TN Government scheme providing monthly financial support to girl students who studied in government schools and are pursuing higher education after 12th. Direct Benefit Transfer to student's account.",
    benefit: "₹1,000 per month throughout UG course",
    grades: ["12th"],
    targetClass: ["12th"],
    category: "State Schemes",
    eligibility: "Girl students who completed 6th to 12th in TN government schools, admitted to any higher education course",
    applicationLink: "https://penkalvi.tn.gov.in/",
    stepsToApply: [
      "Must have studied 6th–12th in TN Government school",
      "Get admitted to any recognized college/university",
      "Apply on Pudhumai Penn portal with school & college details",
      "₹1,000/month credited directly to student's bank account"
    ],
    deadline: "Upon college admission (rolling)",
    status: "published"
  }
];

// ═══════════════════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════════
async function seedScholarships() {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error("❌ ERROR: MONGO_URI not found in .env");
      process.exit(1);
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB\n");

    // Clear existing scholarships
    const deleteResult = await Scholarship.deleteMany({});
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing scholarships\n`);

    const allScholarships = [
      ...after5th,
      ...after8th,
      ...after10th,
      ...after12th
    ];

    console.log(`📝 Inserting ${allScholarships.length} clean, verified scholarships...\n`);

    let inserted = 0;
    let failed = 0;

    for (const s of allScholarships) {
      try {
        await Scholarship.create(s);
        console.log(`  ✅ ${s.scholarshipName} → grades: [${s.grades}] targetClass: [${s.targetClass}]`);
        inserted++;
      } catch (err) {
        if (err.code === 11000) {
          console.log(`  ⏭️  Duplicate skipped: ${s.scholarshipName}`);
        } else {
          console.error(`  ❌ Failed: ${s.scholarshipName} — ${err.message}`);
          failed++;
        }
      }
    }

    // Summary
    console.log("\n" + "═".repeat(55));
    console.log("📊 SCHOLARSHIP SEED SUMMARY");
    console.log("═".repeat(55));
    console.log(`  After 5th  : ${after5th.length} scholarships`);
    console.log(`  After 8th  : ${after8th.length} scholarships`);
    console.log(`  After 10th : ${after10th.length} scholarships`);
    console.log(`  After 12th : ${after12th.length} scholarships`);
    console.log(`  ──────────────────────────`);
    console.log(`  Total      : ${allScholarships.length}`);
    console.log(`  Inserted   : ${inserted}`);
    console.log(`  Failed     : ${failed}`);
    console.log("═".repeat(55));

    console.log("\n✅ Scholarship seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ FATAL ERROR:", error);
    process.exit(1);
  }
}

seedScholarships();
