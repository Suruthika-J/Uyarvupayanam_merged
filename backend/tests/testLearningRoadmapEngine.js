/**
 * testLearningRoadmapEngine.js
 * End-to-End Acceptance Test Script for AI-Powered Dynamic Learning Roadmap Generator
 */

const mongoose = require("mongoose");
const TopicClassificationService = require("../services/topicClassificationService");
const LearningRoadmapResearchService = require("../services/learningRoadmapResearchService");
const RoadmapPriorityService = require("../services/roadmapPriorityService");
const PrerequisiteGraphService = require("../services/prerequisiteGraphService");
const StudyTimeEstimatorService = require("../services/studyTimeEstimatorService");
const LearningRoadmapGeneratorService = require("../services/learningRoadmapGeneratorService");

async function runAcceptanceTests() {
  console.log("=== STARTING LEARNING ROADMAP GENERATOR ACCEPTANCE TESTS ===");

  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/uyarvu_payanam";
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 }).catch(err => {
      console.log("MongoDB connection timeout, proceeding with in-memory test mode:", err.message);
    });

    // 1. Test Topic Classification
    console.log("\n[TEST 1] Testing Topic Classification Service...");
    const aptClass = TopicClassificationService.classifyTopic("Aptitude");
    const dbmsClass = TopicClassificationService.classifyTopic("DBMS");
    const pyClass = TopicClassificationService.classifyTopic("Python");

    console.log("✓ Aptitude Category:", aptClass.category);
    console.log("✓ DBMS Category:", dbmsClass.category);
    console.log("✓ Python Category:", pyClass.category);

    if (aptClass.category !== "placement_preparation") {
      throw new Error("Aptitude classification failed!");
    }

    // 2. Test Research Provider & Source Quality
    console.log("\n[TEST 2] Testing Learning Roadmap Research Service...");
    const aptResearch = await LearningRoadmapResearchService.researchTopic("Aptitude");
    console.log("✓ Aptitude Research Confidence:", aptResearch.confidence);
    console.log("✓ Sources Count:", aptResearch.sources?.length);
    console.log("✓ First Source Title:", aptResearch.sources?.[0]?.title);

    if (!aptResearch.sources || aptResearch.sources.length === 0) {
      throw new Error("Research service must return reliable sources!");
    }

    // 3. Test Deterministic Priority Engine
    console.log("\n[TEST 3] Testing Deterministic Priority Engine...");
    const priority1 = RoadmapPriorityService.calculateTopicPriority({
      topicName: "Percentages",
      category: "placement_preparation",
      difficulty: "BEGINNER"
    });
    console.log("✓ Percentages Priority:", priority1.priority, `(Score: ${priority1.priorityScore})`);

    if (priority1.priorityScore < 60) {
      throw new Error("Percentages in Aptitude must have HIGH or CRITICAL priority!");
    }

    // 4. Test Study Time Estimator
    console.log("\n[TEST 4] Testing Study Time Estimator Service...");
    const timeEst = StudyTimeEstimatorService.estimateTopicTime({
      difficulty: "BEGINNER",
      priority: "CRITICAL"
    });
    console.log("✓ Concept Hours:", timeEst.conceptHours);
    console.log("✓ Practice Hours:", timeEst.practiceHours);
    console.log("✓ Total Hours:", timeEst.totalHours);
    console.log("✓ Recommended Questions:", timeEst.recommendedQuestions);

    if (timeEst.totalHours < 4) {
      throw new Error("Total estimated hours calculation error!");
    }

    // 5. Test Full Roadmap Generator (Aptitude)
    console.log("\n[TEST 5] Generating Full Aptitude Roadmap...");
    const aptRoadmap = await LearningRoadmapGeneratorService.generateRoadmap({
      topic: "Aptitude",
      level: "BEGINNER",
      goal: "PLACEMENT",
      hoursPerDay: 2
    });

    console.log("✓ Title:", aptRoadmap.title);
    console.log("✓ Sections Count:", aptRoadmap.sections?.length);
    console.log("✓ Total Estimated Hours:", aptRoadmap.totalEstimatedHours);
    console.log("✓ Estimated Weeks:", aptRoadmap.estimatedWeeks);
    console.log("✓ Daily Plans Count:", aptRoadmap.dailyPlans?.length);
    console.log("✓ Weekly Plans Count:", aptRoadmap.weeklyPlans?.length);

    if (!aptRoadmap.sections || aptRoadmap.sections.length === 0) {
      throw new Error("Generated roadmap must contain sections and topics!");
    }

    // 6. Test DBMS Roadmap Generation
    console.log("\n[TEST 6] Generating DBMS Roadmap...");
    const dbmsRoadmap = await LearningRoadmapGeneratorService.generateRoadmap({
      topic: "DBMS",
      level: "BEGINNER",
      goal: "PLACEMENT",
      hoursPerDay: 2
    });
    console.log("✓ DBMS Roadmap Title:", dbmsRoadmap.title);
    console.log("✓ DBMS Sections:", dbmsRoadmap.sections?.map(s => s.title));

    // Assert that Aptitude and DBMS roadmaps are genuinely different
    if (aptRoadmap.title === dbmsRoadmap.title || aptRoadmap.sections[0].title === dbmsRoadmap.sections[0].title) {
      throw new Error("Aptitude and DBMS roadmaps must be genuinely different!");
    }

    console.log("\n✅ ALL LEARNING ROADMAP GENERATOR ACCEPTANCE TESTS PASSED!");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ ACCEPTANCE TEST FAILED:", err.message);
    process.exit(1);
  }
}

runAcceptanceTests();
