const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, "../.env") });

const connectDB = require("../config/db");
const AhpFuzzyQuestion = require("../models/AhpFuzzyQuestion");
const { seedCseCareerDiscoveryQuestions, EXACT_CSE_DOMAINS } = require("../seeders/seedCseCareerDiscoveryQuestions");
const { getAhpFuzzyQuestions } = require("../controllers/ahpFuzzyController");

const EXPECTED_DOMAIN_IDS = [
  "software_engineering",
  "ai_ml",
  "data_science",
  "cyber_security",
  "cloud_devops",
  "full_stack",
  "algorithms_systems"
];

async function runTests() {
  console.log("================================================");
  console.log("RUNNING CSE CAREER DISCOVERY QUESTION BANK TESTS");
  console.log("================================================");

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passedCount++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failedCount++;
    }
  }

  try {
    await connectDB();

    // 7. Seed script is idempotent test (run twice)
    console.log("\n--- Testing Seeder & Idempotency ---");
    const seedRes1 = await seedCseCareerDiscoveryQuestions();
    const seedRes2 = await seedCseCareerDiscoveryQuestions();

    // 1 & 5. Total = 105 questions across exactly 7 domains
    assert(seedRes1.totalQuestions === 105, `1. Seeder creates exactly 105 total questions (Actual: ${seedRes1.totalQuestions}).`);
    assert(seedRes2.totalQuestions === seedRes1.totalQuestions, `7. Seeder is idempotent on repeated execution.`);

    const totalActive = await AhpFuzzyQuestion.countDocuments({ branch: "CSE", active: true });
    assert(totalActive === 105, `5. Database contains exactly 105 active CSE questions.`);

    // 1. Exactly 7 CSE domains check
    const activeDomainsInDb = await AhpFuzzyQuestion.distinct("domainId", { branch: "CSE", active: true });
    assert(activeDomainsInDb.length === 7, `1. Exactly 7 CSE domains exist in database.`);

    // 2, 3, 4. 5 Easy, 5 Medium, 5 Hard questions per domain
    console.log("\n--- Testing Domain Difficulty Distributions ---");
    for (const dId of EXPECTED_DOMAIN_IDS) {
      const easyCount = await AhpFuzzyQuestion.countDocuments({ branch: "CSE", domainId: dId, difficulty: "easy", active: true });
      const medCount = await AhpFuzzyQuestion.countDocuments({ branch: "CSE", domainId: dId, difficulty: "medium", active: true });
      const hardCount = await AhpFuzzyQuestion.countDocuments({ branch: "CSE", domainId: dId, difficulty: "hard", active: true });

      assert(easyCount === 5, `2. Domain '${dId}' has exactly 5 Easy questions.`);
      assert(medCount === 5, `3. Domain '${dId}' has exactly 5 Medium questions.`);
      assert(hardCount === 5, `4. Domain '${dId}' has exactly 5 Hard questions.`);
    }

    // 6. No duplicate question IDs
    console.log("\n--- Testing Question IDs & Schema ---");
    const allQuestions = await AhpFuzzyQuestion.find({ branch: "CSE", active: true });
    const questionIds = allQuestions.map(q => q.questionId);
    const uniqueIds = new Set(questionIds);
    assert(questionIds.length === uniqueIds.size && uniqueIds.size === 105, `6. All 105 question IDs are unique (No duplicates).`);

    // 10, 11, 12. Security Sanitization & Difficulty Filtering
    console.log("\n--- Testing Security Sanitization & API Filtering ---");
    let mockResJson = null;
    const mockRes = {
      status: function(code) {
        return {
          json: function(data) {
            mockResJson = data;
          }
        };
      }
    };

    // 10. Difficulty filtering works
    await getAhpFuzzyQuestions({ query: { branch: "CSE", domainId: "ai_ml", difficulty: "easy", limit: 5 } }, mockRes);
    assert(mockResJson && mockResJson.success && mockResJson.questions.length === 5, `10. Difficulty filtering works (Returned 5 Easy AI/ML questions).`);

    // 11 & 12. Correct answer and fuzzy mappings are hidden
    let secretExposed = false;
    mockResJson.questions.forEach(q => {
      if (q.correctOption || q.correct !== undefined) secretExposed = true;
      if (q.fuzzyMappings !== undefined || q.fuzzyImpact !== undefined) secretExposed = true;
      q.options.forEach(opt => {
        if (opt.fuzzyImpact !== undefined || opt.skillMappings !== undefined) secretExposed = true;
      });
    });
    assert(!secretExposed, `11 & 12. API Security verified: correctOption and fuzzyMappings are strictly hidden.`);

    // 13. One-domain selection works
    console.log("\n--- Testing AHP Selection Scenarios ---");
    await getAhpFuzzyQuestions({ query: { branch: "CSE", domains: "ai_ml" } }, mockRes);
    assert(mockResJson && mockResJson.questions.length === 15, `13. One-domain selection returns 15 questions.`);
    const allSingleDom = mockResJson.questions.every(q => q.domainId === "ai_ml");
    assert(allSingleDom, `13. All 15 questions belong ONLY to the single selected domain ('ai_ml').`);

    // 14. Two-domain selection works
    await getAhpFuzzyQuestions({ query: { branch: "CSE", domains: "ai_ml,cyber_security" } }, mockRes);
    assert(mockResJson && mockResJson.questions.length === 15, `14. Two-domain selection returns 15 questions.`);
    const domsInTwo = new Set(mockResJson.questions.map(q => q.domainId));
    assert(domsInTwo.has("ai_ml") && domsInTwo.has("cyber_security") && domsInTwo.size === 2, `14. Questions cover ONLY the 2 selected domains.`);

    // 15, 16, 17, 18, 19. Multi-domain selection & 15-question distribution (5 Easy, 5 Medium, 5 Hard)
    await getAhpFuzzyQuestions({ query: { branch: "CSE", domains: "ai_ml,data_science,software_engineering" } }, mockRes);
    assert(mockResJson && mockResJson.questions.length === 15, `15 & 16. Multi-domain selection correctly retrieves a 15-question assessment.`);

    const domsInMulti = new Set(mockResJson.questions.map(q => q.domainId));
    assert(domsInMulti.has("ai_ml") && domsInMulti.has("data_science") && domsInMulti.has("software_engineering") && domsInMulti.size === 3, `8 & 9. Only selected AHP candidate domains are queried (${Array.from(domsInMulti).join(", ")}).`);

    const countEasy = mockResJson.questions.filter(q => q.difficulty === "easy").length;
    const countMed = mockResJson.questions.filter(q => q.difficulty === "medium").length;
    const countHard = mockResJson.questions.filter(q => q.difficulty === "hard").length;

    assert(countEasy === 5, `17. Easy questions = 5.`);
    assert(countMed === 5, `18. Medium questions = 5.`);
    assert(countHard === 5, `19. Hard questions = 5.`);

    console.log("================================================");
    console.log(`TEST SUITE COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log("================================================");

    process.exit(failedCount > 0 ? 1 : 0);
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  }
}

runTests();
