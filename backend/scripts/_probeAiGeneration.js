// Focused probe: exercise live AI assessment generation OUTSIDE the HTTP
// server so we can see rejection reasons and the resulting question types.
// Run: node backend/scripts/_probeAiGeneration.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const seed = require("../seeders/seedEnglishMissions");
const { generateAssessmentQuestions } = require("../services/englishAiService");

async function main() {
  const topic = seed.englishTopicById("present-tenses");
  const area = seed.getEnglishAreas().find((a) => a.id === topic.areaId);
  const types = ["mcq", "true-false", "fill-in-the-blank", "sentence-correction"];
  console.log("Generating for", topic.name, "| types:", types.join(","));
  const t0 = Date.now();
  const qs = await generateAssessmentQuestions({ topic, area, count: 6, difficulty: "medium", types });
  console.log(`elapsed: ${Math.round((Date.now() - t0) / 1000)}s`);
  if (!qs) {
    console.log("RESULT: null (could not reach a full valid set)");
    process.exit(1);
  }
  const tally = {};
  for (const q of qs) tally[q.type] = (tally[q.type] || 0) + 1;
  console.log("RESULT: OK — types:", JSON.stringify(tally));
  for (const q of qs) {
    console.log(`  [${q.type}] ${q.question.slice(0, 90)} -> ${JSON.stringify(q.correctAnswer).slice(0, 60)}`);
  }
  process.exit(0);
}

main().catch((e) => { console.error("probe crashed:", e); process.exit(2); });