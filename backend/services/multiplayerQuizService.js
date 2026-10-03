const AhpFuzzyQuestion = require("../models/AhpFuzzyQuestion");
const CseSkillQuestion = require("../models/CseSkillQuestion");

/**
 * Maps invite topic / subtopic strings to domain IDs in AhpFuzzyQuestion or CseSkillQuestion
 */
function normalizeDomain(topic = "", subtopic = "") {
  const text = `${topic} ${subtopic}`.toLowerCase();

  if (/\b(dbms|database|sql|queries|normalization|tables|indexing)\b/.test(text)) {
    return { domainId: "dbms", domainName: "Database Management Systems", cseDomain: "Full-Stack Web & Software" };
  }
  if (/\b(dsa|data structure|algorithm|trees|graphs|arrays|sorting|recursion)\b/.test(text)) {
    return { domainId: "data_structures", domainName: "Data Structures & Algorithms", cseDomain: "Algorithms & Data Structures" };
  }
  if (/\b(cyber|security|hacking|network|firewall|encryption|cia|xss|sql injection)\b/.test(text)) {
    return { domainId: "cyber_security", domainName: "Cyber Security & Ethical Hacking", cseDomain: "Cybersecurity & DevSecOps" };
  }
  if (/\b(ai|ml|machine learning|python|pandas|neural|deep learning)\b/.test(text)) {
    return { domainId: "ai_ml", domainName: "Artificial Intelligence & Machine Learning", cseDomain: "Artificial Intelligence & ML" };
  }
  if (/\b(web|react|node|javascript|frontend|backend|express|html|css)\b/.test(text)) {
    return { domainId: "web_dev", domainName: "Web Development & Software Engineering", cseDomain: "Full-Stack Web & Software" };
  }
  if (/\b(cloud|devops|aws|docker|kubernetes|ci\/cd)\b/.test(text)) {
    return { domainId: "cloud_devops", domainName: "Cloud Computing & DevOps", cseDomain: "Cloud Computing & DevOps" };
  }

  return { domainId: "general_cs", domainName: "Computer Science Core", cseDomain: "Full-Stack Web & Software" };
}

/**
 * Retrieve questions from SeedMaster question bank
 */
async function selectQuizQuestions({ topic, subtopic, count = 10 }) {
  const norm = normalizeDomain(topic, subtopic);
  const targetCount = Math.max(3, Math.min(20, count));

  // 1. Search in AhpFuzzyQuestion (PDF SeedMaster Bank)
  let fuzzyQuestions = await AhpFuzzyQuestion.find({
    active: true,
    $or: [
      { domainId: norm.domainId },
      { domain: norm.domainId },
      { domainName: new RegExp(topic, "i") },
      { questionText: new RegExp(subtopic, "i") }
    ]
  }).lean();

  // If not enough specific questions, pull any active AhpFuzzyQuestions
  if (fuzzyQuestions.length < targetCount) {
    const additional = await AhpFuzzyQuestion.find({ active: true })
      .limit(targetCount * 2)
      .lean();
    const existingIds = new Set(fuzzyQuestions.map(q => q._id.toString()));
    additional.forEach(q => {
      if (!existingIds.has(q._id.toString())) {
        fuzzyQuestions.push(q);
      }
    });
  }

  // Shuffle array using Fisher-Yates
  const shuffled = [...fuzzyQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const selected = shuffled.slice(0, targetCount);
  return selected;
}

/**
 * Sanitize question for client view (strip correctOption & explanation)
 */
function sanitizeQuestionForClient(qDoc, questionIndex, totalQuestions) {
  const options = (qDoc.options || []).map(opt => ({
    id: opt.id || opt.optionId || String(opt._id),
    text: opt.text
  }));

  return {
    questionId: qDoc._id,
    questionIndex,
    totalQuestions,
    questionText: qDoc.questionText,
    options,
    domainName: qDoc.domainName || "Computer Science",
    difficulty: qDoc.difficulty || "medium"
  };
}

/**
 * Server-side evaluation of submitted answer
 */
function evaluateAnswer(qDoc, selectedOption, remainingTimeRatio = 0.5) {
  const correctOption = String(qDoc.correctOption || "").trim().toUpperCase();
  const userOption = String(selectedOption || "").trim().toUpperCase();

  // Match by option letter ("A", "B", "C", "D") or option text
  let isCorrect = false;
  if (correctOption && userOption === correctOption) {
    isCorrect = true;
  } else if (qDoc.options) {
    const correctOptObj = qDoc.options.find(opt => opt.id === correctOption || opt.isCorrect);
    const userOptObj = qDoc.options.find(opt => opt.id === userOption || opt.text === selectedOption);
    if (correctOptObj && userOptObj && (correctOptObj.id === userOptObj.id || correctOptObj.text === userOptOptObj?.text)) {
      isCorrect = true;
    }
  }

  const baseScore = 100;
  const speedBonus = isCorrect ? Math.max(0, Math.round(20 * Math.min(1, Math.max(0, remainingTimeRatio)))) : 0;
  const score = isCorrect ? baseScore + speedBonus : 0;

  return {
    isCorrect,
    score,
    correctOption,
    explanation: qDoc.explanation || "No explanation provided."
  };
}

module.exports = {
  normalizeDomain,
  selectQuizQuestions,
  sanitizeQuestionForClient,
  evaluateAnswer
};
