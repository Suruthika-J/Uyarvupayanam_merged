const mongoose = require("mongoose");
const AhpFuzzyQuestion = require("../models/AhpFuzzyQuestion");

async function checkCloudQuestions() {
  await mongoose.connect("mongodb://localhost:27017/uyarvu-payanam");
  const questions = await AhpFuzzyQuestion.find({
    $or: [
      { domainId: "cloud_devops" },
      { domain: "cloud_devops" }
    ]
  }).select("questionId questionText options source").lean();

  console.log(`Found ${questions.length} total Cloud DevOps questions in MongoDB:\n`);
  questions.forEach((q, idx) => {
    console.log(`Q${idx + 1} [${q.questionId}] (Source: ${q.source || "legacy"}):`);
    console.log(`  Text: "${q.questionText}"`);
    console.log(`  Option A: "${q.options[0]?.text}"`);
    console.log(`  Option B: "${q.options[1]?.text}"\n`);
  });

  process.exit(0);
}

checkCloudQuestions();
