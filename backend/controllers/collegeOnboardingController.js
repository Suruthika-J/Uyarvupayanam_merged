const CollegeStudentProfile = require("../models/CollegeStudentProfile");
const CollegeOnboardingQuestion = require("../models/CollegeOnboardingQuestion");
const CollegeOnboardingResponse = require("../models/CollegeOnboardingResponse");
const Recommendation = require("../models/Recommendation");
const axios = require("axios");

const GROK_API_KEY = process.env.GROK_API_KEY || "xai-JPHZZdSGepdkppoqz9vWnMBzmKwKdenngyfYaO08Wf3Mp0W0ddsapnTkQWD2hhdyTc28IrxnEMkUpbO0";

// ── Server-Side AI Question Validation Helper ──────────────────────────────────
const validateQuestion = (q, expectedDomain, expectedDifficulty) => {
  if (!q || typeof q !== "object") return false;
  if (!q.question || typeof q.question !== "string" || q.question.trim().length < 10) return false;
  if (!Array.isArray(q.options) || q.options.length !== 4) return false;
  
  // Check for duplicate options
  const uniqueOptions = new Set(q.options.map(o => String(o).trim().toLowerCase()));
  if (uniqueOptions.size !== 4) return false;

  // Correct answer index or text check
  let correctText = "";
  if (typeof q.correctIndex === "number" && q.correctIndex >= 0 && q.correctIndex < 4) {
    correctText = q.options[q.correctIndex];
  } else if (typeof q.correctAnswer === "string" && q.options.includes(q.correctAnswer)) {
    correctText = q.correctAnswer;
  } else {
    return false;
  }

  // Reject childish/trivial wording or obvious meta hints
  const lowerQ = q.question.toLowerCase();
  const trivialPhrases = ["what is your favorite", "do you like", "why did you choose", "are you good at", "easy question"];
  if (trivialPhrases.some(p => lowerQ.includes(p))) return false;

  return {
    questionText: q.question.trim(),
    options: q.options.map(o => String(o).trim()),
    correctAnswer: correctText,
    topic: q.topic || "Core Domain Concepts",
    explanation: q.explanation || `Correct answer is ${correctText}`,
    difficulty: expectedDifficulty,
    source: "AI_GENERATED"
  };
};

