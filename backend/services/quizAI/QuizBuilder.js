/**
 * backend/services/quizAI/QuizBuilder.js
 *
 * Assembles the immutable, balanced quiz question set using QuestionRetriever, QuestionGenerator, QuestionValidator, and DifficultyEngine.
 */

const { normalizeTopic } = require("./TopicNormalizer");
const { retrieveQuestions } = require("./QuestionRetriever");
const { generateAIQuestions } = require("./QuestionGenerator");
const { filterAndValidateQuestions } = require("./QuestionValidator");
const { balanceDifficulty } = require("./DifficultyEngine");

async function buildQuiz({ topic, subtopic, questionCount = 10, difficulty = "mixed" }) {
  const norm = normalizeTopic(topic, subtopic);
  const targetCount = Math.max(3, Math.min(20, Number(questionCount) || 10));

  console.log(`[QuizAI] Building quiz for "${norm.normalizedTopic}" — "${norm.normalizedSubtopic}" (${targetCount} questions)`);

  // Step 1: Retrieve existing questions from SeedMaster
  let retrieved = await retrieveQuestions({
    normalizedTopic: norm.normalizedTopic,
    normalizedSubtopic: norm.normalizedSubtopic,
    domainId: norm.domainId,
    branch: norm.branch,
    targetCount
  });

  // Step 2: Calculate shortage
  const shortage = targetCount - retrieved.length;

  if (shortage > 0) {
    console.log(`[QuizAI] Shortage of ${shortage} questions. Invoking AI Question Generator fallback...`);
    const aiQuestions = await generateAIQuestions({
      topic: norm.normalizedTopic,
      subtopic: norm.normalizedSubtopic,
      difficulty: difficulty === "mixed" ? "medium" : difficulty,
      numberOfQuestions: shortage,
      domainId: norm.domainId
    });
    retrieved = [...retrieved, ...aiQuestions];
  }

  // Step 3: Validate questions
  const validated = filterAndValidateQuestions(retrieved);

  // Step 4: Balance difficulty
  const balanced = balanceDifficulty(validated, targetCount);

  // Step 5: Ensure exact count
  const finalQuestions = balanced.slice(0, targetCount);

  console.log(`[QuizAI] Quiz build complete. Final Question Count: ${finalQuestions.length}`);

  return {
    normalizedTopic: norm.normalizedTopic,
    normalizedSubtopic: norm.normalizedSubtopic,
    domainId: norm.domainId,
    domainName: norm.domainName,
    branch: norm.branch,
    questions: finalQuestions,
    questionIds: finalQuestions.map(q => q._id || q.questionId),
    totalQuestions: finalQuestions.length
  };
}

module.exports = {
  buildQuiz
};
