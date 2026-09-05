
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("../config/db");
const Scholarship = require("../models/Scholarship");

dotenv.config({ path: path.join(__dirname, "../.env") });

const scholarshipsToUpdate = [
  {
    name: "NMMS (National Means cum Merit Scholarship)",
    provider: "Ministry of Education / Govt of Tamil Nadu",
    grades: ["8th"],
    category: "Government",
    benefit: "₹12,000 per year from Class 9 to 12.",
    eligibility: "Students studying in 8th standard in Government/Govt-Aided schools. Parental income must be less than ₹3.5 Lakhs per year. Must have scored 55% in 7th standard.",
    stepsToApply: [
      "Notify your Class Teacher or Headmaster about interest in NMMS.",
      "Submit Income Certificate, Community Certificate, and previous year marksheet (7th std) to school office.",
      "School Headmaster will upload candidate details on the DGE (Directorate of Govt Examinations) website.",
      "Receive the Hall Ticket from the school in February.",
      "Appear for the NMMS examination (Mental Ability Test and Scholastic Aptitude Test)."
    ],
    applicationLink: "https://dge.tn.gov.in"
  },
  {
    name: "TRUSTS (Tamil Nadu Rural Students Talent Search Examination)",
    provider: "Directorate of Government Examinations, TN",
    grades: ["8th", "9th"],
    category: "Government",
    benefit: "₹1,000 per year for 4 years.",
    eligibility: "Rural students studying in 9th standard in Govt/Aided schools. Parental income should not exceed ₹1 Lakh. Only students from non-urban areas are eligible.",
    stepsToApply: [
      "Contact your school HM when the circular is released (usually Sept/Oct).",
      "Fill the application form provided by the school.",
      "Pay a nominal exam fee to the school office.",
      "Prepare for the exam which includes Mathematics, Science, and Social Science from the TN State Board syllabus.",
      "Pass the district-level merit list to receive the scholarship."
    ],
    applicationLink: "https://dge.tn.gov.in"
  },
  {
    name: "NTSE (National Talent Search Examination)",
    provider: "NCERT",
    grades: ["10th"],
    category: "Merit",
    benefit: "₹1,250/month for XI-XII; ₹2,000/month for UG/PG.",
    eligibility: "Students studying in Class 10 in any recognized school. High academic competence required.",
    stepsToApply: [
      "Apply through the school when the notification is out (usually August).",
      "Stage 1 is conducted by state level (DGE in TN). Stage 2 is national (NCERT).",
      "Submit the application with attested copies of marksheet and community certificate to the HM.",
      "Clear Stage 1 to become eligible for the National Level exam.",
      "Final selection is based on national ranking."
    ],
    applicationLink: "https://ncert.nic.in"
  },
  {
    name: "Pudhumai Penn Scheme",
    provider: "Govt of Tamil Nadu",
    grades: ["12th"],
    category: "State Schemes",
    benefit: "₹1,000 per month directly into bank account.",
    eligibility: "Female students who studied in Government schools from Class 6 to 12. Must be currently pursuing higher education in college/polytechnic/ITI.",
    stepsToApply: [
      "Register on the Pudhumai Penn portal after joining college.",
      "Upload 6th to 12th standard Bonafide Certificates from Govt schools.",
      "Provide Aadhaar and bank account details linked to Aadhaar.",
      "The college Head will verify the details on the portal.",
      "Upon verification, amount is credited monthly via DBT."
    ],
    applicationLink: "https://www.pudhumaipenn.tn.gov.in"
  },
  {
    name: "Tamil Pudhalvan",
    provider: "Govt of Tamil Nadu",
    grades: ["12th"],
    category: "State Schemes",
    benefit: "₹1,000 per month for higher education.",
    eligibility: "Male students who studied in Government/Govt-Aided schools from Class 6 to 12 and are pursuing UG degrees/diplomas.",
    stepsToApply: [
      "Apply through the dedicated portal after securing college admission.",
      "Submit school study certificates for classes 6 to 12.",
      "Submit bank passbook and Aadhaar copies.",
      "Nodal officers at the college level will verify the applications.",
      "Fund is released monthly for the duration of the course."
    ],
    applicationLink: "https://www.tamilpudhalvan.tn.gov.in"
  },
  {
    name: "Pre-Matric Scholarship for Minority Students",
    provider: "NSP (National Scholarship Portal)",
    grades: ["5th", "8th", "10th"],
    category: "NSP",
    benefit: "Admission and tuition fees reimbursement + maintenance allowance.",
    eligibility: "Students from Muslim, Christian, Sikh, Buddhist, Jain, or Parsi communities. Minimum 50% marks in prev exam. Income < ₹1 Lakh.",
    stepsToApply: [
      "Register on the National Scholarship Portal (NSP).",
      "Choose the 'Pre-Matric' scheme for your category.",
      "Upload/Submit photo, income certificate, and community certificate.",
      "Provide the school's DISE code correctly.",
      "Submit the printed application copy to the school HM for online verification."
    ],
    applicationLink: "https://scholarships.gov.in"
  },
  {
    name: "Scholarship for Differently Abled Students",
    provider: "Govt of Tamil Nadu",
    grades: ["5th", "8th", "10th", "12th"],
    category: "Government",
    benefit: "Uniforms, books allowance and monthly stipend based on level.",
    eligibility: "Differently abled students with disability > 40%. Native of Tamil Nadu.",
    stepsToApply: [
      "Obtain UDID card or Disability Certificate from CMHO/MS.",
      "Contact the District Welfare Officer for the Differently Abled or apply via school.",
      "Provide copies of disability certificate, income certificate, and ration card.",
      "Renewal is required every year through the school office."
    ],
    applicationLink: "https://www.tn.gov.in/sc_d_welfare"
  }
];

const updateScholarships = async () => {
  try {
    await connectDB();
    console.log("Updating and accurate-seeding scholarships...");

    for (const item of scholarshipsToUpdate) {
      // Use name and category for uniqueness
      await Scholarship.findOneAndUpdate(
        { scholarshipName: new RegExp(`^${item.name}$`, "i") },
        {
          scholarshipName: item.name,
          provider: item.provider,
          grades: item.grades,
          category: item.category,
          benefit: item.benefit,
          eligibility: item.eligibility,
          stepsToApply: item.stepsToApply,
          applicationLink: item.applicationLink,
          status: "active"
        },
        { upsert: true, new: true }
      );
      console.log(`Synced: ${item.name}`);
    }

    console.log("Scholarship registry updated successfully with accurate government data.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

updateScholarships();
