const { evaluateAdaptiveFuzzy } = require("../utils/ahpFuzzyEngine");

const testQuestions = [
  { questionId: "q1", domainId: "software_engineering", difficulty: "easy", correctOption: "A", skillDimensions: ["programming_readiness"], options: [{ id: "A" }, { id: "B" }] },
  { questionId: "q2", domainId: "software_engineering", difficulty: "medium", correctOption: "A", skillDimensions: ["system_thinking"], options: [{ id: "A" }, { id: "B" }] },
  { questionId: "q3", domainId: "software_engineering", difficulty: "hard", correctOption: "A", skillDimensions: ["analytical_thinking"], options: [{ id: "A" }, { id: "B" }] },
  { questionId: "q4", domainId: "ai_ml", difficulty: "easy", correctOption: "A", skillDimensions: ["pattern_recognition"], options: [{ id: "A" }, { id: "B" }] },
  { questionId: "q5", domainId: "ai_ml", difficulty: "medium", correctOption: "A", skillDimensions: ["mathematical_readiness"], options: [{ id: "A" }, { id: "B" }] }
];

// Scenario 1: Student gets ALL Software Engineering correct (A), but AI/ML WRONG (B)
const answers1 = [
  { questionId: "q1", selectedOption: "A" },
  { questionId: "q2", selectedOption: "A" },
  { questionId: "q3", selectedOption: "A" },
  { questionId: "q4", selectedOption: "B" },
  { questionId: "q5", selectedOption: "B" }
];

const eval1 = evaluateAdaptiveFuzzy({
  userAnswers: answers1,
  questions: testQuestions,
  ahpPriorityWeights: { software_engineering: 0.4, ai_ml: 0.4, cloud_devops: 0.2 }
});

console.log("=== SCENARIO 1: Software Eng 100% Correct, AI/ML 0% Correct ===");
eval1.rankings.forEach(r => {
  console.log(`${r.domainName} (${r.domainId}): ${(r.score * 100).toFixed(1)}% | AHP: ${(r.ahpScore * 100).toFixed(1)}% | Fuzzy: ${(r.fuzzyScore * 100).toFixed(1)}%`);
});

// Scenario 2: Student gets ALL AI/ML correct (A), but Software Eng WRONG (B)
const answers2 = [
  { questionId: "q1", selectedOption: "B" },
  { questionId: "q2", selectedOption: "B" },
  { questionId: "q3", selectedOption: "B" },
  { questionId: "q4", selectedOption: "A" },
  { questionId: "q5", selectedOption: "A" }
];

const eval2 = evaluateAdaptiveFuzzy({
  userAnswers: answers2,
  questions: testQuestions,
  ahpPriorityWeights: { software_engineering: 0.4, ai_ml: 0.4, cloud_devops: 0.2 }
});

console.log("\n=== SCENARIO 2: AI/ML 100% Correct, Software Eng 0% Correct ===");
eval2.rankings.forEach(r => {
  console.log(`${r.domainName} (${r.domainId}): ${(r.score * 100).toFixed(1)}% | AHP: ${(r.ahpScore * 100).toFixed(1)}% | Fuzzy: ${(r.fuzzyScore * 100).toFixed(1)}%`);
});
