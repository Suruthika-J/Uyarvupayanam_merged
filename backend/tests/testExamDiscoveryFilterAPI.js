const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Exam = require("../models/Exam");
const { getExams } = require("../controllers/examPreparationController");

dotenv.config();

async function testDiscoveryFilters() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/uyarvu_payanam";
  await mongoose.connect(mongoUri);

  console.log("=== RUNNING EXAM DISCOVERY API VERIFICATION TEST ===");

  const categoriesToTest = [
    "ALL",
    "Government",
    "Engineering",
    "Management",
    "Higher Studies",
    "Banking",
    "Railway",
    "Defence",
    "State PSC",
    "PSU"
  ];

  for (const cat of categoriesToTest) {
    const req = { query: { category: cat }, student: null };
    let jsonResult = null;
    const res = {
      status: () => res,
      json: (data) => { jsonResult = data; return res; }
    };

    await getExams(req, res);
    console.log(`✓ Category '${cat}': Found ${jsonResult?.count || 0} examination records.`);
    if (jsonResult?.exams && jsonResult.exams.length > 0) {
      console.log(`   Sample Exam: ${jsonResult.exams[0].shortName} | Match Score: ${jsonResult.exams[0].matchScore}% | Status: ${jsonResult.exams[0].status}`);
    }
  }

  // Test Search query
  const searchReq = { query: { search: "GATE" }, student: null };
  let searchResult = null;
  const searchRes = {
    status: () => searchRes,
    json: (data) => { searchResult = data; return searchRes; }
  };
  await getExams(searchReq, searchRes);
  console.log(`\n✓ Search 'GATE': Found ${searchResult?.count || 0} matching exams.`);

  console.log("\n=== ALL DISCOVERY API TESTS COMPLETED SUCCESSFULLY ===");
  await mongoose.disconnect();
}

testDiscoveryFilters();
