/**
 * backend/services/quizAI/DifficultyEngine.js
 *
 * Balances difficulty distribution across session questions:
 * E.g., 10 questions -> 3 Easy, 4 Medium, 3 Hard
 */

function balanceDifficulty(questions = [], targetCount = 10) {
  if (!questions || questions.length === 0) return [];

  const easy = [];
  const medium = [];
  const hard = [];

  for (const q of questions) {
    const diff = String(q.difficulty || "").toLowerCase();
    if (diff === "easy") easy.push(q);
    else if (diff === "hard") hard.push(q);
    else medium.push(q);
  }

  // Calculate target breakdown
  const targetEasyCount = Math.max(1, Math.floor(targetCount * 0.3));
  const targetHardCount = Math.max(1, Math.floor(targetCount * 0.3));
  const targetMediumCount = targetCount - targetEasyCount - targetHardCount;

  const balanced = [];
  
  // Add available Easy
  balanced.push(...easy.slice(0, targetEasyCount));
  // Add available Medium
  balanced.push(...medium.slice(0, targetMediumCount));
  // Add available Hard
  balanced.push(...hard.slice(0, targetHardCount));

  // If still below targetCount, add remaining questions from any difficulty
  const remaining = questions.filter(q => !balanced.includes(q));
  while (balanced.length < targetCount && remaining.length > 0) {
    balanced.push(remaining.shift());
  }

  // Ensure every question has difficulty normalized
  return balanced.map((q, idx) => {
    let diff = q.difficulty ? String(q.difficulty).toLowerCase() : "medium";
    if (idx < targetEasyCount) diff = "easy";
    else if (idx >= targetCount - targetHardCount) diff = "hard";
    else diff = "medium";
    return { ...q, difficulty: diff };
  });
}

module.exports = {
  balanceDifficulty
};
