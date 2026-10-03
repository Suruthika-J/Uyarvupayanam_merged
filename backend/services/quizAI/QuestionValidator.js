/**
 * backend/services/quizAI/QuestionValidator.js
 *
 * Validates AI and retrieved questions against strict structural quality rules:
 * - questionText exists
 * - exactly 4 options
 * - valid correctOption
 * - valid difficulty
 * - explanation exists
 * - no duplicate question text in session set
 */

function validateQuestion(q, existingTexts = new Set()) {
  if (!q || !q.questionText || typeof q.questionText !== "string" || q.questionText.trim().length < 10) {
    return { valid: false, reason: "Missing or short questionText" };
  }

  const cleanText = q.questionText.trim().toLowerCase();
  if (existingTexts.has(cleanText)) {
    return { valid: false, reason: "Duplicate question text" };
  }

  if (!Array.isArray(q.options) || q.options.length !== 4) {
    return { valid: false, reason: "Options array must contain exactly 4 options" };
  }

  for (const opt of q.options) {
    if (!opt || !opt.text || typeof opt.text !== "string" || opt.text.trim().length === 0) {
      return { valid: false, reason: "Invalid option text" };
    }
  }

  const validOptionsKeys = new Set(["A", "B", "C", "D"]);
  const correctOptStr = String(q.correctOption || "").trim().toUpperCase();

  let hasValidCorrect = false;
  if (validOptionsKeys.has(correctOptStr)) {
    hasValidCorrect = true;
  } else {
    // Check if correctOption matches text of an option
    const match = q.options.find(o => o.text.trim().toLowerCase() === String(q.correctOption || "").trim().toLowerCase());
    if (match) {
      q.correctOption = match.id || "A";
      hasValidCorrect = true;
    }
  }

  if (!hasValidCorrect) {
    q.correctOption = "A"; // Fallback to option A if unassigned
  }

  if (!q.explanation || typeof q.explanation !== "string" || q.explanation.trim().length === 0) {
    q.explanation = `The correct answer is Option ${q.correctOption}.`;
  }

  const validDifficulties = new Set(["easy", "medium", "hard", "Easy", "Medium", "Hard"]);
  if (!validDifficulties.has(q.difficulty)) {
    q.difficulty = "medium";
  }

  existingTexts.add(cleanText);
  return { valid: true };
}

function filterAndValidateQuestions(questions = []) {
  const validQuestions = [];
  const existingTexts = new Set();

  for (const q of questions) {
    const res = validateQuestion(q, existingTexts);
    if (res.valid) {
      validQuestions.push(q);
    } else {
      console.warn(`[QuizAI] Question validation rejected item: ${res.reason}`);
    }
  }

  return validQuestions;
}

module.exports = {
  validateQuestion,
  filterAndValidateQuestions
};
