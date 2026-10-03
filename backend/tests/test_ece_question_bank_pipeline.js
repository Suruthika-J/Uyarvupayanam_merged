const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const AhpFuzzyQuestion = require("../models/AhpFuzzyQuestion");
const { seedPdfMasterQuestionBank } = require("../seeders/seedPdfMasterQuestionBank");
const { getAhpFuzzyQuestions } = require("../controllers/ahpFuzzyController");

async function runTest() {
  console.log("=================================================");
  console.log("   ECE & CSE MASTER QUESTION BANK TEST SUITE     ");
  console.log("=================================================");

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/uyarvu_payanam";
  await mongoose.connect(mongoUri);
  console.log(" Connected to MongoDB:", mongoUri);

  // 1. Run Seeder
  console.log("\n[TEST 1] Running seedPdfMasterQuestionBank()...");
  const seedResult = await seedPdfMasterQuestionBank();
  console.log(" Seed Result:", seedResult);

  // 2. Verify Counts in Database
  const totalInDb = await AhpFuzzyQuestion.countDocuments({ source: "master-question-bank-pdf", active: true });
  const cseInDb = await AhpFuzzyQuestion.countDocuments({ branch: "CSE", active: true });
  const eceInDb = await AhpFuzzyQuestion.countDocuments({ branch: "ECE", active: true });

  console.log(`\n[TEST 2] Database Question Counts:`);
  console.log(`- Total active PDF questions: ${totalInDb} (Expected: 360)`);
  console.log(`- CSE questions: ${cseInDb} (Expected: 105)`);
  console.log(`- ECE questions: ${eceInDb} (Expected: 255)`);

  if (totalInDb !== 360 || cseInDb !== 105 || eceInDb !== 255) {
    throw new Error(`Count mismatch: Total=${totalInDb}, CSE=${cseInDb}, ECE=${eceInDb}`);
  }

  // 3. Verify All 17 ECE Domains
  const eceDomains = await AhpFuzzyQuestion.distinct("domainId", { branch: "ECE", active: true });
  console.log(`\n[TEST 3] Distinct ECE Domains (${eceDomains.length} domains):`);
  console.log(eceDomains);

  if (eceDomains.length !== 17) {
    throw new Error(`Expected 17 ECE domains, found ${eceDomains.length}`);
  }

  // Check each domain has 5 easy, 5 medium, 5 hard
  for (const dId of eceDomains) {
    const easyCount = await AhpFuzzyQuestion.countDocuments({ branch: "ECE", domainId: dId, difficulty: "easy", active: true });
    const medCount = await AhpFuzzyQuestion.countDocuments({ branch: "ECE", domainId: dId, difficulty: "medium", active: true });
    const hardCount = await AhpFuzzyQuestion.countDocuments({ branch: "ECE", domainId: dId, difficulty: "hard", active: true });
    if (easyCount !== 5 || medCount !== 5 || hardCount !== 5) {
      throw new Error(`Domain ${dId} has invalid breakdown: easy=${easyCount}, med=${medCount}, hard=${hardCount}`);
    }
  }
  console.log(" All 17 ECE domains have exactly 5 Easy + 5 Medium + 5 Hard questions!");

  // 4. Test Controller: ECE Branch Query
  console.log("\n[TEST 4] Testing getAhpFuzzyQuestions for ECE student selection...");
  const mockReqEce = {
    query: {
      branch: "ECE (Electronics & Communication Engineering)",
      domains: "vlsi_chip_design,embedded_systems,iot"
    },
    body: {}
  };
  let eceResData = null;
  const mockResEce = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      eceResData = data;
      return this;
    }
  };

  await getAhpFuzzyQuestions(mockReqEce, mockResEce);

  console.log(` ECE Response Status: ${mockResEce.statusCode}, Questions returned: ${eceResData?.questions?.length}`);
  const nonEceInEce = (eceResData?.questions || []).filter(q => q.branch !== "ECE");
  console.log(` Non-ECE questions in ECE response: ${nonEceInEce.length}`);

  if (nonEceInEce.length > 0) {
    throw new Error(`Found non-ECE questions in ECE response: ${JSON.stringify(nonEceInEce)}`);
  }
  console.log(" Strict branch isolation verified: 100% of questions returned for ECE are ECE questions!");

  // 5. Test Controller: CSE Branch Query
  console.log("\n[TEST 5] Testing getAhpFuzzyQuestions for CSE student selection...");
  const mockReqCse = {
    query: {
      branch: "CSE (Computer Science & Engineering)",
      domains: "software_engineering,ai_ml,cloud_devops"
    },
    body: {}
  };
  let cseResData = null;
  const mockResCse = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      cseResData = data;
      return this;
    }
  };

  await getAhpFuzzyQuestions(mockReqCse, mockResCse);

  console.log(` CSE Response Status: ${mockResCse.statusCode}, Questions returned: ${cseResData?.questions?.length}`);
  const nonCseInCse = (cseResData?.questions || []).filter(q => q.branch !== "CSE");
  console.log(` Non-CSE questions in CSE response: ${nonCseInCse.length}`);

  if (nonCseInCse.length > 0) {
    throw new Error(`Found non-CSE questions in CSE response: ${JSON.stringify(nonCseInCse)}`);
  }
  console.log(" Strict branch isolation verified: 100% of questions returned for CSE are CSE questions!");

  console.log("\n=================================================");
  console.log(" ALL ECE QUESTION BANK TESTS PASSED PERFECTLY!   ");
  console.log("=================================================");

  await mongoose.disconnect();
}

runTest().catch(err => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
