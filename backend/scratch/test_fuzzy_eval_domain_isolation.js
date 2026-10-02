const { evaluateAdaptiveFuzzy } = require("../utils/ahpFuzzyEngine");

const testQuestions = [
  { questionId: "q1", domainId: "software_engineering", difficulty: "easy", options: [{ optionId: "A", skillMappings: { programming_readiness: "HIGH", system_thinking: "HIGH" } }] },
  { questionId: "q2", domainId: "software_engineering", difficulty: "medium", options: [{ optionId: "A", skillMappings: { programming_readiness: "HIGH", analytical_thinking: "HIGH" } }] },
  { questionId: "q3", domainId: "ai_ml", difficulty: "easy", options: [{ optionId: "A", skillMappings: { pattern_recognition: "MEDIUM", mathematical_readiness: "MEDIUM" } }] },
  { questionId: "q4", domainId: "cloud_devops", difficulty: "easy", options: [{ optionId: "A", skillMappings: { system_thinking: "MEDIUM" } }] }
];

const testAnswers = [
  { questionId: "q1", selectedOption: "A" },
  { questionId: "q2", selectedOption: "A" },
  { questionId: "q3", selectedOption: "A" },
  { questionId: "q4", selectedOption: "A" }
];

// Test 1: Empty ahpPriorityWeights (should derive domains from testQuestions)
const result1 = evaluateAdaptiveFuzzy({
  userAnswers: testAnswers,
  questions: testQuestions,
  ahpPriorityWeights: {}
});

console.log("=== TEST 1 (Empty ahpPriorityWeights) ===");
console.log("Evaluated Domains:", result1.rankings.map(r => r.domainId));
console.log("Top Recommendation:", result1.recommendedDomain.domainName, "(ID:", result1.recommendedDomain.domainId, ")");

// Test 2: explicit candidate weights
const result2 = evaluateAdaptiveFuzzy({
  userAnswers: testAnswers,
  questions: testQuestions,
  ahpPriorityWeights: { software_engineering: 0.5, ai_ml: 0.3, cloud_devops: 0.2 }
});

console.log("\n=== TEST 2 (Explicit ahpPriorityWeights) ===");
console.log("Evaluated Domains:", result2.rankings.map(r => r.domainId));
console.log("Top Recommendation:", result2.recommendedDomain.domainName, "(ID:", result2.recommendedDomain.domainId, ")");

if (result1.rankings.some(r => r.domainId === "full_stack") || result2.rankings.some(r => r.domainId === "full_stack")) {
  console.error("FAIL: full_stack appeared when not in candidate domains!");
  process.exit(1);
} else {
  console.log("\nSUCCESS: Candidate domains strictly respected, full_stack NOT present!");
}
