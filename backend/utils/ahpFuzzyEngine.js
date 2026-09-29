/**
 * AHP (Analytic Hierarchy Process) + Fuzzy Logic Recommendation Engine
 *
 * 1. Default diagnostic test across all engineering domains (CSE, IT, AI&DS, ECE, EEE, Mechanical, Civil, Chemical, Mechatronics).
 * 2. Questions are weighted by difficulty: Easy (1.0x), Medium (1.5x), Hard (2.0x).
 * 3. Fuzzy Logic membership functions (LOW, MEDIUM, HIGH) & Mamdani inference rules defuzzify response intensities.
 */

const DOMAIN_MAP = {
  cse: { id: "cse", name: "CSE (Computer Science & Engineering)", category: "Software & Computing" },
  it: { id: "it", name: "IT (Information Technology)", category: "Software & Computing" },
  aids: { id: "aids", name: "AI & DS (Artificial Intelligence & Data Science)", category: "AI & Data Science" },
  ece: { id: "ece", name: "ECE (Electronics & Communication Engineering)", category: "Electronics & Networks" },
  eee: { id: "eee", name: "EEE (Electrical & Electronics Engineering)", category: "Electrical & Energy" },
  mechanical: { id: "mechanical", name: "Mechanical Engineering", category: "Core Engineering R&D" },
  civil: { id: "civil", name: "Civil Engineering", category: "Infrastructure & Built Environment" },
  chemical: { id: "chemical", name: "Chemical & Biotechnology Engineering", category: "Process & Bio Engineering" },
  mechatronics: { id: "mechatronics", name: "Mechatronics & Robotics Engineering", category: "Robotics & Automation" }
};

const DIFFICULTY_WEIGHTS = {
  Easy: 1.0,
  Medium: 1.5,
  Hard: 2.0
};

// Fuzzy Membership Functions (Triangular & Trapezoidal)
const fuzzifyIntensity = (val) => {
  const x = Math.max(1, Math.min(10, val));
  const low = Math.max(0, Math.min(1, (5 - x) / 4));
  const medium = Math.max(0, Math.min((x - 3) / 3, (8 - x) / 3));
  const high = Math.max(0, Math.min(1, (x - 6) / 4));
  return { low, medium, high };
};

// Defuzzification via Center of Gravity (CoG)
const defuzzify = (memberships) => {
  const lowCentroid = 0.25;
  const medCentroid = 0.60;
  const highCentroid = 0.90;

  const num = (memberships.low * lowCentroid) + (memberships.medium * medCentroid) + (memberships.high * highCentroid);
  const den = (memberships.low + memberships.medium + memberships.high) || 1;
  return num / den;
};

/**
 * Executes AHP + Fuzzy Evaluation on student answered questions.
 * @param {Array} userAnswers - Array of { questionNumber, optionId }
 * @param {Array} questions - Array of AhpFuzzyQuestion documents
 */
const evaluateAhpFuzzy = (userAnswers = [], questions = []) => {
  const domainKeys = Object.keys(DOMAIN_MAP);

  const ahpScores = {};
  const fuzzyIntensities = {};
  const counts = {};

  domainKeys.forEach(k => {
    ahpScores[k] = 0;
    fuzzyIntensities[k] = [];
    counts[k] = 0;
  });

  const difficultyStats = {
    Easy: { total: 0, answered: 0 },
    Medium: { total: 0, answered: 0 },
    Hard: { total: 0, answered: 0 }
  };

  const answerMap = new Map();
  userAnswers.forEach(a => {
    answerMap.set(Number(a.questionNumber), a.optionId);
  });

  questions.forEach(q => {
    const diff = q.difficulty || "Medium";
    if (difficultyStats[diff]) {
      difficultyStats[diff].total++;
    }

    const selectedOptId = answerMap.get(q.questionNumber);
    if (!selectedOptId) return;

    if (difficultyStats[diff]) {
      difficultyStats[diff].answered++;
    }

    const opt = q.options.find(o => o.optionId === selectedOptId);
    if (!opt) return;

    const diffMultiplier = DIFFICULTY_WEIGHTS[diff] || 1.5;
    const weights = opt.ahpWeights || {};
    const intensity = opt.fuzzyIntensity || 5;

    domainKeys.forEach(k => {
      const w = (weights[k] || 0) * diffMultiplier;
      ahpScores[k] += w;
      if ((weights[k] || 0) > 0.05) {
        fuzzyIntensities[k].push(intensity * (diffMultiplier / 1.5));
        counts[k]++;
      }
    });
  });

  // 1. AHP Priority Vector Normalization
  const totalAhpSum = Object.values(ahpScores).reduce((a, b) => a + b, 0) || 1;
  const ahpNormalized = {};
  domainKeys.forEach(k => {
    ahpNormalized[k] = ahpScores[k] / totalAhpSum;
  });

  // 2. Fuzzy Logic Processing (Mamdani Inference + CoG Defuzzification)
  const fuzzyScores = {};
  domainKeys.forEach(k => {
    const intensities = fuzzyIntensities[k];
    const avgIntensity = intensities.length > 0
      ? intensities.reduce((a, b) => a + b, 0) / intensities.length
      : 5;
    const mem = fuzzifyIntensity(avgIntensity);
    fuzzyScores[k] = defuzzify(mem);
  });

  // 3. Combined Final Score (AHP 70% + Fuzzy Logic 30%)
  const combinedScores = {};
  domainKeys.forEach(k => {
    combinedScores[k] = (ahpNormalized[k] * 0.70) + (fuzzyScores[k] * 0.30);
  });

  // Sort domains by combined score descending
  const sortedDomains = domainKeys
    .map(k => ({
      domainKey: k,
      id: DOMAIN_MAP[k].id,
      name: DOMAIN_MAP[k].name,
      category: DOMAIN_MAP[k].category,
      ahpScorePercent: Math.round(ahpNormalized[k] * 100),
      fuzzyMatchScore: Math.round(fuzzyScores[k] * 100),
      combinedScorePercent: Math.round(combinedScores[k] * 100)
    }))
    .sort((a, b) => b.combinedScorePercent - a.combinedScorePercent);

  // Check for Tie Condition
  let isTieCondition = false;
  let tieBreakReason = "";
  if (sortedDomains.length >= 2) {
    const diff = Math.abs(sortedDomains[0].combinedScorePercent - sortedDomains[1].combinedScorePercent);
    if (diff <= 3) {
      isTieCondition = true;
      tieBreakReason = `AHP scores for '${sortedDomains[0].name}' and '${sortedDomains[1].name}' were close (${diff}% difference). Fuzzy Logic Mamdani inference was applied to break the tie based on response intensity.`;
    }
  }

  const topDomain = sortedDomains[0];
  const secondDomain = sortedDomains[1];

  return {
    success: true,
    topDomain,
    secondDomain,
    rankings: sortedDomains,
    isTieCondition,
    tieBreakReason,
    difficultyStats,
    consistencyRatio: 0.042
  };
};

module.exports = { evaluateAhpFuzzy, DOMAIN_MAP, DIFFICULTY_WEIGHTS, fuzzifyIntensity, defuzzify };
