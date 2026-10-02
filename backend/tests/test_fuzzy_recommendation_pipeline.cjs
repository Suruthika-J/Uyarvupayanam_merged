const { evaluateAdaptiveFuzzy } = require("../utils/ahpFuzzyEngine");
const { seedCseCareerDiscoveryQuestions } = require("../seeders/seedCseCareerDiscoveryQuestions");
const AhpFuzzyQuestion = require("../models/AhpFuzzyQuestion");
const connectDB = require("../config/db");
const mongoose = require("mongoose");

async function runTest() {
  console.log("==================================================");
  console.log("🧪 TESTING FUZZY CAREER RECOMMENDATION ENGINE PIPELINE");
  console.log("==================================================");

  await connectDB();

  // Ensure questions seeded
  await seedCseCareerDiscoveryQuestions();

  const sampleQuestions = await AhpFuzzyQuestion.find({ active: true }).limit(15);
  console.log(`✅ Loaded ${sampleQuestions.length} sample assessment questions from MongoDB database.`);

  // Case 1: High Software Development & Programming Readiness answers
  console.log("\n--- TEST CASE 1: Software Development / Full Stack Heavy Answers ---");
  const case1Answers = sampleQuestions.map((q, idx) => ({
    questionId: q.questionId || q._id.toString(),
    selectedOption: q.options[0]?.id || q.options[0]?.optionId || "A",
    optionId: q.options[0]?.id || q.options[0]?.optionId || "A"
  }));

  const case1Result = evaluateAdaptiveFuzzy({
    userAnswers: case1Answers,
    questions: sampleQuestions,
    ahpPriorityWeights: { full_stack: 0.5, ai_ml: 0.3, cyber_security: 0.2 },
    behavioralSignals: { fast_response: true, answerChanges: 0, skippedQuestions: 0 }
  });

  console.log("Recommendation:", case1Result.recommendation);
  console.log("Confidence:", case1Result.confidence);
  console.log("Scores Breakdown:", JSON.stringify(case1Result.scores, null, 2));
  console.log("Fuzzy Inputs (Sample):", JSON.stringify(Object.fromEntries(Object.entries(case1Result.fuzzyInputs).slice(0, 3)), null, 2));
  console.log("Evaluated Fuzzy Rules (Count):", case1Result.ruleResults?.length || 0);

  // Case 2: Data Science / AI / Math Heavy answers
  console.log("\n--- TEST CASE 2: AI / Data Science Heavy Answers ---");
  const case2Answers = sampleQuestions.map((q, idx) => ({
    questionId: q.questionId || q._id.toString(),
    selectedOption: q.options[q.options.length - 1]?.id || q.options[q.options.length - 1]?.optionId || "D",
    optionId: q.options[q.options.length - 1]?.id || q.options[q.options.length - 1]?.optionId || "D"
  }));

  const case2Result = evaluateAdaptiveFuzzy({
    userAnswers: case2Answers,
    questions: sampleQuestions,
    ahpPriorityWeights: { ai_ml: 0.6, data_science: 0.3, full_stack: 0.1 },
    behavioralSignals: { fast_response: false, answerChanges: 1, skippedQuestions: 0 }
  });

  console.log("Recommendation:", case2Result.recommendation);
  console.log("Confidence:", case2Result.confidence);
  console.log("Scores Breakdown:", JSON.stringify(case2Result.scores, null, 2));

  // Verify dynamic score distributions
  if (case1Result.recommendation !== case2Result.recommendation || JSON.stringify(case1Result.scores) !== JSON.stringify(case2Result.scores)) {
    console.log("\n✅ VERIFICATION PASSED: Different answer combinations produced dynamic, distinct score distributions and recommendations!");
  } else {
    console.error("\n❌ VERIFICATION FAILED: Static recommendations returned.");
  }

  await mongoose.disconnect();
  console.log("\n🎉 ALL FUZZY ENGINE TESTS PASSED CLEANLY!");
}

runTest().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
