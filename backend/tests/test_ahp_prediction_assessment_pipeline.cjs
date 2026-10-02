const mongoose = require("mongoose");
const connectDB = require("../config/db");
const AhpFuzzyQuestion = require("../models/AhpFuzzyQuestion");
const AhpCareerProfile = require("../models/AhpCareerProfile");
const { seedPdfMasterQuestionBank } = require("../seeders/seedPdfMasterQuestionBank");
const { getAhpFuzzyQuestions, evaluateStudentAssessment } = require("../controllers/ahpFuzzyController");

async function testAhpPredictionAssessmentPipeline() {
  console.log("==================================================");
  console.log("🧪 TESTING AHP PREDICTION -> SEEDMASTER -> FUZZY LOGIC PIPELINE");
  console.log("==================================================");

  await connectDB();

  // 1. Ensure SeedMaster questions are populated
  await seedPdfMasterQuestionBank();

  // -------------------------------------------------------------------------
  // TEST SCENARIO 1: AHP Ranks: 1. AI/ML, 2. Cybersecurity, 3. Data Science
  // -------------------------------------------------------------------------
  console.log("\n--- TEST SCENARIO 1: AHP [AI/ML -> Cybersecurity -> Data Science] ---");
  const mockReq1 = {
    query: {
      branch: "CSE",
      domains: "ai_ml,cyber_security,data_science"
    },
    body: {}
  };

  let mockResData1 = null;
  const mockRes1 = {
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (data) {
      mockResData1 = data;
      return this;
    }
  };

  await getAhpFuzzyQuestions(mockReq1, mockRes1);

  console.log("Scenario 1 Assessment Session ID:", mockResData1.assessmentId);
  console.log("Scenario 1 Returned Top 3 Domains:", mockResData1.domains.map(d => `${d.rank}. ${d.domainName}`));
  console.log("Scenario 1 Total Questions:", mockResData1.count);

  const qDomainsSeq1 = mockResData1.questions.map(q => q.domainId || q.domain);
  console.log("Scenario 1 Questions Domain Sequence:", qDomainsSeq1);

  // Assertions for Scenario 1
  const first5Domain1 = qDomainsSeq1.slice(0, 5).every(d => d === "ai_ml");
  const next5Domain1 = qDomainsSeq1.slice(5, 10).every(d => d === "cyber_security");
  const last5Domain1 = qDomainsSeq1.slice(10, 15).every(d => d === "data_science");

  if (first5Domain1 && next5Domain1 && last5Domain1) {
    console.log("✅ SCENARIO 1 PASSED: Questions follow exact AHP Rank order (AI/ML -> Cybersecurity -> Data Science)!");
  } else {
    console.error("❌ SCENARIO 1 FAILED: Questions do not match expected AHP rank sequence!");
    process.exit(1);
  }

  // Verify non-generic actual options
  const sampleQ1 = mockResData1.questions[0];
  console.log("Sample Question Text:", sampleQ1.questionText);
  console.log("Sample Option A:", sampleQ1.options[0]?.text);
  if (sampleQ1.options[0]?.text.includes("Primary optimal approach")) {
    console.error("❌ FAILED: Generic options detected!");
    process.exit(1);
  } else {
    console.log("✅ Real PDF Option Text Verified (No generic choices).");
  }

  // -------------------------------------------------------------------------
  // TEST SCENARIO 2: AHP Ranks: 1. Full Stack, 2. Cloud DevOps, 3. Algorithms
  // -------------------------------------------------------------------------
  console.log("\n--- TEST SCENARIO 2: AHP [Full Stack -> Cloud DevOps -> Algorithms & Systems] ---");
  const mockReq2 = {
    query: {
      branch: "CSE",
      domains: "full_stack,cloud_devops,algorithms_systems"
    },
    body: {}
  };

  let mockResData2 = null;
  const mockRes2 = {
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (data) {
      mockResData2 = data;
      return this;
    }
  };

  await getAhpFuzzyQuestions(mockReq2, mockRes2);

  console.log("Scenario 2 Assessment Session ID:", mockResData2.assessmentId);
  console.log("Scenario 2 Returned Top 3 Domains:", mockResData2.domains.map(d => `${d.rank}. ${d.domainName}`));

  const qDomainsSeq2 = mockResData2.questions.map(q => q.domainId || q.domain);
  console.log("Scenario 2 Questions Domain Sequence:", qDomainsSeq2);

  const first5Domain2 = qDomainsSeq2.slice(0, 5).every(d => d === "full_stack");
  const next5Domain2 = qDomainsSeq2.slice(5, 10).every(d => d === "cloud_devops");
  const last5Domain2 = qDomainsSeq2.slice(10, 15).every(d => d === "algorithms_systems");

  if (first5Domain2 && next5Domain2 && last5Domain2) {
    console.log("✅ SCENARIO 2 PASSED: Questions follow exact AHP Rank order (Full Stack -> Cloud DevOps -> Algorithms)!");
  } else {
    console.error("❌ SCENARIO 2 FAILED: Questions do not match expected AHP rank sequence!");
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // TEST SUBMISSION & FUZZY LOGIC RECOMMENDATION EVALUATION
  // -------------------------------------------------------------------------
  console.log("\n--- TESTING SUBMIT ASSESSMENT & FUZZY EVALUATION ---");
  const mockStudentAnswers = mockResData1.questions.map(q => ({
    questionId: q.questionId,
    selectedOption: "A"
  }));

  const mockEvalReq = {
    body: {
      answers: mockStudentAnswers,
      ahpPriorityWeights: { ai_ml: 0.5, cyber_security: 0.3, data_science: 0.2 }
    }
  };

  let evalResData = null;
  const mockEvalRes = {
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (data) {
      evalResData = data;
      return this;
    }
  };

  await evaluateStudentAssessment(mockEvalReq, mockEvalRes);

  console.log("Fuzzy Recommended Domain:", evalResData?.evaluation?.recommendedDomain);
  console.log("Fuzzy Final Scores:", evalResData?.evaluation?.finalScores);

  if (evalResData?.success && evalResData?.evaluation?.recommendedDomain) {
    console.log("✅ SUBMIT & FUZZY LOGIC EVALUATION PASSED!");
  } else {
    console.error("❌ SUBMIT & FUZZY LOGIC EVALUATION FAILED!");
    process.exit(1);
  }

  await mongoose.disconnect();
  console.log("\n🎉 ALL AHP-DRIVEN ASSESSMENT & FUZZY PIPELINE TESTS PASSED CLEANLY!");
}

testAhpPredictionAssessmentPipeline().catch(err => {
  console.error("Pipeline test failure:", err);
  process.exit(1);
});
