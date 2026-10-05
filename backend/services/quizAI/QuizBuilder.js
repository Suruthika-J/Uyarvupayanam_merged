/**
 * backend/services/quizAI/QuizBuilder.js
 *
 * Assembles the immutable, balanced quiz question set using QuestionRetriever, QuestionGenerator, QuestionValidator, and DifficultyEngine.
 * Enforces ZERO cross-topic contamination (e.g. C++ will NEVER contain DBMS questions).
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

  console.log(`[PEER-QUIZ]\nCreating session with topic:\n${norm.domainId} (${norm.normalizedTopic})`);

  // Step 1: Retrieve existing questions from SeedMaster/DB strictly matching topicId
  let retrieved = await retrieveQuestions({
    normalizedTopic: norm.normalizedTopic,
    normalizedSubtopic: norm.normalizedSubtopic,
    domainId: norm.domainId,
    branch: norm.branch,
    targetCount
  });

  // Strict Topic Filter: Remove any question whose domain/category doesn't match the target topicId
  retrieved = retrieved.filter(q => {
    if (!q) return false;
    const qDomain = String(q.domainId || q.domain || q.category || "").toLowerCase();
    const targetDomain = norm.domainId.toLowerCase();
    const targetLabel = norm.normalizedTopic.toLowerCase();
    
    // Check exact or valid regex match
    if (qDomain === targetDomain || qDomain === targetLabel) return true;
    if (targetDomain === "cpp" && (qDomain.includes("cpp") || qDomain.includes("c++") || qDomain.includes("cplusplus"))) return true;
    if (targetDomain === "sql" && (qDomain.includes("sql") || qDomain.includes("relational"))) return true;
    if (targetDomain === "dbms" && (qDomain.includes("dbms") || qDomain.includes("database"))) return true;
    if (targetDomain === "java" && qDomain.includes("java")) return true;
    if (targetDomain === "python" && qDomain.includes("python")) return true;
    if (targetDomain === "os" && (qDomain.includes("os") || qDomain.includes("operating"))) return true;
    if (targetDomain === "oops" && (qDomain.includes("oops") || qDomain.includes("object"))) return true;

    console.warn(`[PEER-QUIZ] REJECTED cross-topic question "${q.questionText?.substring(0, 40)}" (Domain: ${qDomain} !== ${targetDomain})`);
    return false;
  });

  // Step 2: Calculate shortage for exact topic
  const shortage = targetCount - retrieved.length;

  if (shortage > 0) {
    console.log(`[PEER-QUIZ]\nGenerating questions for:\n${norm.domainId} (${shortage} needed)`);
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

  // CRITICAL VALIDATION: Final assertion that no cross-topic question slipped through
  const invalidQuestions = finalQuestions.filter(q => {
    const qDom = String(q.domainId || q.domain || q.category || "").toLowerCase();
    if (norm.domainId === "cpp") return !qDom.includes("cpp") && !qDom.includes("c++") && qDom !== "cpp";
    if (norm.domainId === "sql") return !qDom.includes("sql") && qDom !== "sql";
    if (norm.domainId === "dbms") return !qDom.includes("dbms") && qDom !== "dbms";
    return false;
  });

  if (invalidQuestions.length > 0) {
    throw new Error(`[PEER-QUIZ ERROR] Topic mismatch detected: session topic=${norm.domainId}, invalid question count=${invalidQuestions.length}`);
  }

  console.log(`[PEER-QUIZ]\nSelected questions:\n${finalQuestions.map((q, i) => `${i+1}. [${q.domainId || norm.domainId}] ${q._id || q.questionId}`).join("\n")}`);

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
