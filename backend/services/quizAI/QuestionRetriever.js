/**
 * backend/services/quizAI/QuestionRetriever.js
 *
 * Implements question retrieval hierarchy against SeedMaster / AhpFuzzyQuestion / CseSkillQuestion:
 * 1. Exact topic + subtopic
  2. Topic + related subtopic
  3. Topic
  4. Branch/domain related questions
 */

const AhpFuzzyQuestion = require("../../models/AhpFuzzyQuestion");
const CseSkillQuestion = require("../../models/CseSkillQuestion");

async function retrieveQuestions({ normalizedTopic, normalizedSubtopic, domainId, branch = "CSE", targetCount = 10 }) {
  console.log(`[QuizAI] Retrieving questions for topic: "${normalizedTopic}", subtopic: "${normalizedSubtopic}" (domainId: ${domainId})`);

  const resultsMap = new Map();

  // Helper to add questions preventing duplicates
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
    // Priority 1: Exact topic + subtopic
    const p1Docs = await AhpFuzzyQuestion.find({
      active: true,
      $and: [
        { $or: [{ domainId }, { domain: domainId }, { category: new RegExp(normalizedTopic, "i") }] },
        { $or: [{ questionText: new RegExp(normalizedSubtopic, "i") }, { category: new RegExp(normalizedSubtopic, "i") }] }
      ]
    }).lean();
    addQuestions(p1Docs, "P1_EXACT");

    // Priority 2: Topic + related subtopics
    if (resultsMap.size < targetCount) {
      const p2Docs = await AhpFuzzyQuestion.find({
        active: true,
        $or: [
          { domainId },
          { domain: domainId },
          { domainName: new RegExp(normalizedTopic, "i") }
        ]
      }).lean();
      addQuestions(p2Docs, "P2_TOPIC_RELATED");
    }

    // Priority 3: General Domain/Topic in CseSkillQuestion
    if (resultsMap.size < targetCount && CseSkillQuestion) {
      const p3Docs = await CseSkillQuestion.find({
        active: true,
        $or: [
          { domain: new RegExp(normalizedTopic, "i") },
          { subskill: new RegExp(normalizedSubtopic, "i") }
        ]
      }).limit(targetCount).lean();
      addQuestions(p3Docs, "P3_SKILL_BANK");
    }

    // Priority 4: Branch/Domain Fallback (all CSE master questions)
    if (resultsMap.size < targetCount) {
      const p4Docs = await AhpFuzzyQuestion.find({ active: true })
        .limit(targetCount * 2)
        .lean();
      addQuestions(p4Docs, "P4_BRANCH_FALLBACK");
    }

  } catch (err) {
    console.error("[QuizAI] Error during QuestionRetriever DB search:", err.message);
  }

  const retrievedQuestions = Array.from(resultsMap.values());
  console.log(`[QuizAI] Questions found in SeedMaster/Question Bank: ${retrievedQuestions.length}`);
  return retrievedQuestions;
}

module.exports = {
  retrieveQuestions
};
