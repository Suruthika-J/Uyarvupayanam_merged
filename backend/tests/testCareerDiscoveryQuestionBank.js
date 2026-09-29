const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, "../.env") });

const connectDB = require("../config/db");
const AhpFuzzyQuestion = require("../models/AhpFuzzyQuestion");
const { seedCareerDiscoveryQuestions, CAREER_DISCOVERY_QUESTION_BANK } = require("../seeders/seedCareerDiscoveryQuestions");
const { getAhpFuzzyQuestions } = require("../controllers/ahpFuzzyController");

const REQUIRED_DOMAINS = [
  "software_engineering", "full_stack", "frontend_development", "backend_development",
  "ai_ml", "data_science", "data_analytics", "cyber_security", "cloud_computing",
  "devops", "data_engineering", "database_systems", "embedded_iot", "robotics",
  "blockchain", "game_development", "ar_vr", "ui_ux", "systems_programming",
  "software_testing", "research_rd"
];

async function runTests() {
  console.log("================================================");
  console.log("RUNNING CAREER DISCOVERY QUESTION BANK TESTS");
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

    // 14. Seed script is idempotent test (run twice)
    console.log("\n--- Testing Seeder & Idempotency ---");
    const seedRes1 = await seedCareerDiscoveryQuestions();
    const seedRes2 = await seedCareerDiscoveryQuestions();

    assert(seedRes1.totalCount >= 315, `Seeder created at least 315 questions (Actual: ${seedRes1.totalCount})`);
    assert(seedRes2.totalCount === seedRes1.totalCount, `Seeder is idempotent on second execution.`);

    const totalInDb = await AhpFuzzyQuestion.countDocuments({ active: true });
    assert(totalInDb >= 315, `Database contains at least 315 active questions (Actual: ${totalInDb})`);

    // 1, 2, 3. Domain difficulty checks (5 Easy, 5 Medium, 5 Hard for all 21 domains)
    console.log("\n--- Testing Domain & Difficulty Coverage ---");
    for (const dId of REQUIRED_DOMAINS) {
      const easyCount = await AhpFuzzyQuestion.countDocuments({ domainId: dId, difficulty: "easy", active: true });
      const medCount = await AhpFuzzyQuestion.countDocuments({ domainId: dId, difficulty: "medium", active: true });
      const hardCount = await AhpFuzzyQuestion.countDocuments({ domainId: dId, difficulty: "hard", active: true });

      assert(easyCount >= 5, `Domain '${dId}' has at least 5 Easy questions (Count: ${easyCount})`);
      assert(medCount >= 5, `Domain '${dId}' has at least 5 Medium questions (Count: ${medCount})`);
      assert(hardCount >= 5, `Domain '${dId}' has at least 5 Hard questions (Count: ${hardCount})`);
    }

    // 4. No duplicate question IDs
    console.log("\n--- Testing Uniqueness & Schema Validity ---");
    const allQuestions = await AhpFuzzyQuestion.find({ active: true });
    const questionIds = allQuestions.map(q => q.questionId);
    const uniqueIds = new Set(questionIds);
    assert(questionIds.length === uniqueIds.size, `No duplicate question IDs in database (${uniqueIds.size}/${questionIds.length}).`);

    // 5. No duplicate question text within the same domain
    let duplicateTextFound = false;
    for (const dId of REQUIRED_DOMAINS) {
      const dTexts = allQuestions.filter(q => q.domainId === dId).map(q => q.questionText);
      const uniqueTexts = new Set(dTexts);
      if (dTexts.length !== uniqueTexts.size) {
        duplicateTextFound = true;
      }
    }
    assert(!duplicateTextFound, `No duplicate question text within any domain.`);

    // 6. Every question has skillDimensions
    const missingSkills = allQuestions.filter(q => !q.skillDimensions || q.skillDimensions.length === 0);
    assert(missingSkills.length === 0, `Every question has non-empty skillDimensions.`);

    // 7. Every question has fuzzyMappings
    const missingFuzzyMap = allQuestions.filter(q => !q.fuzzyMappings || (q.fuzzyMappings instanceof Map ? q.fuzzyMappings.size === 0 : Object.keys(q.fuzzyMappings).length === 0));
    assert(missingFuzzyMap.length === 0, `Every question has non-empty fuzzyMappings.`);

    // 8. Every option has valid fuzzy impact data
    let invalidOptions = false;
    allQuestions.forEach(q => {
      if (!q.options || q.options.length === 0) invalidOptions = true;
      q.options.forEach(opt => {
        if (!opt.text || (!opt.fuzzyImpact && !opt.skillMappings)) {
          invalidOptions = true;
        }
      });
    });
    assert(!invalidOptions, `Every option has valid text and fuzzy impact metadata.`);

    // 9, 10, 11, 12, 13. API Filtering, AHP allocation, Unrelated domain exclusion, Security Sanitization
    console.log("\n--- Testing API Logic & Sanitization ---");
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

    // 9 & 10. Filter by single domainId & difficulty
    await getAhpFuzzyQuestions({ query: { domainId: "ai_ml", difficulty: "easy", limit: 5 } }, mockRes);
    assert(mockResJson && mockResJson.success && mockResJson.questions.length === 5, `API filters by domainId=ai_ml and difficulty=easy.`);
    const allAimlEasy = mockResJson.questions.every(q => q.domainId === "ai_ml" && q.difficulty === "easy");
    assert(allAimlEasy, `All returned questions belong strictly to ai_ml and easy difficulty.`);

    // 13. Correct answers and internal fuzzy weights are NOT exposed
    let exposedSecret = false;
    mockResJson.questions.forEach(q => {
      if (q.correctOption || q.correct !== undefined) exposedSecret = true;
      q.options.forEach(opt => {
        if (opt.fuzzyImpact !== undefined || opt.skillMappings !== undefined || opt.fuzzyIntensity !== undefined) {
          exposedSecret = true;
        }
      });
    });
    assert(!exposedSecret, `API Security Sanitization verified: correctOption and internal fuzzy weights are completely hidden.`);

    // 11 & 12. AHP Top 3 candidate domains selection (e.g. ai_ml, cyber_security, full_stack)
    await getAhpFuzzyQuestions({ query: { domains: "ai_ml,cyber_security,full_stack" } }, mockRes);
    assert(mockResJson && mockResJson.questions.length === 15, `API retrieves exactly 15 questions for Top 3 AHP domains.`);

    const returnedDomains = new Set(mockResJson.questions.map(q => q.domainId));
    assert(returnedDomains.has("ai_ml") && returnedDomains.has("cyber_security") && returnedDomains.has("full_stack"), `Questions returned cover the selected AHP candidate domains.`);
    
    // 12. Unrelated domains are never selected
    assert(!returnedDomains.has("mechanical") && !returnedDomains.has("civil") && !returnedDomains.has("research_rd"), `Unrelated domains are NEVER selected.`);

    // Check difficulty distribution: 5 Easy, 5 Medium, 5 Hard
    const distEasy = mockResJson.questions.filter(q => q.difficulty === "easy").length;
    const distMed = mockResJson.questions.filter(q => q.difficulty === "medium").length;
    const distHard = mockResJson.questions.filter(q => q.difficulty === "hard").length;

    assert(distEasy === 5 && distMed === 5 && distHard === 5, `AHP candidate allocation produces exactly 5 Easy, 5 Medium, and 5 Hard questions (Actual: ${distEasy} Easy, ${distMed} Medium, ${distHard} Hard).`);

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
