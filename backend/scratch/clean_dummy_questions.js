const mongoose = require("mongoose");
const AhpFuzzyQuestion = require("../models/AhpFuzzyQuestion");

async function cleanupDummyQuestions() {
  await mongoose.connect("mongodb://localhost:27017/uyarvu-payanam");
  console.log("Connected to MongoDB for Question Bank Cleanup...");

  // Find all questions containing "Primary optimal approach" or "Secondary standard approach"
  const dummyQuestions = await AhpFuzzyQuestion.find({
    $or: [
      { "options.text": { $regex: /Primary optimal approach/i } },
      { "options.text": { $regex: /Secondary standard approach/i } },
      { questionId: { $regex: /^[A-Z]+_[EMH]_\d+/ } }
    ]
  });

  console.log(`Found ${dummyQuestions.length} dummy/placeholder questions in MongoDB.`);

  if (dummyQuestions.length > 0) {
    const deleteRes = await AhpFuzzyQuestion.deleteMany({
      _id: { $in: dummyQuestions.map(q => q._id) }
    });
    console.log(`Successfully deleted ${deleteRes.deletedCount} dummy questions.`);
  }

  // Ensure seedPdfMasterQuestionBank runs fresh to restore all 105 authentic PDF questions
  const { seedPdfMasterQuestionBank } = require("../seeders/seedPdfMasterQuestionBank");
  await seedPdfMasterQuestionBank();

  const totalRemaining = await AhpFuzzyQuestion.countDocuments({ active: true });
  console.log(`Total authentic questions in MongoDB after cleanup: ${totalRemaining}`);

  // Print summary by domain
  const domains = await AhpFuzzyQuestion.distinct("domainId");
  console.log("\nAuthentic Questions Count by Domain:");
  for (const d of domains) {
    const count = await AhpFuzzyQuestion.countDocuments({ domainId: d, active: true });
    console.log(`  - ${d}: ${count} questions`);
  }

  process.exit(0);
}

cleanupDummyQuestions();
