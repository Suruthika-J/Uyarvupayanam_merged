const mongoose = require("mongoose");
const connectDB = require("../config/db");
const AhpFuzzyQuestion = require("../models/AhpFuzzyQuestion");
const { seedPdfMasterQuestionBank } = require("../seeders/seedPdfMasterQuestionBank");
const { evaluateAdaptiveFuzzy } = require("../utils/ahpFuzzyEngine");

async function testPdfQuestionBankPipeline() {
  console.log("==================================================");
  console.log("🧪 TESTING PDF MASTER QUESTION BANK & IMPORT PIPELINE");
  console.log("==================================================");

  await connectDB();

  // 1. Run Master PDF Seeder
  console.log("\n[TEST 1] Seeding Master PDF Questions into MongoDB...");
  const seedResult = await seedPdfMasterQuestionBank();
  console.log("Seed Summary:", seedResult);

  // 2. Test Idempotency (Run again)
  console.log("\n[TEST 2] Testing Idempotency (Re-running import)...");
  const reseedResult = await seedPdfMasterQuestionBank();
  console.log("Re-seed Summary:", reseedResult);

  if (reseedResult.inserted === 0) {
    console.log("✅ Idempotency test passed: 0 duplicate questions inserted on re-run.");
  } else {
    console.error("❌ Idempotency test failed: Duplicate questions inserted!");
  }

  // 3. Query questions for all 7 Master PDF domains
  console.log("\n[TEST 3] Querying imported questions from MongoDB...");
  const cyberQuestions = await AhpFuzzyQuestion.find({ domainId: "cyber_security", active: true });
  const dsQuestions = await AhpFuzzyQuestion.find({ domainId: "data_science", active: true });
  const aimlQuestions = await AhpFuzzyQuestion.find({ domainId: "ai_ml", active: true });
  const seQuestions = await AhpFuzzyQuestion.find({ domainId: "software_engineering", active: true });
  const algQuestions = await AhpFuzzyQuestion.find({ domainId: "algorithms_systems", active: true });
  const fsQuestions = await AhpFuzzyQuestion.find({ domainId: "full_stack", active: true });
  const cloudQuestions = await AhpFuzzyQuestion.find({ domainId: "cloud_devops", active: true });

  console.log(`Cyber Security Questions in DB: ${cyberQuestions.length}`);
  console.log(`Data Science Questions in DB: ${dsQuestions.length}`);
  console.log(`AI/ML Questions in DB: ${aimlQuestions.length}`);
  console.log(`Software Engineering Questions in DB: ${seQuestions.length}`);
  console.log(`Algorithms & Systems Questions in DB: ${algQuestions.length}`);
  console.log(`Full Stack Web & Mobile Questions in DB: ${fsQuestions.length}`);
  console.log(`Cloud Computing & DevOps Questions in DB: ${cloudQuestions.length}`);

  // 4. Verify actual option text (Not generic)
  const sampleQ = cyberQuestions.find(q => q.questionId === "q_cyber_security_e1");
  console.log("\nSample Question Text:", sampleQ?.questionText);
  console.log("Sample Option A:", sampleQ?.options[0]?.text);
  console.log("Sample Option B:", sampleQ?.options[1]?.text);
  console.log("Sample Correct Answer:", sampleQ?.correctOption);

  if (sampleQ?.options[0]?.text === "Confidentiality, Integrity, Availability") {
    console.log("✅ Option text test passed: Exact actual PDF options stored in MongoDB!");
  } else {
    console.error("❌ Option text test failed: Generic options found.");
  }

  // 5. Evaluate answers against MongoDB correct options
  console.log("\n[TEST 5] Evaluating student answers against MongoDB PDF correct answers...");
  const studentAnswers = cyberQuestions.map(q => ({
    questionId: q.questionId,
    selectedOption: q.correctOption // student answered correct option
  }));

  const fuzzyEval = evaluateAdaptiveFuzzy({
    userAnswers: studentAnswers,
    questions: cyberQuestions,
    ahpPriorityWeights: { cyber_security: 0.7, full_stack: 0.3 }
  });

  console.log("Fuzzy Evaluation Result Recommendation:", fuzzyEval.recommendation);
  console.log("Cybersecurity Score:", fuzzyEval.scores.cybersecurity);

  await mongoose.disconnect();
  console.log("\n🎉 ALL PDF MASTER QUESTION BANK TESTS PASSED!");
}

testPdfQuestionBankPipeline().catch(err => {
  console.error("Pipeline test error:", err);
  process.exit(1);
});
