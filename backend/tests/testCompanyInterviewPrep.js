/**
 * testCompanyInterviewPrep.js
 * Verification test script for Company-Based Interview Intelligence System
 */

const mongoose = require("mongoose");
const CompanyResearchService = require("../services/CompanyResearchService");
const CompanySpecificQuestionGenerator = require("../services/CompanySpecificQuestionGenerator");

async function runAcceptanceTests() {
  console.log("=== STARTING COMPANY INTERVIEW PREP ACCEPTANCE TESTS ===");

  try {
    // Connect DB if needed (or test service logic in-memory / fallback)
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/uyarvupayanam";
    await mongoose.connect(mongoUri).catch(() => console.log("MongoDB local connection skipped for dry run testing."));

    // 1. Test Amazon Research
    console.log("\n[TEST 1] Testing Amazon Research...");
    const amazonResearch = await CompanyResearchService.researchCompany({
      companyName: "Amazon",
      role: "Software Engineer",
      hiringType: "Full-Time"
    });
    console.log("✓ Amazon Research Confidence:", amazonResearch.researchConfidence);
    console.log("✓ Official Sources Count:", amazonResearch.officialSources?.length);
    console.log("✓ Candidate Sources Count:", amazonResearch.candidateSources?.length);
    console.log("✓ Normalized Rounds Count:", amazonResearch.rounds?.length);
    console.log("✓ Reported Variations:", amazonResearch.reportedVariations?.map(v => v.variationName));
    console.log("✓ Topic Patterns:", amazonResearch.topicPatterns?.map(t => `${t.topic}: ${t.percentage}%`));

    // Assert strict classifications
    if (amazonResearch.researchConfidence !== "HIGH") {
      throw new Error("Amazon research confidence should be HIGH!");
    }
    if (!amazonResearch.officialSources.some(s => s.sourceType === "official")) {
      throw new Error("Amazon must classify official career sources!");
    }

    // 2. Test Accenture Research
    console.log("\n[TEST 2] Testing Accenture Research...");
    const accentureResearch = await CompanyResearchService.researchCompany({
      companyName: "Accenture",
      role: "Software Engineer",
      hiringType: "Campus"
    });
    console.log("✓ Accenture Research Confidence:", accentureResearch.researchConfidence);
    console.log("✓ Most Reported Pattern:", accentureResearch.mostReportedPattern);

    // 3. Test Unknown Company (Limited info fallback handling)
    console.log("\n[TEST 3] Testing Unknown Company Fallback...");
    const unknownResearch = await CompanyResearchService.researchCompany({
      companyName: "Obscure Unknown Startup Inc",
      role: "Software Engineer",
      hiringType: "Full-Time"
    });
    console.log("✓ Unknown Company Confidence:", unknownResearch.researchConfidence);
    console.log("✓ Confidence Reason:", unknownResearch.confidenceReason);

    if (unknownResearch.researchConfidence !== "LOW") {
      throw new Error("Unknown company research confidence should be LOW!");
    }

    // 4. Test AI Question Generator
    console.log("\n[TEST 4] Testing AI Question Generator...");
    const generatedQuestions = await CompanySpecificQuestionGenerator.generateQuestions({
      companyName: "Amazon",
      role: "Software Engineer",
      hiringType: "Full-Time",
      difficulty: "Medium",
      category: "Technical",
      questionCount: 3,
      research: amazonResearch
    });

    console.log("✓ Generated Questions Count:", generatedQuestions.length);
    console.log("✓ Question 1 Label:", generatedQuestions[0].label);
    console.log("✓ Question 1 isAiGenerated:", generatedQuestions[0].isAiGenerated);
    console.log("✓ Pattern Source:", generatedQuestions[0].patternSource);

    if (generatedQuestions[0].label !== "🤖 AI-GENERATED PRACTICE") {
      throw new Error("Generated questions MUST have label '🤖 AI-GENERATED PRACTICE'!");
    }
    if (generatedQuestions[0].isAiGenerated !== true) {
      throw new Error("Generated questions MUST have isAiGenerated === true!");
    }

    console.log("\n✅ ALL ACCEPTANCE TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ ACCEPTANCE TEST FAILED:", err.message);
    process.exit(1);
  }
}

runAcceptanceTests();
