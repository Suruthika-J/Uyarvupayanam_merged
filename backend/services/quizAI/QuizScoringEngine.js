/**
 * backend/services/quizAI/QuizScoringEngine.js
 *
 * Deterministic server-side gamified scoring engine:
 * - Base score: 100 XP for correct answer, 0 for incorrect/unanswered
 * - Speed bonus: max +50 XP based on server-calculated remaining time ratio
 * - Difficulty bonus: Easy = +0, Medium = +20, Hard = +40 XP
 * - Streak bonus: Streak 1-2 = +0, Streak 3 = +10, Streak 4 = +15, Streak 5+ = +20 XP
 * - Max score per question: 210 XP (100 base + 50 speed + 40 hard + 20 streak)
 * - Evaluates selectedOption vs qDoc.correctOption on server
 */

function calculateQuestionScore({
  qDoc,
  selectedOption,
  responseTimeMs = 0,
  questionTimeoutSeconds = 45,
  currentStreak = 0
}) {
  if (!qDoc) {
    return {
      isCorrect: false,
      basePoints: 0,
      speedBonus: 0,
      difficultyBonus: 0,
      streakBonus: 0,
      totalPoints: 0,
      score: 0,
      newStreak: 0,
      correctOption: "A",
      explanation: "Question undefined."
    };
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

  if (!isCorrect) {
    return {
      isCorrect: false,
      basePoints: 0,
      speedBonus: 0,
      difficultyBonus: 0,
      streakBonus: 0,
      totalPoints: 0,
      score: 0,
      newStreak: 0,
      correctOption: correctOptKey,
      explanation: qDoc.explanation || `Correct answer is Option ${correctOptKey}.`
    };
  }

  // Calculate Base Points
  const basePoints = 100;

  // Calculate Speed Bonus (Max 50 XP)
  const maxMs = (Number(questionTimeoutSeconds) || 45) * 1000;
  const elapsedMs = Math.min(maxMs, Math.max(0, Number(responseTimeMs) || 0));
  const remainingMs = maxMs - elapsedMs;
  const timeRatio = Math.min(1, Math.max(0, remainingMs / maxMs));
  const speedBonus = Math.round(50 * timeRatio);

  // Calculate Difficulty Bonus (Easy: 0, Medium: 20, Hard: 40)
  const diffStr = String(qDoc.difficulty || "medium").toLowerCase();
  let difficultyBonus = 20; // default medium
  if (diffStr.includes("easy")) difficultyBonus = 0;
  else if (diffStr.includes("hard")) difficultyBonus = 40;

  // Calculate Streak Bonus (Streak 1-2: 0, Streak 3: 10, Streak 4: 15, Streak 5+: 20)
  const newStreak = currentStreak + 1;
  let streakBonus = 0;
  if (newStreak >= 5) streakBonus = 20;
  else if (newStreak === 4) streakBonus = 15;
  else if (newStreak === 3) streakBonus = 10;

  const totalPoints = basePoints + speedBonus + difficultyBonus + streakBonus;

  return {
    isCorrect: true,
    basePoints,
    speedBonus,
    difficultyBonus,
    streakBonus,
    totalPoints,
    score: totalPoints, // legacy field compatibility
    newStreak,
    correctOption: correctOptKey,
    explanation: qDoc.explanation || `Correct answer is Option ${correctOptKey}.`
  };
}

module.exports = {
  calculateQuestionScore
};
