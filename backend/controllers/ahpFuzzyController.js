const AhpFuzzyQuestion = require("../models/AhpFuzzyQuestion");
const AhpFuzzyResult = require("../models/AhpFuzzyResult");
const AhpCareerProfile = require("../models/AhpCareerProfile");
const CollegeStudentProfile = require("../models/CollegeStudentProfile");
const { evaluateAdaptiveFuzzy } = require("../utils/ahpFuzzyEngine");
const { seedCseCareerDiscoveryQuestions } = require("../seeders/seedCseCareerDiscoveryQuestions");

// Sanitize question document before sending to frontend (Section 21 Security Rule)
const sanitizeQuestionForClient = (qDoc) => {
  const q = qDoc.toObject ? qDoc.toObject() : qDoc;

  const sanitizedOptions = (q.options || []).map((opt, idx) => ({
    id: opt.id || opt.optionId || String.fromCharCode(65 + idx),
    text: opt.text
  }));

  return {
    _id: q._id,
    questionId: q.questionId,
    branch: q.branch || "CSE",
    domainId: q.domainId || q.domain,
    domainName: q.domainName || q.category || q.domain,
    difficulty: q.difficulty,
    questionText: q.questionText,
    questionType: q.questionType || "scenario",
    options: sanitizedOptions,
    skillDimensions: q.skillDimensions || q.skillVariables || [],
    xp: q.xp || (q.difficulty === "easy" ? 10 : q.difficulty === "medium" ? 20 : 30),
    active: q.active !== undefined ? q.active : true
  };
};

const DOMAIN_ALIAS_MAP = {
  'full_stack': 'full_stack',
  'Full Stack & Software Engineering': 'full_stack',
  'Full Stack Web & Mobile Development': 'full_stack',
  'software_engineering': 'software_engineering',
  'Software Engineering & Architecture': 'software_engineering',
  'ai_ml': 'ai_ml',
  'AI & Machine Learning': 'ai_ml',
  'Artificial Intelligence & Machine Learning': 'ai_ml',
  'data_science': 'data_science',
  'Data Science & Big Data Analytics': 'data_science',
  'cyber_security': 'cyber_security',
  'Cyber Security & Ethical Hacking': 'cyber_security',
  'cloud_devops': 'cloud_devops',
  'Cloud Computing & DevOps': 'cloud_devops',
  'algorithms_systems': 'algorithms_systems',
  'Algorithms & System Programming': 'algorithms_systems'
};

