/**
 * Adaptive Mamdani Fuzzy Logic & Career Compatibility Engine
 *
 * 1. Processes student answers from domain-specific question banks into skill variable membership degrees (LOW, MEDIUM, HIGH).
 * 2. Incorporates difficulty weights (Easy = 1.0, Medium = 1.5, Hard = 2.0).
 * 3. Evaluates direct option fuzzy mappings and Mamdani Fuzzy Rules to calculate domain suitability.
 * 4. Combines AHP Interest Signals (40%) and Fuzzy Suitability Scores (60%) via compatibilityConfig.js.
 */

const { DOMAIN_FUZZY_RULES, SKILL_VARIABLES } = require("../config/fuzzyRulesConfig");
const COMPATIBILITY_CONFIG = require("../config/compatibilityConfig");
const { NORMALIZED_DOMAINS } = require("../config/domainMappingConfig");

// Difficulty multiplier mapping (PART 5)
const DIFFICULTY_WEIGHTS = {
  easy: 1.0,
  Easy: 1.0,
  medium: 1.5,
  Medium: 1.5,
  hard: 2.0,
  Hard: 2.0
};

// Convert raw skill mappings (HIGH, MEDIUM, LOW) into numerical values [0.1, 1.0]
const DEGREE_TO_NUM = {
  HIGH: 0.90,
  MEDIUM: 0.60,
  LOW: 0.30
};

/**
 * Fuzzifies skill variable values into LOW, MEDIUM, HIGH membership functions (PART 6)
 */
const fuzzifySkillDegree = (val = 0.5) => {
  const x = Math.max(0.1, Math.min(1.0, val));
  const low = Math.max(0, Math.min(1, (0.5 - x) / 0.4));
  const medium = Math.max(0, Math.min((x - 0.2) / 0.3, (0.8 - x) / 0.3));
  const high = Math.max(0, Math.min(1, (x - 0.5) / 0.4));
  return { low, medium, high };
};

/**
 * Defuzzifies membership degrees via Center of Gravity (CoG)
 */
const defuzzifyCoG = (memberships) => {
  const lowCentroid = 0.30;
  const medCentroid = 0.60;
  const highCentroid = 0.90;

  const num = (memberships.low * lowCentroid) + (memberships.medium * medCentroid) + (memberships.high * highCentroid);
  const den = (memberships.low + memberships.medium + memberships.high) || 1.0;
  return num / den;
};

/**
 * Evaluates behavioral signals into behavioral features
 */
function processBehavioralSignals(userAnswers = [], behavioralSignals = {}) {
  const totalAnswers = userAnswers.length;
  const avgResponseTimeMs = userAnswers.reduce((sum, a) => sum + (Number(a.responseTimeMs) || 4000), 0) / (totalAnswers || 1);
  const answerChangesCount = Number(behavioralSignals.answerChanges) || 0;
  const skippedCount = Number(behavioralSignals.skippedQuestions) || 0;

  return {
    fast_response: avgResponseTimeMs < 5000,
    high_persistence: skippedCount === 0 && totalAnswers >= 3,
    high_exploration: totalAnswers >= 5,
    medium_decision_stability: answerChangesCount <= 2
  };
}

/**
 * Core Adaptive Mamdani Fuzzy Evaluation Engine
 */