// ── Generate AI Questions via Grok ─────────────────────────────────────────────
const generateAIQuestionsForLevel = async (field, degree, domain, specialization, academicYear, difficulty, count = 3) => {
  const specText = specialization ? `Specialization: "${specialization}"` : "";
  const diffDesc = {
    VERY_EASY: "Basic college-level foundation question checking fundamental domain concepts. MUST be respectable for a college student, NEVER trivial or childish.",
    EASY: "Slightly more conceptual or simple application question requiring basic problem-solving and domain recall.",
    MODERATE: "Moderate conceptual understanding, situational reasoning, and application question."
  }[difficulty] || "College domain question";

  const prompt = `You are a university academic domain diagnostic test generator.
Generate exactly ${count} multiple-choice questions for a college student studying:
Field: "${field}"
Degree: "${degree}"
Domain / Branch: "${domain}"
${specText}
Academic Stage: "${academicYear || "Undergraduate"}"
Requested Difficulty Level: "${difficulty}" (${diffDesc})

STRICT RULES:
1. "VERY EASY" level must be a respectable basic college-level foundation question (e.g. FIFO queue principle for CS, bearing function for Mech, electrical resistance for EEE, RCC tensile reinforcement for Civil, dataset mean for Data Science). NEVER ask childish or trivial questions like "What is your favorite subject?" or "Do you like computers?".
2. Return ONLY a valid JSON array of objects with NO markdown codeblocks.
3. Each object MUST have:
   - "id": string (e.g. "ai_1")
   - "question": string
   - "options": array of 4 distinct string choices
   - "correctIndex": integer (0 to 3)
   - "topic": string (sub-topic or concept area)
   - "explanation": string (1-sentence explanation)
`;

  try {
    const response = await axios.post(
      "https://api.x.ai/v1/chat/completions",
      {
        model: "grok-2-latest",
        messages: [
          { role: "system", content: "You are a specialized academic question generator. Respond strictly in raw valid JSON arrays." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1200
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROK_API_KEY}`
        },
        timeout: 9000
      }
    );

    const rawText = response.data?.choices?.[0]?.message?.content || "";
    const cleanedJson = rawText.replace(/```json/gi, "").replace(/```/gi, "").trim();
    const parsed = JSON.parse(cleanedJson);

    if (Array.isArray(parsed)) {
      const validated = [];
      for (const item of parsed) {
        const v = validateQuestion(item, domain, difficulty);
        if (v) validated.push(v);
      }
      return validated;
    }
  } catch (err) {
    console.warn(`xAI Grok generation failed for ${difficulty} (${domain}):`, err.message);
  }
  return [];
};

// ── GET /api/college-onboarding/questions ─────────────────────────────────────
exports.getCollegeQuestions = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    const profile = await CollegeStudentProfile.findOne({ userId });

    // Missing Domain Handling (Section 22 requirement)
    if (!profile || !profile.domain || !profile.field) {
      return res.status(200).json({
        success: true,
        missingDomain: true,
        message: "Please complete your academic profile so we can personalize your onboarding assessment.",
        profile: profile || null
      });
    }

    const { field, degreeProgramme: degree, domain, specialization, currentYear, currentSemester } = profile;

    // Target distribution: 10 questions (4 Very Easy, 4 Easy, 2 Moderate)
    const targets = { VERY_EASY: 4, EASY: 4, MODERATE: 2 };
    const finalQuestions = [];

    for (const diff of ["VERY_EASY", "EASY", "MODERATE"]) {
      const targetCount = targets[diff];

      // 1. Query Database Bank by Hierarchy Priority (Specialization > Domain > Degree > Field)
      let query = { difficulty: diff, status: "ACTIVE" };
      if (specialization) {
        query.$or = [{ specialization }, { domain }];
      } else {
        query.domain = domain;
      }

      let dbQuestions = await CollegeOnboardingQuestion.find(query).limit(targetCount);

      // Fallback query by Field if Domain query returned fewer questions
      if (dbQuestions.length < targetCount) {
        const existingIds = dbQuestions.map(q => q._id);
        const additionalDb = await CollegeOnboardingQuestion.find({
          _id: { $nin: existingIds },
          field: field,
          difficulty: diff,
          status: "ACTIVE"
        }).limit(targetCount - dbQuestions.length);

        dbQuestions = [...dbQuestions, ...additionalDb];
      }

      // Format DB questions
      const formattedDb = dbQuestions.map(q => ({
        id: q._id.toString(),
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        topic: q.topic,
        explanation: q.explanation,
        difficulty: q.difficulty,
        source: "DATABASE"
      }));

      finalQuestions.push(...formattedDb);

      // 2. If DB lacks sufficient questions, generate missing count via AI
      const missingCount = targetCount - dbQuestions.length;
      if (missingCount > 0) {
        const aiQuestions = await generateAIQuestionsForLevel(field, degree, domain, specialization, currentYear, diff, missingCount);
        const formattedAi = aiQuestions.map((q, idx) => ({
          id: `ai_${diff.toLowerCase()}_${idx}_${Date.now()}`,
          ...q
        }));
        finalQuestions.push(...formattedAi);
      }
    }

    res.status(200).json({
      success: true,
      missingDomain: false,
      academicProfile: {
        field,
        degree,
        domain,
        specialization,
        currentYear,
        currentSemester
      },
      distribution: {
        veryEasyCount: finalQuestions.filter(q => q.difficulty === "VERY_EASY").length,
        easyCount: finalQuestions.filter(q => q.difficulty === "EASY").length,
        moderateCount: finalQuestions.filter(q => q.difficulty === "MODERATE").length,
        total: finalQuestions.length
      },
      questions: finalQuestions
    });
  } catch (error) {
    console.error("Get college onboarding questions error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch domain questions" });
  }
};

// ── POST /api/college-onboarding/submit ───────────────────────────────────────
exports.submitCollegeOnboarding = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid submission data" });
    }

    const profile = await CollegeStudentProfile.findOne({ userId });
    if (!profile || !profile.domain) {
      return res.status(400).json({ success: false, message: "Academic domain missing from profile" });
    }

    const { field, degreeProgramme: degree, domain, specialization, currentYear, currentSemester } = profile;

    const processedAnswers = [];
    let correctAnswersCount = 0;

    const stageScores = {
      VERY_EASY: { total: 0, correct: 0 },
      EASY: { total: 0, correct: 0 },
      MODERATE: { total: 0, correct: 0 }
    };

    const topicScores = {}; // { topicName: { total: 0, correct: 0 } }

    for (const ans of answers) {
      let qText = ans.questionText;
      let cAns = ans.correctAnswer;
      let diff = ans.difficulty || "VERY_EASY";
      let top = ans.topic || "Domain Fundamentals";

      // If question ID is a database object ID, verify against DB
      if (ans.questionId && !ans.questionId.startsWith("ai_")) {
        const dbQ = await CollegeOnboardingQuestion.findById(ans.questionId);
        if (dbQ) {
          qText = dbQ.questionText;
          cAns = dbQ.correctAnswer;
          diff = dbQ.difficulty;
          top = dbQ.topic;
        }
      }

      const isCorrect = String(ans.selectedAnswer || "").trim().toLowerCase() === String(cAns || "").trim().toLowerCase();
      if (isCorrect) correctAnswersCount++;

      processedAnswers.push({
        questionId: ans.questionId || "ai_generated",
        questionText: qText,
        topic: top,
        difficulty: diff,
        selectedAnswer: ans.selectedAnswer,
        correctAnswer: cAns,
        isCorrect,
        responseTime: ans.responseTime || 0
      });

      // Stage tracking
      if (stageScores[diff]) {
        stageScores[diff].total += 1;
        if (isCorrect) stageScores[diff].correct += 1;
      }

      // Topic tracking
      if (!topicScores[top]) {
        topicScores[top] = { total: 0, correct: 0 };
      }
      topicScores[top].total += 1;
      if (isCorrect) topicScores[top].correct += 1;
    }

    const totalQuestions = processedAnswers.length;
    const scorePercentage = Math.round((correctAnswersCount / totalQuestions) * 100);

    // Stage breakdown formatting
    const stageBreakdown = {
      veryEasy: {
        total: stageScores.VERY_EASY.total,
        correct: stageScores.VERY_EASY.correct,
        percentage: stageScores.VERY_EASY.total > 0 ? Math.round((stageScores.VERY_EASY.correct / stageScores.VERY_EASY.total) * 100) : 0
      },
      easy: {
        total: stageScores.EASY.total,
        correct: stageScores.EASY.correct,
        percentage: stageScores.EASY.total > 0 ? Math.round((stageScores.EASY.correct / stageScores.EASY.total) * 100) : 0
      },
      moderate: {
        total: stageScores.MODERATE.total,
        correct: stageScores.MODERATE.correct,
        percentage: stageScores.MODERATE.total > 0 ? Math.round((stageScores.MODERATE.correct / stageScores.MODERATE.total) * 100) : 0
      }
    };

    // Topic breakdown formatting
    const topicBreakdown = [];
    const strengths = [];
    const areasToStrengthen = [];

    for (const topic in topicScores) {
      const data = topicScores[topic];
      const pct = Math.round((data.correct / data.total) * 100);
      topicBreakdown.push({ topic, total: data.total, correct: data.correct, percentage: pct });

      if (pct >= 70) {
        strengths.push(topic);
      } else {
        areasToStrengthen.push(topic);
      }
    }

    // Default fallbacks if lists are empty
    if (strengths.length === 0) strengths.push(`${domain} Foundation Concepts`);
    if (areasToStrengthen.length === 0) areasToStrengthen.push(`Advanced ${domain} Applications`);

    const recommendedStartingTopics = areasToStrengthen.length > 0
      ? areasToStrengthen.slice(0, 3)
      : [`Advanced ${domain} Practice`, "Project Applications"];

    // Constructive Baseline Statement (NO negative labels!)
    let currentBaseline = "";
    if (scorePercentage >= 85) {
      currentBaseline = `Your current baseline in ${domain} fundamentals is exceptionally strong. You demonstrate a solid grasp of core theory and analytical concepts.`;
    } else if (scorePercentage >= 65) {
      currentBaseline = `Your current baseline in ${domain} fundamentals is developing well. You have a good foundational grasp with key areas ready for targeted practice.`;
    } else if (scorePercentage >= 45) {
      currentBaseline = `Your current baseline in ${domain} fundamentals provides a steady starting point. Focused practice on core topics will build strong confidence.`;
    } else {
      currentBaseline = `Your current baseline in ${domain} fundamentals is established. Reviewing foundational concepts will help accelerate your growth.`;
    }

    const baselineResult = {
      currentBaseline,
      strengths,
      areasToStrengthen,
      recommendedStartingTopics
    };

    // Save Onboarding Response
    const onboardingResponse = new CollegeOnboardingResponse({
      userId,
      field,
      degree,
      domain,
      specialization,
      academicYear: currentYear,
      semester: currentSemester,
      answers: processedAnswers,
      totalQuestions,
      correctAnswers: correctAnswersCount,
      wrongAnswers: totalQuestions - correctAnswersCount,
      scorePercentage,
      stageBreakdown,
      topicBreakdown,
      baselineResult,
      isCurrentDomainBaseline: true
    });
    await onboardingResponse.save();

    // Preserve historical baseline when domain changes and set current baseline
    const newBaselineRecord = {
      field,
      degree,
      domain,
      specialization,
      currentBaseline,
      strengths,
      areasToStrengthen,
      recommendedStartingTopics,
      scorePercentage,
      assessedAt: new Date()
    };

    if (profile.onboardingBaseline && profile.onboardingBaseline.domain) {
      profile.onboardingHistory.push({ ...profile.onboardingBaseline });
    }

    profile.onboardingBaseline = newBaselineRecord;
    profile.grokAssessmentScore = scorePercentage;
    profile.grokAssessmentResults = processedAnswers;
    profile.currentStep = 7;
    profile.isCompleted = true;

    await profile.save();

    // Update Recommendation document for cross-platform integration
    await Recommendation.findOneAndUpdate(
      { userId },
      {
        userId,
        grade: `College - ${domain}`,
        scorePercentage,
        performanceLevel: currentBaseline,
        strongSkills: strengths,
        weakSkills: areasToStrengthen,
        recommendedSkills: recommendedStartingTopics,
        improvementMessage: currentBaseline
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: "Onboarding assessment completed successfully",
      scorePercentage,
      stageBreakdown,
      baselineResult,
      responseId: onboardingResponse._id
    });
  } catch (error) {
    console.error("Submit college onboarding error:", error);
    res.status(500).json({ success: false, message: "Submission failed" });
  }
};

// ── GET /api/college-onboarding/baseline ──────────────────────────────────────
exports.getCollegeBaseline = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    const profile = await CollegeStudentProfile.findOne({ userId });
    const latestResponse = await CollegeOnboardingResponse.findOne({ userId }).sort({ createdAt: -1 });

    if (!profile || !profile.onboardingBaseline) {
      return res.status(200).json({
        success: true,
        hasBaseline: false,
        message: "No baseline assessment completed yet"
      });
    }

    res.status(200).json({
      success: true,
      hasBaseline: true,
      baseline: profile.onboardingBaseline,
      history: profile.onboardingHistory || [],
      detailedResponse: latestResponse
    });
  } catch (error) {
    console.error("Get college baseline error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch baseline" });
  }
};

// ── POST /api/college-onboarding/retake ───────────────────────────────────────
exports.retakeDomainAssessment = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    const profile = await CollegeStudentProfile.findOne({ userId });
    if (profile) {
      if (profile.onboardingBaseline && profile.onboardingBaseline.domain) {
        profile.onboardingHistory.push({ ...profile.onboardingBaseline });
      }
      profile.onboardingBaseline = undefined;
      await profile.save();
    }

    res.status(200).json({
      success: true,
      message: "Ready to retake domain onboarding assessment"
    });
  } catch (error) {
    console.error("Retake domain assessment error:", error);
    res.status(500).json({ success: false, message: "Failed to reset assessment" });
  }
};
