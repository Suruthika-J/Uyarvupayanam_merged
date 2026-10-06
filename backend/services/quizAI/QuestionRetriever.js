/**
 * backend/services/quizAI/QuestionRetriever.js
 *
 * Implements topic-strict question retrieval hierarchy against SeedMaster / AhpFuzzyQuestion / CseSkillQuestion:
 * 1. Exact topic + subtopic matching
 * 2. Exact topic / domainId matching
 * 3. Topic matching in CseSkillQuestion bank
 *
 * NEVER falls back to untagged random topics (DBMS, etc.).
 */

const AhpFuzzyQuestion = require("../../models/AhpFuzzyQuestion");
const CseSkillQuestion = require("../../models/CseSkillQuestion");

function escapeRegExp(string = "") {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function retrieveQuestions({ normalizedTopic, normalizedSubtopic, domainId, branch = "CSE", targetCount = 10 }) {
  console.log(`[QuizAI] Retrieving questions strictly for topic: "${normalizedTopic}" (domainId: ${domainId})`);

  const resultsMap = new Map();
  const safeTopic = escapeRegExp(normalizedTopic);
  const safeDomain = escapeRegExp(domainId);
  const topicRegex = new RegExp(`^${safeTopic}$|\\b${safeDomain}\\b`, "i");

  // Helper to add questions preventing duplicates and cross-topic leakage
  const addQuestions = (qList, priorityLevel) => {
    for (const q of qList) {
      const qIdStr = q._id.toString();
      if (!resultsMap.has(qIdStr)) {
        resultsMap.set(qIdStr, {
          ...q,
          priorityLevel,
          sourceType: q.sourceType || (q.source === "master-question-bank-pdf" ? "SEEDMASTER" : "QUESTION_BANK")
        });
      }
      if (resultsMap.size >= targetCount * 2) break;
    }
  };

  try {
    // Priority 1: Exact topic + subtopic in AhpFuzzyQuestion
    const p1Docs = await AhpFuzzyQuestion.find({
      active: true,
      $and: [
        { $or: [{ domainId }, { domain: domainId }, { category: topicRegex }, { domainName: topicRegex }] }
      ]
    }).lean();
    addQuestions(p1Docs, "P1_EXACT_TOPIC");

    // Priority 2: Topic in CseSkillQuestion bank
    if (resultsMap.size < targetCount && CseSkillQuestion) {
      const p2Docs = await CseSkillQuestion.find({
        active: true,
        $or: [
          { domain: topicRegex },
          { subskill: topicRegex }
        ]
      }).limit(targetCount).lean();
      addQuestions(p2Docs, "P2_SKILL_BANK");
    }

  } catch (err) {
    console.error("[QuizAI] Error during QuestionRetriever DB search:", err.message);
  }

  const retrievedQuestions = Array.from(resultsMap.values());
  console.log(`[QUESTION BANK] topicId = ${domainId}, requested = ${targetCount}, returned = ${retrievedQuestions.length}`);
  return retrievedQuestions;
}

module.exports = {
  retrieveQuestions
};