function evaluateAdaptiveFuzzy({
  userAnswers = [],
  questions = [],
  ahpPriorityWeights = {},
  behavioralSignals = {}
}) {
  // Initialize accumulators for skill variables
  const skillScores = {};
  const skillCounts = {};
  SKILL_VARIABLES.forEach(v => {
    skillScores[v] = 0;
    skillCounts[v] = 0;
  });

  // Candidate domains list from AHP priority weights
  const candidateDomainKeys = Object.keys(ahpPriorityWeights);
  const domainKeysToEvaluate = candidateDomainKeys.length > 0
    ? candidateDomainKeys
    : ["full_stack", "ai_ml"];

  // Map user answers by questionId or questionNumber
  const answerMap = new Map();
  userAnswers.forEach(a => {
    const key = a.questionId || (a._id ? a._id.toString() : null) || Number(a.questionNumber);
    if (key) answerMap.set(key, a.selectedOption || a.optionId);
  });

  // Track domain-wise weighted response contributions (PART 4 & 5)
  const domainWeightedSum = {};
  const domainMaxWeightSum = {};
  domainKeysToEvaluate.forEach(d => {
    domainWeightedSum[d] = 0;
    domainMaxWeightSum[d] = 0;
  });

  questions.forEach(q => {
    const qKey = q.questionId || (q._id ? q._id.toString() : null) || Number(q.questionNumber);
    const selectedOptId = answerMap.get(qKey) || answerMap.get(q.questionId) || answerMap.get(q._id ? q._id.toString() : "");
    if (!selectedOptId) return;

    const opt = (q.options || []).find(o => o.optionId === selectedOptId || o.id === selectedOptId);
    if (!opt) return;

    // PART 5: Get difficulty weight (Easy=1.0, Medium=1.5, Hard=2.0)
    const diffWeight = DIFFICULTY_WEIGHTS[q.difficulty] || 1.0;

    // Process skill mappings for Mamdani fuzzification
    const mappings = opt.skillMappings || {};
    Object.entries(mappings).forEach(([varName, degree]) => {
      if (skillScores[varName] !== undefined) {
        const numVal = typeof degree === "number" ? degree : (DEGREE_TO_NUM[degree] || 0.5);
        skillScores[varName] += numVal * diffWeight;
        skillCounts[varName] += diffWeight;
      }
    });

    // Process domain-wise fuzzy impact / contribution
    domainKeysToEvaluate.forEach(dKey => {
      let impact = 0.5; // base contribution

      // 1. Direct fuzzyImpact on option
      if (opt.fuzzyImpact) {
        const impMap = opt.fuzzyImpact instanceof Map ? Object.fromEntries(opt.fuzzyImpact) : opt.fuzzyImpact;
        if (impMap[dKey] !== undefined) {
          impact = Number(impMap[dKey]);
        }
      }

      // 2. Direct question domain matching fallback
      const qDomain = q.domainId || q.domain;
      if (qDomain === dKey || NORMALIZED_DOMAINS[qDomain]?.id === dKey) {
        // If student chose an option for this domain's question, increase impact
        impact = Math.max(impact, opt.fuzzyIntensity ? opt.fuzzyIntensity / 10 : 0.8);
      }

      // PART 5: weighted_response = fuzzy_response_strength * difficulty_weight
      domainWeightedSum[dKey] += impact * diffWeight;
      domainMaxWeightSum[dKey] += diffWeight;
    });
  });

  // Compute average skill variable values [0.1, 1.0] and fuzzify
  const skillValues = {};
  const skillMemberships = {};
  SKILL_VARIABLES.forEach(v => {
    const avg = skillCounts[v] > 0 ? skillScores[v] / skillCounts[v] : 0.5;
    skillValues[v] = Number(avg.toFixed(2));
    skillMemberships[v] = fuzzifySkillDegree(avg);
  });

  // Process behavioral signals
  const behaviorFeatures = processBehavioralSignals(userAnswers, behavioralSignals);

  // Evaluate fuzzy suitability for candidate domains (PART 6 & 7)
  const fuzzyScoresList = [];
  const ahpCandidatesList = [];
  const finalScoresList = [];
  const fuzzySuitabilityMap = {};

  domainKeysToEvaluate.forEach(dKey => {
    // 1. Rule-based Mamdani suitability
    const ruleObj = DOMAIN_FUZZY_RULES[dKey] || DOMAIN_FUZZY_RULES["full_stack"];
    const ruleSuitability = ruleObj.evaluateSuitability(skillValues, behaviorFeatures);

    // 2. Direct difficulty-weighted response suitability
    const responseSuitability = domainMaxWeightSum[dKey] > 0
      ? domainWeightedSum[dKey] / domainMaxWeightSum[dKey]
      : 0.5;

    // Combined Fuzzy Score (normalized [0.0, 1.0])
    const fuzzyScore = Number(((ruleSuitability * 0.5) + (responseSuitability * 0.5)).toFixed(4));
    fuzzySuitabilityMap[dKey] = fuzzyScore;

    const domainMeta = NORMALIZED_DOMAINS[dKey] || { id: dKey, name: dKey, category: "CSE Specialization" };

    fuzzyScoresList.push({
      domainId: domainMeta.id,
      domainName: domainMeta.name,
      score: fuzzyScore
    });

    const ahpWeight = ahpPriorityWeights[dKey] !== undefined
      ? ahpPriorityWeights[dKey]
      : (1 / domainKeysToEvaluate.length);

    ahpCandidatesList.push({
      domainId: domainMeta.id,
      domainName: domainMeta.name,
      score: Number(ahpWeight.toFixed(4))
    });
  });

  // PART 8: Combine AHP (40%) + FUZZY (60%)
  const AHP_WEIGHT = COMPATIBILITY_CONFIG.ahpInterestWeight || 0.40;
  const FUZZY_WEIGHT = COMPATIBILITY_CONFIG.fuzzySuitabilityWeight || 0.60;

  const rankings = [];

  domainKeysToEvaluate.forEach(dKey => {
    const ahpObj = ahpCandidatesList.find(a => a.domainId === dKey || NORMALIZED_DOMAINS[dKey]?.id === a.domainId) || { score: 0.5 };
    const fuzzyObj = fuzzyScoresList.find(f => f.domainId === dKey || NORMALIZED_DOMAINS[dKey]?.id === f.domainId) || { score: 0.5 };

    const finalScore = Number(((ahpObj.score * AHP_WEIGHT) + (fuzzyObj.score * FUZZY_WEIGHT)).toFixed(4));
    const domainMeta = NORMALIZED_DOMAINS[dKey] || { id: dKey, name: dKey, category: "CSE Specialization", icon: "🧠" };

    finalScoresList.push({
      domainId: domainMeta.id,
      domainName: domainMeta.name,
      score: finalScore
    });

    rankings.push({
      domainId: domainMeta.id,
      domainName: domainMeta.name,
      score: finalScore,
      ahpScore: ahpObj.score,
      fuzzyScore: fuzzyObj.score,
      category: domainMeta.category || "CSE Specialization",
      icon: domainMeta.icon || "🧠",
      description: domainMeta.description || ""
    });
  });

  // PART 9: Sort ONLY candidate domains descending
  rankings.sort((a, b) => b.score - a.score);

  const topCandidate = rankings[0] || {
    domainId: "ai_ml",
    domainName: "Artificial Intelligence & Machine Learning",
    score: 0.75,
    category: "AI & Data",
    icon: "🧠"
  };

  const secondCandidate = rankings[1] || null;

  // PART 10: Score difference & confidence level
  const scoreDiff = secondCandidate
    ? Number((topCandidate.score - secondCandidate.score).toFixed(4))
    : 0.5;

  const confidenceLevel = scoreDiff <= 0.05 ? "close_match" : "high";

  // Extract top strong skill signals for explainability (PART 19)
  const strongSkillSignals = Object.entries(skillValues)
    .filter(([_, val]) => val >= 0.55)
    .map(([key, _]) => key.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "));

  const recommendedDomain = {
    domainId: topCandidate.domainId,
    domainName: topCandidate.domainName,
    score: topCandidate.score,
    category: topCandidate.category,
    icon: topCandidate.icon
  };

  return {
    success: true,
    recommendedDomain,
    ahpCandidates: ahpCandidatesList,
    fuzzyScores: fuzzyScoresList,
    finalScores: finalScoresList,
    rankings,
    confidenceLevel,
    scoreDiff,
    strongSkillSignals,
    skillValues,
    skillMemberships,
    behaviorFeatures,
    fuzzySuitabilityMap
  };
}

module.exports = {
  fuzzifySkillDegree,
  defuzzifyCoG,
  processBehavioralSignals,
  evaluateAdaptiveFuzzy,
  DIFFICULTY_WEIGHTS
};
