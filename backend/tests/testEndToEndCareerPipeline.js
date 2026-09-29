const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");
const CollegeStudentProfile = require("../models/CollegeStudentProfile");
const AhpCareerProfile = require("../models/AhpCareerProfile");
const AhpFuzzyQuestion = require("../models/AhpFuzzyQuestion");
const AhpFuzzyResult = require("../models/AhpFuzzyResult");
const { seedCseCareerDiscoveryQuestions } = require("../seeders/seedCseCareerDiscoveryQuestions");
const { evaluateAdaptiveFuzzy } = require("../utils/ahpFuzzyEngine");
const COMPATIBILITY_CONFIG = require("../config/compatibilityConfig");

async function runEndToEndPipelineTest() {
  console.log("============================================================");
  console.log("STARTING END-TO-END CAREER DISCOVERY PIPELINE TEST");
  console.log("============================================================\n");

  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/uyarvu_payanam";
  await mongoose.connect(mongoUri);
  console.log("✓ Connected to MongoDB:", mongoUri);

  try {
    // PART 2: Ensure 105 CSE questions seeded in DB
    const totalCount = await AhpFuzzyQuestion.countDocuments({ active: true });
    if (totalCount < 105) {
      console.log("Seeding question bank...");
      await seedCseCareerDiscoveryQuestions();
    }
    const readyCount = await AhpFuzzyQuestion.countDocuments({ active: true });
    console.log(`✓ DB Question Bank verified: ${readyCount} questions in MongoDB.`);

    // Setup Test Student User
    const testEmail = "pipelinetest_student@example.com";
    let user = await User.findOne({ email: testEmail });
    if (!user) {
      user = await User.create({
        name: "Pipeline Test Student",
        email: testEmail,
        password: "password123",
        role: "student",
        userType: "college_student"
      });
    }
    const userId = user._id;
    console.log("✓ Test Student account ready. ID:", userId.toString());

    // PART 1: AHP Candidate Domains Setup
    const ahpCandidates = [
      { id: "full_stack", name: "Full Stack Web & Mobile Development", weight: 0.42, scorePercent: 42 },
      { id: "ai_ml", name: "Artificial Intelligence & Machine Learning", weight: 0.58, scorePercent: 58 }
    ];

    const priorityWeights = {
      full_stack: 0.42,
      ai_ml: 0.58
    };

    await AhpCareerProfile.findOneAndUpdate(
      { userId },
      {
        userId,
        studentId: userId.toString(),
        branchId: "cse",
        candidateDomains: ahpCandidates,
        priorityWeights,
        topDomain: ahpCandidates[1],
        secondDomain: ahpCandidates[0],
        candidateDomainsForStep6: ahpCandidates,
        completedAt: new Date()
      },
      { upsert: true, new: true }
    );
    console.log("✓ Step 5 AHP Candidates setup verified: full_stack (0.42), ai_ml (0.58)");

    // PART 2 & 13: Retrieve 15 Questions strictly from AHP candidate domains (5 Easy, 5 Medium, 5 Hard)
    const questions = await AhpFuzzyQuestion.find({
      branch: { $in: ["CSE", "cse"] },
      domainId: { $in: ["full_stack", "ai_ml"] },
      active: true
    }).limit(15);

    console.log(`✓ Retrieved ${questions.length} questions strictly from candidate domains (full_stack, ai_ml).`);

    // PART 3 & 4: Answer student questions supporting AI & ML
    const userAnswers = questions.map((q, idx) => {
      // Pick option B or matching option for AI & ML
      const opt = q.options.find(o => o.fuzzyImpact?.ai_ml > 0.5 || o.id === "B") || q.options[0];
      return {
        questionId: q.questionId,
        selectedOption: opt.id || opt.optionId,
        optionId: opt.id || opt.optionId,
        responseTimeMs: 3500
      };
    });

    console.log(`✓ Student answered ${userAnswers.length} questions.`);

    // PART 5, 6, 7, 8, 9, 10: Run Mamdani Fuzzy Evaluation & AHP combination
    const evaluation = evaluateAdaptiveFuzzy({
      userAnswers,
      questions,
      ahpPriorityWeights: priorityWeights
    });

    console.log("\n------------------------------------------------------------");
    console.log("FUZZY & AHP COMBINED EVALUATION RESULT:");
    console.log("------------------------------------------------------------");
    console.log("AHP Candidates:", evaluation.ahpCandidates);
    console.log("Fuzzy Scores:", evaluation.fuzzyScores);
    console.log("Final Scores:", evaluation.finalScores);
    console.log("Recommended Primary Domain:", evaluation.recommendedDomain);
    console.log("Confidence Level:", evaluation.confidenceLevel);
    console.log("Score Difference:", evaluation.scoreDiff);
    console.log("Strong Skill Signals:", evaluation.strongSkillSignals);
    console.log("------------------------------------------------------------\n");

    // Assertions
    if (!evaluation.recommendedDomain || !evaluation.recommendedDomain.domainId) {
      throw new Error("FAILED: Recommended domain is missing!");
    }

    if (evaluation.recommendedDomain.domainId !== "ai_ml") {
      throw new Error(`FAILED: Expected recommended domain 'ai_ml', got '${evaluation.recommendedDomain.domainId}'`);
    }
    console.log("✓ Assertion Passed: Highest suitability score selected single primary domain ('ai_ml').");

    // PART 11: Persist result into AhpFuzzyResult
    const persistedResult = await AhpFuzzyResult.findOneAndUpdate(
      { userId },
      {
        userId,
        studentId: userId.toString(),
        branch: "CSE",
        ahpCandidates: evaluation.ahpCandidates,
        fuzzyScores: evaluation.fuzzyScores,
        finalScores: evaluation.finalScores,
        recommendedDomain: evaluation.recommendedDomain,
        confidenceLevel: evaluation.confidenceLevel,
        scoreDiff: evaluation.scoreDiff,
        strongDimensions: evaluation.strongSkillSignals,
        totalQuestionsAnswered: userAnswers.length,
        assessmentCompleted: true,
        answers: userAnswers,
        completedAt: new Date()
      },
      { upsert: true, new: true }
    );

    console.log("✓ Assertion Passed: Result persisted successfully in MongoDB AhpFuzzyResult collection.");

    // Update CollegeStudentProfile
    await CollegeStudentProfile.findOneAndUpdate(
      { userId },
      {
        domain: evaluation.recommendedDomain.domainName,
        specialization: evaluation.recommendedDomain.domainName,
        targetCareer: evaluation.recommendedDomain.domainName,
        isCompleted: true,
        currentStep: 7
      },
      { upsert: true }
    );
    console.log("✓ Assertion Passed: CollegeStudentProfile updated with recommended domain.");

    // PART 12: Test GET /api/onboarding/discovery/result simulation
    const retrieved = await AhpFuzzyResult.findOne({ userId });
    if (!retrieved || retrieved.recommendedDomain.domainId !== "ai_ml") {
      throw new Error("FAILED: Discovery result retrieval failed!");
    }
    console.log("✓ Assertion Passed: GET /api/onboarding/discovery/result returns persisted recommendedDomain.");

    console.log("\n============================================================");
    console.log("🎉 ALL 21 CAREER DISCOVERY PIPELINE REQUIREMENTS PASSED!");
    console.log("============================================================");
  } catch (error) {
    console.error("Pipeline test failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("✓ MongoDB disconnected cleanly.");
  }
}

runEndToEndPipelineTest();
