/**
 * backend/services/quizAI/QuizScoringEngine.js
 *
 * Deterministic server-side scoring engine:
 * - Base score: 100 points for correct answer
 * - Speed bonus: max 20 points based on remaining time ratio
 * - Evaluates selectedOption vs qDoc.correctOption
 * - Never accepts client-calculated score
 */

function calculateQuestionScore(qDoc, selectedOption, remainingTimeRatio = 0.5) {
  if (!qDoc) {
    return { isCorrect: false, score: 0, correctOption: "A", explanation: "Question undefined." };
  }

  const correctOptKey = String(qDoc.correctOption || "A").trim().toUpperCase();
  const userOptStr = String(selectedOption || "").trim().toUpperCase();

  let isCorrect = false;

  // 1. Direct letter match ("A" === "A")
  if (userOptStr === correctOptKey) {
    isCorrect = true;
  } else if (Array.isArray(qDoc.options)) {
    // 2. Option ID or Option text match
    const correctOptObj = qDoc.options.find(o => String(o.id || "").toUpperCase() === correctOptKey || o.isCorrect);
    const userOptObj = qDoc.options.find(o => String(o.id || "").toUpperCase() === userOptStr || o.text === selectedOption);
    
    if (correctOptObj && userOptObj && (correctOptObj.id === userOptObj.id || correctOptObj.text === userOptObj.text)) {
      isCorrect = true;
    }
  }

  const baseScore = 100;
  const clampedRatio = Math.min(1, Math.max(0, remainingTimeRatio));
  const speedBonus = isCorrect ? Math.round(20 * clampedRatio) : 0;
  const score = isCorrect ? baseScore + speedBonus : 0;

  return {
    isCorrect,
    score,
    correctOption: correctOptKey,
    explanation: qDoc.explanation || `Correct answer is Option ${correctOptKey}.`
  };
}

module.exports = {
  calculateQuestionScore
};