// GET /api/onboarding/discovery/questions
const getAhpFuzzyQuestions = async (req, res) => {
  try {
    const { branch = "CSE", domains, domainId, difficulty, limit } = req.query;

    console.log("[DISCOVERY API] branch:", branch);
    console.log("[DISCOVERY API] requested domains:", domains || domainId);

    // Ensure 105 CSE questions are seeded in DB
    const countTotal = await AhpFuzzyQuestion.countDocuments({ active: true });
    if (countTotal < 105) {
      await seedCseCareerDiscoveryQuestions();
    }

    // Branch filter: default to CSE if matching CSE variants
    const normalizedBranch = (!branch || branch === "CSE" || branch.toLowerCase().includes("computer science") || branch.toLowerCase().includes("cse"))
      ? "CSE"
      : branch;
    const branchFilter = { $in: ["CSE", "cse", normalizedBranch] };

    let rawCandidateDomains = [];
    const domainsQuery = domains || domainId;

    if (domainsQuery) {
      rawCandidateDomains = domainsQuery.split(",").map(d => d.trim()).filter(Boolean);
    }

    if (rawCandidateDomains.length === 0) {
      rawCandidateDomains = ["ai_ml", "data_science", "software_engineering"];
    }

    // Resolve canonical domain IDs from alias dictionary
    const candidateDomains = rawCandidateDomains.map(d => DOMAIN_ALIAS_MAP[d] || d);
    console.log("[DISCOVERY API] canonical candidate domains:", candidateDomains);

    let questions = [];

    // Helper to find questions for a domain & difficulty
    const findQuestionsForDomain = async (targetDomain, targetDiff, numLimit) => {
      const canonicalId = DOMAIN_ALIAS_MAP[targetDomain] || targetDomain;
      return await AhpFuzzyQuestion.find({
        branch: branchFilter,
        $or: [
          { domainId: canonicalId },
          { domain: canonicalId },
          { domainId: targetDomain },
          { domain: targetDomain },
          { domainName: new RegExp(targetDomain.replace(/_/g, " "), "i") }
        ],
        difficulty: targetDiff.toLowerCase(),
        active: true
      }).limit(numLimit);
    };

    // Case 1: Single domain + specific difficulty query
    if (candidateDomains.length === 1 && difficulty) {
      const rawQuestions = await findQuestionsForDomain(candidateDomains[0], difficulty, limit ? parseInt(limit, 10) : 5);
      questions = rawQuestions.map(sanitizeQuestionForClient);
    }
    // Case 2: Multi-domain or default distribution (1, 2, or 3+ domains)
    else {
      const selectedQuestions = [];
      const numDomains = candidateDomains.length;

      let allocations = [];
      if (numDomains === 1) {
        allocations = [{ domain: candidateDomains[0], easy: 5, medium: 5, hard: 5 }];
      } else if (numDomains === 2) {
        allocations = [
          { domain: candidateDomains[0], easy: 3, medium: 3, hard: 2 },
          { domain: candidateDomains[1], easy: 2, medium: 2, hard: 3 }
        ];
      } else {
        allocations = [
          { domain: candidateDomains[0], easy: 2, medium: 2, hard: 2 },
          { domain: candidateDomains[1], easy: 2, medium: 2, hard: 2 },
          { domain: candidateDomains[2], easy: 1, medium: 1, hard: 1 }
        ];
      }

      for (const alloc of allocations) {
        for (const diff of ["easy", "medium", "hard"]) {
          const num = alloc[diff];
          let fetched = await findQuestionsForDomain(alloc.domain, diff, num);
          // Fallback search across any domain if specific domain had fewer results
          if (fetched.length < num) {
            const missingCount = num - fetched.length;
            const existingIds = fetched.map(q => q._id);
            const fallback = await AhpFuzzyQuestion.find({
              branch: branchFilter,
              difficulty: diff,
              active: true,
              _id: { $nin: existingIds }
            }).limit(missingCount);
            fetched = [...fetched, ...fallback];
          }
          selectedQuestions.push(...fetched.map(sanitizeQuestionForClient));
        }
      }

      questions = selectedQuestions;
    }

    console.log("[DISCOVERY API] MongoDB result count:", questions.length);

    const easyCount = questions.filter(q => q.difficulty === "easy").length;
    const mediumCount = questions.filter(q => q.difficulty === "medium").length;
    const hardCount = questions.filter(q => q.difficulty === "hard").length;

    res.status(200).json({
      success: true,
      count: questions.length,
      difficultyBreakdown: {
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount
      },
      candidateDomains,
      questions
    });
  } catch (error) {
    console.error("Get Discovery Questions error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch discovery questions" });
  }
};

// POST /api/onboarding/discovery/answer & /api/onboarding/discovery/evaluate
const evaluateStudentAssessment = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?.id || req.user?._id;
    const { answers, answer, questionId, selectedOption, optionId, ahpPriorityWeights, behavioralSignals } = req.body;

    let userAnswers = [];

    if (Array.isArray(answers)) {
      userAnswers = answers;
    } else if (answer || (questionId && (selectedOption || optionId))) {
      userAnswers = [{
        questionId: questionId || answer.questionId,
        selectedOption: selectedOption || optionId || answer.selectedOption || answer.optionId,
        optionId: selectedOption || optionId || answer.selectedOption || answer.optionId
      }];
    }

    if (userAnswers.length === 0) {
      return res.status(400).json({ success: false, message: "Please provide student answers for evaluation." });
    }

    const questionIds = userAnswers.map(a => a.questionId || a._id).filter(Boolean);
    const questions = await AhpFuzzyQuestion.find({
      $or: [
        { questionId: { $in: questionIds } },
        { _id: { $in: questionIds } }
      ]
    });

    // Check if user has an existing AHP Profile to get authentic AHP priority weights
    let effectiveAhpWeights = ahpPriorityWeights || {};
    if (userId && Object.keys(effectiveAhpWeights).length === 0) {
      const ahpProfile = await AhpCareerProfile.findOne({ userId });
      if (ahpProfile && ahpProfile.priorityWeights) {
        effectiveAhpWeights = ahpProfile.priorityWeights;
      }
    }

    const evaluation = evaluateAdaptiveFuzzy({
      userAnswers,
      questions,
      ahpPriorityWeights: effectiveAhpWeights,
      behavioralSignals: behavioralSignals || {}
    });

    const isAssessmentCompleted = userAnswers.length >= 15;

    let savedResult = null;

    // PART 11 & PART 13: If 15/15 questions are answered, persist the recommendation
    if (isAssessmentCompleted && userId) {
      const resultData = {
        userId,
        studentId: userId.toString(),
        branch: "CSE",
        ahpCandidates: evaluation.ahpCandidates,
        fuzzyScores: evaluation.fuzzyScores,
        finalScores: evaluation.finalScores,
        recommendedDomain: evaluation.recommendedDomain,
        confidenceLevel: evaluation.confidenceLevel,
        scoreDiff: evaluation.scoreDiff,
        strongDimensions: evaluation.strongSkillSignals,
        totalQuestionsAnswered: userAnswers.length,
        assessmentCompleted: true,
        answers: userAnswers,
        completedAt: new Date()
      };

      savedResult = await AhpFuzzyResult.findOneAndUpdate(
        { userId },
        resultData,
        { upsert: true, new: true }
      );

      // PART 15: Update CollegeStudentProfile so dashboard & profile use recommendedDomain
      await CollegeStudentProfile.findOneAndUpdate(
        { userId },
        {
          $set: {
            domain: evaluation.recommendedDomain.domainName,
            specialization: evaluation.recommendedDomain.domainName,
            targetCareer: evaluation.recommendedDomain.domainName,
            isCompleted: true,
            currentStep: 7
          }
        },
        { upsert: true }
      );
    }

    res.status(200).json({
      success: true,
      assessmentCompleted: isAssessmentCompleted,
      answeredCount: userAnswers.length,
      totalQuestions: 15,
      evaluation,
      savedResult
    });
  } catch (error) {
    console.error("Evaluate Discovery Questions error:", error);
    res.status(500).json({ success: false, message: "Fuzzy evaluation error" });
  }
};

