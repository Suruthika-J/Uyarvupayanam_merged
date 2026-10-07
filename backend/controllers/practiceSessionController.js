const PracticeSession = require("../models/PracticeSession");
const QuestionGenerationService = require("../services/QuestionGenerationService");
const StudentTestResult = require("../models/StudentTestResult");
const StudentSkillProgress = require("../models/StudentSkillProgress");

// Helper to sanitize questions so frontend NEVER sees correctOption or explanation prior to answering
function sanitizeQuestionsForClient(questions, answeredQuestionIdsSet = new Set()) {
  return questions.map((q) => {
    const isAnswered = answeredQuestionIdsSet.has(q.questionId);
    return {
      questionId: q.questionId,
      questionText: q.questionText,
      topic: q.topic || "",
      options: q.options,
      ...(isAnswered ? { correctOption: q.correctOption, explanation: q.explanation } : {})
    };
  });
}

// ── 1. Create Practice Session (POST /api/practice/session) ───────────────────
exports.createPracticeSession = async (req, res) => {
  try {
    const userId = req.student?.id || req.student?._id || req.user?._id || "guest_student";
    const { subjectId, subjectName, topic, difficulty, questionCount } = req.body;

    const count = parseInt(questionCount) || 5;

    // Generate questions using QuestionGenerationService (LLM + Validation + DB Fallback)
    const genResult = await QuestionGenerationService.generateSessionQuestions({
      subjectInput: subjectId || subjectName,
      topic: topic || null,
      difficultyInput: difficulty || "MEDIUM",
      count
    });

    const sessionId = `PS_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Abandon previous pending sessions for this user & subject to keep state clean
    await PracticeSession.updateMany(
      { userId, subjectId: genResult.subjectId, status: "IN_PROGRESS" },
      { $set: { status: "ABANDONED" } }
    );

    const newSession = new PracticeSession({
      sessionId,
      userId,
      subjectId: genResult.subjectId,
      subjectName: genResult.subjectName,
      topic: genResult.topic,
      difficulty: genResult.difficulty,
      questions: genResult.questions,
      currentQuestionIndex: 0,
      answers: [],
      score: 0,
      maxPossibleScore: genResult.questions.length * 150, // 100 base + max 50 speed bonus
      correctCount: 0,
      wrongCount: 0,
      skippedCount: 0,
      startedAt: new Date(),
      status: "IN_PROGRESS"
    });

    await newSession.save();

    // Sanitize questions for client
    const sanitizedQs = sanitizeQuestionsForClient(newSession.questions);

    return res.status(201).json({
      success: true,
      sessionId: newSession.sessionId,
      subjectId: newSession.subjectId,
      subjectName: newSession.subjectName,
      topic: newSession.topic,
      difficulty: newSession.difficulty,
      totalQuestions: newSession.questions.length,
      currentQuestionIndex: 0,
      status: newSession.status,
      questions: sanitizedQs
    });
  } catch (err) {
    console.error("Create practice session error:", err);
    return res.status(500).json({ success: false, message: "Failed to initialize practice session" });
  }
};

// ── 2. Submit Single Answer (POST /api/practice/session/:sessionId/answer) ──
exports.submitAnswer = async (req, res) => {
  try {
    const userId = req.student?.id || req.student?._id || req.user?._id || "guest_student";
    const { sessionId } = req.params;
    const { questionId, selectedOption, answerTimeMs } = req.body;

    const session = await PracticeSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ success: false, message: "Practice session not found" });
    }

    if (session.status === "COMPLETED") {
      return res.status(400).json({ success: false, message: "Practice session is already completed" });
    }

    // Find question
    const question = session.questions.find((q) => q.questionId === questionId);
    if (!question) {
      return res.status(400).json({ success: false, message: "Invalid questionId for this session" });
    }

    // Check answer locking (Section 13) - check if question has already been answered
    const existingAnswer = session.answers.find((a) => a.questionId === questionId);
    if (existingAnswer) {
      return res.status(400).json({
        success: false,
        message: "Answer already submitted for this question",
        correct: existingAnswer.isCorrect,
        score: existingAnswer.score,
        correctOption: question.correctOption,
        explanation: question.explanation
      });
    }

    // Evaluate answer & speed bonus (Section 15)
    let isCorrect = false;
    let score = 0;
    let speedBonus = 0;
    const timeSpent = Math.max(0, parseInt(answerTimeMs) || 0);

    if (selectedOption && ["A", "B", "C", "D"].includes(String(selectedOption).toUpperCase())) {
      const formattedSel = String(selectedOption).toUpperCase();
      if (formattedSel === question.correctOption) {
        isCorrect = true;
        const totalQuestionTimeMs = 30000; // 30 second timer
        const remainingMs = Math.max(0, totalQuestionTimeMs - timeSpent);
        speedBonus = Math.round((remainingMs / totalQuestionTimeMs) * 50);
        score = 100 + speedBonus;
      }
    }

    const answerRecord = {
      questionId,
      selectedOption: selectedOption ? String(selectedOption).toUpperCase() : null,
      isCorrect,
      answerTimeMs: timeSpent,
      score,
      speedBonus,
      answeredAt: new Date()
    };

    session.answers.push(answerRecord);
    session.score += score;

    if (!selectedOption) {
      session.skippedCount += 1;
    } else if (isCorrect) {
      session.correctCount += 1;
    } else {
      session.wrongCount += 1;
    }

    session.currentQuestionIndex = Math.min(session.questions.length, session.answers.length);

    // Check if session is complete after this question
    if (session.answers.length >= session.questions.length) {
      session.status = "COMPLETED";
      session.completedAt = new Date();

      // Persist Performance Analytics (Section 23)
      try {
        const totalQs = session.questions.length;
        const accuracyPercentage = totalQs > 0 ? Math.round((session.correctCount / totalQs) * 100) : 0;

        await StudentTestResult.create({
          studentId: userId,
          userId,
          subject: session.subjectName,
          testType: `${session.difficulty} Practice Session`,
          totalQuestions: totalQs,
          correctCount: session.correctCount,
          score: session.score,
          totalScore: { percentage: accuracyPercentage },
          performanceLevel: accuracyPercentage >= 80 ? "Exemplary" : accuracyPercentage >= 60 ? "Proficient" : "Needs Review",
          strengths: session.answers.filter((a) => a.isCorrect).map((a) => {
            const q = session.questions.find((x) => x.questionId === a.questionId);
            return q?.topic || session.subjectName;
          }),
          weaknesses: session.answers.filter((a) => !a.isCorrect).map((a) => {
            const q = session.questions.find((x) => x.questionId === a.questionId);
            return q?.topic || session.subjectName;
          })
        });

        // Award +50 XP for session completion
        let skillProgress = await StudentSkillProgress.findOne({ $or: [{ studentId: userId }, { userId }] });
        if (!skillProgress) skillProgress = new StudentSkillProgress({ studentId: userId });
        skillProgress.xp = (skillProgress.xp || 0) + 50;
        skillProgress.level = Math.floor(skillProgress.xp / 100) + 1;
        await skillProgress.save();
      } catch (analyticsErr) {
        console.warn("Analytics persistence error in practice session:", analyticsErr.message);
      }
    }

    await session.save();

    return res.status(200).json({
      success: true,
      correct: isCorrect,
      score,
      speedBonus,
      totalSessionScore: session.score,
      correctOption: question.correctOption,
      explanation: question.explanation,
      currentQuestionIndex: session.currentQuestionIndex,
      status: session.status,
      isComplete: session.status === "COMPLETED"
    });
  } catch (err) {
    console.error("Submit answer error:", err);
    return res.status(500).json({ success: false, message: "Failed to evaluate practice answer" });
  }
};

// ── 3. GET Practice Session State (GET /api/practice/session/:sessionId) ─────
exports.getPracticeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await PracticeSession.findOne({ sessionId }).lean();

    if (!session) {
      return res.status(404).json({ success: false, message: "Practice session not found" });
    }

    const answeredIds = new Set((session.answers || []).map((a) => a.questionId));
    const sanitizedQs = sanitizeQuestionsForClient(session.questions, answeredIds);

    return res.status(200).json({
      success: true,
      sessionId: session.sessionId,
      subjectId: session.subjectId,
      subjectName: session.subjectName,
      topic: session.topic,
      difficulty: session.difficulty,
      totalQuestions: session.questions.length,
      currentQuestionIndex: session.currentQuestionIndex,
      score: session.score,
      correctCount: session.correctCount,
      wrongCount: session.wrongCount,
      skippedCount: session.skippedCount,
      status: session.status,
      questions: sanitizedQs,
      answers: session.answers
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch practice session" });
  }
};

// ── 4. GET Practice Session Completion Results (GET /api/practice/session/:sessionId/results)
exports.getSessionResults = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await PracticeSession.findOne({ sessionId }).lean();

    if (!session) {
      return res.status(404).json({ success: false, message: "Practice session not found" });
    }

    const totalQs = session.questions.length;
    const accuracyPercentage = totalQs > 0 ? Math.round((session.correctCount / totalQs) * 100) : 0;

    const validTimes = (session.answers || []).map((a) => a.answerTimeMs).filter((t) => typeof t === "number" && t > 0);
    const avgResponseTimeMs = validTimes.length > 0 ? Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length) : 0;
    const fastestResponseTimeMs = validTimes.length > 0 ? Math.min(...validTimes) : 0;

    const topicsPracticed = Array.from(
      new Set(session.questions.map((q) => q.topic).filter(Boolean))
    );

    return res.status(200).json({
      success: true,
      sessionId: session.sessionId,
      subjectId: session.subjectId,
      subjectName: session.subjectName,
      difficulty: session.difficulty,
      status: session.status,
      score: session.score,
      maxPossibleScore: session.maxPossibleScore,
      accuracyPercentage,
      totalQuestions: totalQs,
      correctCount: session.correctCount,
      wrongCount: session.wrongCount,
      skippedCount: session.skippedCount,
      avgResponseTimeSeconds: Number((avgResponseTimeMs / 1000).toFixed(1)),
      fastestResponseTimeSeconds: Number((fastestResponseTimeMs / 1000).toFixed(1)),
      topicsPracticed
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to load session results" });
  }
};
