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
  if (!topic) {
    throw new Error("Multiplayer quiz topic is missing from study invite");
  }

  const norm = normalizeTopic(topic, subtopic);
  const targetCount = Math.max(3, Math.min(20, Number(questionCount) || 10));

  console.log(`[QUIZ SESSION] topicId: ${norm.domainId}, topicLabel: ${norm.normalizedTopic}`);

  // Step 1: Retrieve existing questions from SeedMaster/DB
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
    console.log(`[QuizAI] Shortage of ${shortage} questions for topic "${norm.normalizedTopic}". Invoking topic-specific AI Question Generator...`);
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

  console.log(`[QUESTIONS SELECTED] topicId: ${norm.domainId}, count: ${finalQuestions.length}`);

  return {
    topicId: norm.domainId,
    topicLabel: norm.normalizedTopic,
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