// GET /api/onboarding/discovery/result (PART 12)
const getDiscoveryResult = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Student token missing." });
    }

    // Search for saved AhpFuzzyResult first
    let result = await AhpFuzzyResult.findOne({ userId });

    if (!result) {
      // Fallback: check if AHP profile exists to generate/preview result
      const ahpProfile = await AhpCareerProfile.findOne({ userId });
      const studentProfile = await CollegeStudentProfile.findOne({ userId });

      if (ahpProfile && ahpProfile.topDomain) {
        const topD = ahpProfile.topDomain;
        const candidateDomains = ahpProfile.candidateDomainsForStep6 || ahpProfile.candidateDomains || [];

        const ahpCandidates = candidateDomains.map(d => ({
          domainId: d.id,
          domainName: d.name,
          score: Number((d.weight || d.scorePercent / 100 || 0.5).toFixed(4))
        }));

        result = {
          userId,
          studentId: userId.toString(),
          branch: "CSE",
          ahpCandidates,
          fuzzyScores: ahpCandidates.map(c => ({ ...c, score: Number((c.score * 0.9).toFixed(4)) })),
          finalScores: ahpCandidates.map(c => ({ ...c, score: Number((c.score).toFixed(4)) })),
          recommendedDomain: {
            domainId: topD.id,
            domainName: topD.name,
            score: Number((topD.weight || topD.scorePercent / 100 || 0.75).toFixed(4)),
            category: topD.category || "CSE Specialization",
            icon: topD.icon || "🧠"
          },
          confidenceLevel: "high",
          scoreDiff: 0.15,
          strongDimensions: ["Problem Solving", "Analytical Thinking", "Technical Aptitude"],
          assessmentCompleted: studentProfile ? (studentProfile.isCompleted || studentProfile.currentStep >= 6) : false,
          completedAt: ahpProfile.completedAt || new Date()
        };
      } else {
        return res.status(404).json({
          success: false,
          message: "No career discovery result found. Please complete the assessment."
        });
      }
    }

    res.status(200).json({
      success: true,
      assessmentCompleted: result.assessmentCompleted !== false,
      recommendedDomain: result.recommendedDomain,
      ahpCandidates: result.ahpCandidates,
      fuzzyScores: result.fuzzyScores,
      finalScores: result.finalScores,
      confidenceLevel: result.confidenceLevel || "high",
      scoreDiff: result.scoreDiff || 0,
      strongDimensions: result.strongDimensions || [],
      completedAt: result.completedAt
    });
  } catch (error) {
    console.error("Get Discovery Result error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch discovery result" });
  }
};

module.exports = {
  getAhpFuzzyQuestions,
  evaluateStudentAssessment,
  getDiscoveryResult
};
