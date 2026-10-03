/**
 * backend/services/quizAI/QuizAIEngine.js
 *
 * Main Quiz AI Engine entry point.
 * Orchestrates quiz creation (QuestionRetriever -> QuestionGenerator -> QuestionValidator -> DifficultyEngine -> QuizBuilder)
 * and post-quiz AI performance analysis.
 */

const { buildQuiz } = require("./QuizBuilder");
const { calculateQuestionScore } = require("./QuizScoringEngine");

async function createQuiz(params = {}) {
  console.log("[QuizAIEngine] Pipeline Initiated: Creating Quiz", params);
  const quizData = await buildQuiz(params);
  return quizData;
}

async function analyzePerformance({ userId, topic, subtopic, answers = [], correctCount = 0, totalQuestions = 10 }) {
  console.log(`[QuizAIEngine] Analyzing post-quiz performance for user: ${userId} in ${topic} — ${subtopic}`);

  const accuracy = Math.round((correctCount / Math.max(1, totalQuestions)) * 100);

  let strengths = [];
  let weaknesses = [];
  let recommendation = "";

  if (accuracy >= 80) {
    strengths = ["Core Concepts & Syntax", "Standard Queries & Logic", "Problem Solving"];
    weaknesses = ["Edge-case Optimization"];
    recommendation = `Outstanding performance (${accuracy}%)! You have mastered ${subtopic || topic}. Ready for advanced topics.`;
  } else if (accuracy >= 50) {
    strengths = ["Basic Terminology", "Standard Execution"];
    weaknesses = ["Nested Queries & Filtering Clauses (HAVING/GROUP BY)", "Complex Scenarios"];
    recommendation = `Solid foundation (${accuracy}%). Practice filtering clauses and multi-step logic before attempting advanced quizzes.`;
  } else {
    strengths = ["Fundamentals Overview"];
    weaknesses = ["Basic Syntax", "Query Construction", "HAVING & GROUP BY Clauses"];
    recommendation = `Review fundamental tutorials on ${topic} — ${subtopic}. Re-watch core concept lessons and attempt practice sets.`;
  }

  return {
    accuracy,
    strengths,
    weaknesses,
    recommendation
  };
}

module.exports = {
  createQuiz,
  analyzePerformance,
  calculateQuestionScore
};
