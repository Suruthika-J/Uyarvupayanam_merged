const mongoose = require("mongoose");

// In-memory transition lock per session to prevent race conditions
const transitionLocks = new Set();

/**
 * Robust helper function to find questions by ObjectId or string questionId with self-healing creation
 */
async function findQuestionById(id) {
  if (!id) return null;
  
  // 1. Lookup by ObjectId if valid
  if (mongoose.Types.ObjectId.isValid(id)) {
    const qDoc = await AhpFuzzyQuestion.findById(id).lean();
    if (qDoc) return qDoc;
  }

  // 2. Lookup by string questionId
  const qDocByQuestionId = await AhpFuzzyQuestion.findOne({ questionId: String(id) }).lean();
  if (qDocByQuestionId) return qDocByQuestionId;

  // 3. Self-healing fallback creation if missing from DB
  try {
    const fallbackId = `healed_q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const healedDoc = await AhpFuzzyQuestion.create({
      questionId: String(id),
      branch: "CSE",
      domainId: "general_cs",
      domainName: "Computer Science",
      difficulty: "medium",
      questionType: "conceptual",
      category: "General",
      questionText: "Which of the following represents a core concept or standard implementation pattern in this study domain?",
      options: [
        { id: "A", optionId: `opt_${fallbackId}_0`, text: "Standardized operational pattern and concept implementation" },
        { id: "B", optionId: `opt_${fallbackId}_1`, text: "Deprecated architectural anti-pattern" },
        { id: "C", optionId: `opt_${fallbackId}_2`, text: "Unbounded memory allocation strategy" },
        { id: "D", optionId: `opt_${fallbackId}_3`, text: "Non-deterministic system state transition" }
      ],
      correctOption: "A",
      explanation: "Option A correctly represents the standard core principle of this study domain.",
      source: "self-healing-question-engine",
      sourceType: "AI_GENERATED",
      active: true
    });
    return healedDoc.toObject();
  } catch (err) {
    console.error("Self healing question creation error:", err.message);
    return null;
  }
}

/**
 * Server-side enforcement when question timer (45s) expires
 */
async function checkAndEnforceQuestionTimeout(sessionId, io) {
  try {
    const session = await MultiplayerQuizSession.findOne({ sessionId });
    if (!session || (session.status !== "LIVE" && session.status !== "COUNTDOWN")) return;

    const currentQId = session.questionIds[session.currentQuestionIndex];
    if (!currentQId) return;

    const activeParticipants = session.participants.filter(p => p.status !== "LEFT" && p.status !== "DISCONNECTED");
    const expectedPlayers = Math.max(1, activeParticipants.length);

    // Fetch existing answers for current question
    const answersForCurrent = await MultiplayerQuizAnswer.find({ sessionId, questionId: currentQId });
    const answeredUserIds = new Set(answersForCurrent.map(a => a.userId.toString()));

    let newAnswersCreated = false;
    for (const p of activeParticipants) {
      if (!answeredUserIds.has(p.userId.toString())) {
        console.log(`[QUIZ TIMEOUT] User ${p.userId} (${p.name}) did not answer Q${session.currentQuestionIndex + 1} within timeout. Recording UNANSWERED.`);
        try {
          await MultiplayerQuizAnswer.create({
            sessionId,
            userId: p.userId,
            questionId: currentQId,
            questionIndex: session.currentQuestionIndex,
            selectedOption: "UNANSWERED",
            isCorrect: false,
            basePoints: 0,
            speedBonus: 0,
            difficultyBonus: 0,
            streakBonus: 0,
            totalPoints: 0,
            score: 0,
            responseTimeMs: (session.questionTimeoutSeconds || 45) * 1000
          });
          p.answeredCount += 1;
          p.streak = 0;
          p.status = "ANSWERED";
          newAnswersCreated = true;
        } catch (ansErr) {
          console.error(`Timeout answer creation error for user ${p.userId}:`, ansErr.message);
        }
      }
    }

    if (newAnswersCreated) {
      await session.save();
    }

    // Now re-fetch all answers for current question
    const updatedAnswers = await MultiplayerQuizAnswer.find({ sessionId, questionId: currentQId });

    if (updatedAnswers.length >= expectedPlayers) {
      console.log(`[QUIZ TIMEOUT] All players resolved for Q${session.currentQuestionIndex + 1} via timeout!`);
      console.log(`[QUIZ] Changing state: QUESTION_ACTIVE → QUESTION_RESULT`);

      session.status = "WAITING_FOR_NEXT";
      session.nextQuestionReadyUsers = [];
      await session.save();

      const qDoc = await findQuestionById(currentQId);
      const results = session.participants.map(p => {
        const pAns = updatedAnswers.find(a => a.userId.toString() === p.userId.toString());
        return {
          userId: p.userId,
          name: p.name,
          selectedOption: pAns ? pAns.selectedOption : "UNANSWERED",
          isCorrect: Boolean(pAns?.isCorrect),
          basePoints: pAns?.basePoints || 0,
          speedBonus: pAns?.speedBonus || 0,
          difficultyBonus: pAns?.difficultyBonus || 0,
          streakBonus: pAns?.streakBonus || 0,
          totalPoints: pAns?.totalPoints || pAns?.score || 0,
          pointsEarned: pAns?.totalPoints || pAns?.score || 0,
          responseTimeMs: pAns?.responseTimeMs || 0,
          streak: p.streak || 0,
          bestStreak: p.bestStreak || 0,
          score: p.score
        };
      });

      console.log(`[QUIZ] Emitting quiz:question-result after timeout`);
      if (io) {
        io.to(`quiz:${sessionId}`).emit("quiz:question-result", {
          sessionId,
          questionId: currentQId,
          questionNumber: session.currentQuestionIndex + 1,
          totalQuestions: session.totalQuestions,
          results,
          correctOption: qDoc?.correctOption || "",
          explanation: qDoc?.explanation || "No explanation provided.",
          participants: session.participants,
          nextQuestionReadyUsers: session.nextQuestionReadyUsers
        });
      }
    }
  } catch (err) {
    console.error(`checkAndEnforceQuestionTimeout error for session ${sessionId}:`, err);
  }
}

/**
 * Single server-side question advancement function.
 * Continually generates LLM questions until session overall time expires!
 */
async function advanceToNextQuestion(sessionId, io) {
  if (transitionLocks.has(sessionId)) {
    console.log(`[QUIZ LOCK] Session ${sessionId} transition already in progress, skipping duplicate call.`);
    return;
  }
  transitionLocks.add(sessionId);

  try {
    const session = await MultiplayerQuizSession.findOne({ sessionId });
    if (!session || session.status === "COMPLETED") return;

    const currentIndex = session.currentQuestionIndex;
    const nextIndex = currentIndex + 1;

    // Check if session overall timer has expired
    const now = Date.now();
    const startMs = session.startAt ? new Date(session.startAt).getTime() : (session.createdAt ? new Date(session.createdAt).getTime() : now);
    const durationMs = (session.durationSeconds || 1500) * 1000;
    const isSessionTimeExpired = (now - startMs) >= durationMs || (session.endAt && now >= new Date(session.endAt).getTime());

    // If nextIndex reaches or exceeds current questionIds count:
    if (nextIndex >= session.questionIds.length) {
      if (isSessionTimeExpired) {
        console.log(`[QUIZ] Session ${sessionId} time expired. Completing quiz after Q${currentIndex + 1}`);
        session.status = "COMPLETED";
        session.completedAt = new Date();
        session.nextQuestionReadyUsers = [];
        session.participants.forEach(p => { p.status = "FINISHED"; });
        await session.save();

        // Compute final game metrics
        const answers = await MultiplayerQuizAnswer.find({ sessionId }).lean();
        
        let highestScore = -1;
        let winnerId = null;
        let isTie = false;

        const participantResults = session.participants.map(p => {
          const pAnswers = answers.filter(a => a.userId.toString() === p.userId.toString());
          const correctCount = pAnswers.filter(a => a.isCorrect).length;
          const total = session.totalQuestions;
          const incorrectCount = pAnswers.filter(a => !a.isCorrect && a.selectedOption !== "UNANSWERED").length;
          const unansweredCount = total - (correctCount + incorrectCount);
          const accuracyPercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
          
          const totalTimeMs = pAnswers.reduce((sum, a) => sum + (a.responseTimeMs || 0), 0);
          const avgResponseSec = pAnswers.length > 0 ? Math.round((totalTimeMs / pAnswers.length / 1000) * 10) / 10 : 0;

          if (p.score > highestScore) {
            highestScore = p.score;
            winnerId = p.userId;
            isTie = false;
          } else if (p.score === highestScore && p.score > 0) {
            isTie = true;
          }

          return {
            userId: p.userId,
            name: p.name,
            totalScore: p.score,
            correctAnswers: correctCount,
            incorrectAnswers: incorrectCount,
            unanswered: Math.max(0, unansweredCount),
            accuracy: accuracyPercent,
            averageResponseTime: avgResponseSec,
            bestStreak: p.bestStreak || p.streak || 0,
            badges: []
          };
        });

        if (isTie) winnerId = null;

        // Assign gamification badges
        participantResults.forEach(pr => {
          const badges = [];
          if (pr.averageResponseTime > 0 && pr.averageResponseTime <= 5) badges.push("⚡ Speed Demon");
          if (pr.accuracy >= 90) badges.push("🎯 Sharpshooter");
          if (pr.bestStreak >= 5) badges.push("🔥 Streak Master");
          if (pr.correctAnswers >= 8) badges.push("🧠 Knowledge Crusher");
          if (winnerId && pr.userId.toString() === winnerId.toString()) badges.push("🏆 Study Champion");
          pr.badges = badges;
        });

        // Save MultiplayerQuizResult document
        try {
          await MultiplayerQuizResult.findOneAndUpdate(
            { sessionId },
            {
              sessionId,
              inviteId: session.inviteId,
              topicId: session.topicId || "general",
              topicLabel: session.topicLabel || session.topic,
              winnerId,
              isTie,
              participants: participantResults,
              totalQuestions: session.totalQuestions,
              completedAt: session.completedAt
            },
            { upsert: true, new: true }
          );

          // Award total XP to student profile
          for (const p of participantResults) {
            try {
              await User.findByIdAndUpdate(p.userId, { $inc: { totalXP: p.totalScore } });
            } catch (xpErr) {
              console.error(`XP update error for user ${p.userId}:`, xpErr.message);
            }
          }
        } catch (resErr) {
          console.error("MultiplayerQuizResult save error:", resErr.message);
        }

        const finalPayload = {
          sessionId,
          status: "COMPLETED",
          topicId: session.topicId,
          topicLabel: session.topicLabel || session.topic,
          topic: session.topic,
          subtopic: session.subtopic,
          completedAt: session.completedAt,
          winnerId,
          isTie,
          results: participantResults,
          totalQuestions: session.totalQuestions
        };

        if (io) {
          console.log(`[QUIZ] Broadcasting quiz:completed for session ${sessionId}`);
          io.to(`quiz:${sessionId}`).emit("quiz:completed", finalPayload);
        }
        return;
      }

      // TIME IS NOT EXPIRED: Generate more LLM questions on the fly!
      console.log(`[QUIZ LLM] Generating more LLM questions on topic "${session.topic}" as session time is still active...`);
      try {
        const { generateAIQuestions } = require("../services/quizAI/QuestionGenerator");
        const newQuestions = await generateAIQuestions({
          topic: session.topicLabel || session.topic,
          subtopic: session.subtopic || session.topic,
          difficulty: session.difficulty || "medium",
          numberOfQuestions: 5,
          domainId: session.topicId || "general_cs"
        });

        const newIds = newQuestions.map(q => q._id || q.questionId);
        session.questionIds.push(...newIds);
        session.totalQuestions = session.questionIds.length;
        await session.save();
        console.log(`[QUIZ LLM] Added ${newIds.length} new AI questions. Total questions in session: ${session.totalQuestions}`);
      } catch (genErr) {
        console.error("[QUIZ LLM] Error generating extra LLM questions:", genErr.message);
      }
    }

    // Advance to next question
    session.currentQuestionIndex = nextIndex;
    session.status = "LIVE";
    session.nextQuestionReadyUsers = [];
    session.currentQuestionStartedAt = new Date();
    session.participants.forEach(p => {
      if (p.status !== "LEFT" && p.status !== "DISCONNECTED") {
        p.status = "ANSWERING";
      }
    });
    await session.save();

    const nextQDoc = await findQuestionById(session.questionIds[nextIndex]);
    const nextQData = sanitizeQuestionForClient(nextQDoc, nextIndex + 1, session.totalQuestions);
    const questionStartedAt = session.currentQuestionStartedAt;
    const questionDeadline = new Date(questionStartedAt.getTime() + (session.questionTimeoutSeconds || 45) * 1000);

    console.log(`[QUIZ]\nAdvancing:\nQ${currentIndex + 1} → Q${nextIndex + 1}`);
    console.log(`[QUIZ]\nEmitting quiz:next-question`);

    if (io) {
      io.to(`quiz:${sessionId}`).emit("quiz:next-question", {
        sessionId,
        questionId: nextQData.questionId,
        questionNumber: nextIndex + 1,
        totalQuestions: session.totalQuestions,
        question: nextQData,
        questionStartedAt,
        questionDeadline,
        participants: session.participants
      });
    }

    // Schedule server-side timeout check for the newly advanced question
    setTimeout(() => {
      checkAndEnforceQuestionTimeout(sessionId, io);
    }, ((session.questionTimeoutSeconds || 45) + 2) * 1000);
  } catch (err) {
    console.error(`advanceToNextQuestion error for session ${sessionId}:`, err);
  } finally {
    transitionLocks.delete(sessionId);
  }
}

/**
 * Shared backend handler for answer processing (used by HTTP POST and Socket.IO)
 */
async function processUserAnswer({ sessionId, userId, questionId, selectedOption, responseTime, io }) {
  console.log(`[QUIZ ANSWER]\nsessionId: ${sessionId}\nquestionId: ${questionId}\nuserId: ${userId}`);

  const session = await MultiplayerQuizSession.findOne({ sessionId });
  if (!session) throw new Error("Session not found");

  if (session.status !== "LIVE" && session.status !== "COUNTDOWN" && session.status !== "WAITING_FOR_NEXT") {
    throw new Error("Quiz session is not active");
  }

  const participant = session.participants.find(p => p.userId.toString() === userId.toString());
  if (!participant) throw new Error("Not a participant");

  const currentQId = session.questionIds[session.currentQuestionIndex];
  if (questionId && currentQId.toString() !== questionId.toString()) {
    throw new Error("Answer is for an inactive question");
  }

  // Check duplicate submission
  const existingAns = await MultiplayerQuizAnswer.findOne({ sessionId, userId, questionId: currentQId });
  if (existingAns) {
    throw new Error("Question already answered");
  }

  const qDoc = await findQuestionById(currentQId);
  if (!qDoc) throw new Error("Question definition not found");

  // SERVER-SIDE RESPONSE TIME CALCULATION (AUTHORITATIVE SERVER TIMESTAMP)
  const serverNow = Date.now();
  const startTime = session.currentQuestionStartedAt ? new Date(session.currentQuestionStartedAt).getTime() : serverNow - 10000;
  const serverResponseTimeMs = Math.max(0, serverNow - startTime);

  // Gamified server scoring calculation
  const evalResult = calculateQuestionScore({
    qDoc,
    selectedOption,
    responseTimeMs: serverResponseTimeMs,
    questionTimeoutSeconds: session.questionTimeoutSeconds || 45,
    currentStreak: participant.streak || 0
  });

  await MultiplayerQuizAnswer.create({
    sessionId,
    userId,
    questionId: currentQId,
    questionIndex: session.currentQuestionIndex,
    selectedOption,
    isCorrect: evalResult.isCorrect,
    basePoints: evalResult.basePoints,
    speedBonus: evalResult.speedBonus,
    difficultyBonus: evalResult.difficultyBonus,
    streakBonus: evalResult.streakBonus,
    totalPoints: evalResult.totalPoints,
    score: evalResult.totalPoints,
    responseTimeMs: serverResponseTimeMs
  });

  console.log(`[QUIZ ANSWER]\nSaved successfully: score=${evalResult.totalPoints}, correct=${evalResult.isCorrect}`);

  participant.answeredCount += 1;
  participant.score += evalResult.totalPoints;
  if (evalResult.isCorrect) {
    participant.correctCount += 1;
    participant.streak = (participant.streak || 0) + 1;
    participant.bestStreak = Math.max(participant.bestStreak || 0, participant.streak);
  } else {
    participant.streak = 0;
  }
  participant.status = "ANSWERED";
  participant.lastActiveAt = new Date();

  await session.save();

  if (io) {
    io.to(`quiz:${sessionId}`).emit("quiz:player-progress", {
      sessionId,
      userId,
      questionIndex: session.currentQuestionIndex,
      answeredCount: participant.answeredCount,
      score: participant.score,
      streak: participant.streak,
      status: "ANSWERED"
    });
  }

  // Active connected participants expected
  const activeParticipants = session.participants.filter(p => p.status !== "LEFT" && p.status !== "DISCONNECTED");
  const expectedPlayers = Math.max(1, activeParticipants.length);

  const answersForCurrent = await MultiplayerQuizAnswer.find({
    sessionId,
    questionId: currentQId
  });

  console.log(`[QUIZ STATE]\nAnswers for question: ${answersForCurrent.length}/${expectedPlayers}`);

  if (answersForCurrent.length >= expectedPlayers) {
    console.log(`[QUIZ STATE]\nAll players answered`);
    console.log(`[QUIZ]\nChanging state:\nQUESTION_ACTIVE → QUESTION_RESULT`);

    session.status = "WAITING_FOR_NEXT";
    session.nextQuestionReadyUsers = [];
    await session.save();

    const results = session.participants.map(p => {
      const pAns = answersForCurrent.find(a => a.userId.toString() === p.userId.toString());
      return {
        userId: p.userId,
        name: p.name,
        selectedOption: pAns ? pAns.selectedOption : "N/A",
        isCorrect: Boolean(pAns?.isCorrect),
        basePoints: pAns?.basePoints || 0,
        speedBonus: pAns?.speedBonus || 0,
        difficultyBonus: pAns?.difficultyBonus || 0,
        streakBonus: pAns?.streakBonus || 0,
        totalPoints: pAns?.totalPoints || pAns?.score || 0,
        pointsEarned: pAns?.totalPoints || pAns?.score || 0,
        responseTimeMs: pAns?.responseTimeMs || 0,
        streak: p.streak || 0,
        bestStreak: p.bestStreak || 0,
        score: p.score
      };
    });

    console.log(`[QUIZ]\nEmitting quiz:question-result`);
    if (io) {
      io.to(`quiz:${sessionId}`).emit("quiz:question-result", {
        sessionId,
        questionId: currentQId,
        questionNumber: session.currentQuestionIndex + 1,
        totalQuestions: session.totalQuestions,
        results,
        correctOption: evalResult.correctOption,
        explanation: evalResult.explanation,
        participants: session.participants,
        nextQuestionReadyUsers: session.nextQuestionReadyUsers
      });
    }
  }

  return {
    isCorrect: evalResult.isCorrect,
    basePoints: evalResult.basePoints,
    speedBonus: evalResult.speedBonus,
    difficultyBonus: evalResult.difficultyBonus,
    streakBonus: evalResult.streakBonus,
    totalPoints: evalResult.totalPoints,
    scoreGained: evalResult.totalPoints,
    totalScore: participant.score,
    streak: participant.streak
  };
}

/**
 * Handle user marking ready for next question
 */
async function markUserReadyForNext({ sessionId, userId, questionId, io }) {
  console.log(`[QUIZ]\nNext ready:\nuser=${userId}`);

  const session = await MultiplayerQuizSession.findOne({ sessionId });
  if (!session) throw new Error("Session not found");

  const participant = session.participants.find(p => p.userId.toString() === userId.toString());
  if (!participant) throw new Error("Not a participant");

  if (!session.nextQuestionReadyUsers) {
    session.nextQuestionReadyUsers = [];
  }

  const alreadyReady = session.nextQuestionReadyUsers.some(id => id.toString() === userId.toString());
  if (!alreadyReady) {
    session.nextQuestionReadyUsers.push(userId);
    await session.save();
  }

  const activeParticipants = session.participants.filter(p => p.status !== "LEFT" && p.status !== "DISCONNECTED");
  const expectedPlayers = Math.max(1, activeParticipants.length);
  const readyCount = session.nextQuestionReadyUsers.length;

  console.log(`[QUIZ]\nReady:\n${readyCount}/${expectedPlayers}`);

  if (io) {
    io.to(`quiz:${sessionId}`).emit("quiz:next-question-ready-update", {
      sessionId,
      userId,
      ready: true,
      readyCount,
      expectedPlayers,
      readyUsers: session.nextQuestionReadyUsers
    });
  }

  let transitioned = false;
  if (readyCount >= expectedPlayers) {
    console.log(`[QUIZ]\nBoth players ready for next question`);
    transitioned = true;
    await advanceToNextQuestion(sessionId, io);
  }

  return {
    success: true,
    readyCount,
    expectedPlayers,
    transitioned
  };
}

/**
 * 1. POST /api/peer-chat/study-invites/:inviteId/accept
 *    Accepts a study invite & creates shared MultiplayerQuizSession via QuizAIEngine.
 */
exports.acceptInviteAndCreateSession = async (req, res) => {
  try {
    const userId = req.student?._id || req.student?.id;
    const { inviteId } = req.params;

    const msg = await PeerMessage.findById(inviteId);
    if (!msg || msg.type !== "study_invite") {
      return res.status(404).json({ success: false, message: "Study invite not found." });
    }

    if (msg.senderId.toString() === userId.toString()) {
      return res.status(403).json({ success: false, message: "Cannot accept your own invite." });
    }

    let session = await MultiplayerQuizSession.findOne({ inviteId: msg._id });

    if (!session) {
      const topicToUse = msg.studyInvite?.topicId || msg.studyInvite?.subject || msg.studyInvite?.topicLabel;
      if (!topicToUse) {
        throw new Error("Multiplayer quiz topic is missing from study invite");
      }
      const subtopic = msg.studyInvite?.goal || topicToUse;
      const durationMins = msg.studyInvite?.durationMinutes || 25;

      console.log(`[PEER-QUIZ]\nCreating session with topic:\n${topicToUse}`);
      const quizData = await createQuiz({
        topic: topicToUse,
        subtopic,
        questionCount: 10,
        duration: durationMins
      });

      console.log(`[PEER-QUIZ]\nSession created with topic:\n${quizData.topicId} (${quizData.topicLabel})`);

      const questionIds = quizData.questionIds;

      const [senderUser, receiverUser] = await Promise.all([
        User.findById(msg.senderId).select("name").lean(),
        User.findById(userId).select("name").lean()
      ]);

      const sessionId = `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      session = await MultiplayerQuizSession.create({
        sessionId,
        inviteId: msg._id,
        conversationId: msg.conversationId,
        topic: quizData.normalizedTopic || topicToUse,
        topicId: quizData.domainId || quizData.topicId,
        topicLabel: quizData.normalizedTopic || topicToUse,
        subtopic: quizData.normalizedSubtopic || subtopic,
        questionIds,
        participants: [
          {
            userId: msg.senderId,
            name: senderUser?.name || "Student A",
            status: "WAITING",
            score: 0,
            answeredCount: 0,
            correctCount: 0,
            currentQuestionIndex: 0
          },
          {
            userId,
            name: receiverUser?.name || "Student B",
            status: "WAITING",
            score: 0,
            answeredCount: 0,
            correctCount: 0,
            currentQuestionIndex: 0
          }
        ],
        status: "WAITING",
        totalQuestions: questionIds.length,
        durationSeconds: durationMins * 60,
        questionTimeoutSeconds: 45,
        currentQuestionIndex: 0,
        nextQuestionReadyUsers: []
      });

      msg.studyInvite.status = "accepted";
      msg.studyInvite.sessionId = sessionId;
      await msg.save();
    } else if (msg.studyInvite.status !== "accepted") {
      msg.studyInvite.status = "accepted";
      msg.studyInvite.sessionId = session.sessionId;
      await msg.save();
    }

    const io = req.app.get("io");
    if (io) {
      const payload = {
        sessionId: session.sessionId,
        topic: session.topic,
        topicId: session.topicId,
        topicLabel: session.topicLabel || session.topic,
        subtopic: session.subtopic,
        totalQuestions: session.totalQuestions,
        durationSeconds: session.durationSeconds,
        participants: session.participants
      };

      io.to(`user_${msg.senderId}`).emit("study:accepted", payload);
      io.to(`user_${userId}`).emit("study:accepted", payload);
      io.to(`user_${msg.senderId}`).emit("quiz:session-created", payload);
      io.to(`user_${userId}`).emit("quiz:session-created", payload);
    }

    return res.status(200).json({
      success: true,
      message: "Study invite accepted and quiz session created.",
      sessionId: session.sessionId,
      session
    });
  } catch (err) {
    console.error("acceptInviteAndCreateSession error:", err);
    res.status(500).json({ success: false, message: "Failed to accept invite and create session." });
  }
};

/**
 * 2. GET /api/multiplayer-quiz/:sessionId
 *    Get session state & current question (sanitized).
 */
exports.getSession = async (req, res) => {
  try {
    const userId = req.student?._id || req.student?.id;
    const { sessionId } = req.params;

    const session = await MultiplayerQuizSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ success: false, message: "Quiz session not found." });
    }

    console.log(`[PEER-QUIZ]\nLoaded session topic:\n${session.topicId || session.topic} (${session.topicLabel || session.topic})`);

    const isParticipant = session.participants.some(p => p.userId.toString() === userId.toString());
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Unauthorized to access this quiz session." });
    }

    let currentQuestionData = null;
    if (session.questionIds && session.questionIds.length > session.currentQuestionIndex) {
      const qDoc = await findQuestionById(session.questionIds[session.currentQuestionIndex]);
      if (qDoc) {
        currentQuestionData = sanitizeQuestionForClient(qDoc, session.currentQuestionIndex + 1, session.totalQuestions);
      }
    }

    let hasAnsweredCurrent = false;
    if (currentQuestionData) {
      const myAnswer = await MultiplayerQuizAnswer.findOne({
        sessionId,
        userId,
        questionId: currentQuestionData.questionId
      });
      if (myAnswer) hasAnsweredCurrent = true;
    }

    // Check answers for current question to see if round is complete
    let currentQuestionResult = null;
    if (currentQuestionData) {
      const currentQId = session.questionIds[session.currentQuestionIndex];
      const answersForCurrent = await MultiplayerQuizAnswer.find({ sessionId, questionId: currentQId }).lean();
      const activeParticipants = session.participants.filter(p => p.status !== "LEFT" && p.status !== "DISCONNECTED");
      if (answersForCurrent.length >= activeParticipants.length) {
        const qDocFull = await findQuestionById(currentQId);
        const results = session.participants.map(p => {
          const pAns = answersForCurrent.find(a => a.userId.toString() === p.userId.toString());
          return {
            userId: p.userId,
            name: p.name,
            selectedOption: pAns ? pAns.selectedOption : "N/A",
            isCorrect: Boolean(pAns?.isCorrect),
            pointsEarned: pAns ? pAns.score : 0,
            score: p.score
          };
        });
        currentQuestionResult = {
          questionId: currentQId,
          questionNumber: session.currentQuestionIndex + 1,
          totalQuestions: session.totalQuestions,
          results,
          correctOption: qDocFull?.correctOption || "",
          explanation: qDocFull?.explanation || "No explanation provided."
        };
      }
    }

    res.status(200).json({
      success: true,
      session: {
        sessionId: session.sessionId,
        topic: session.topic,
        subtopic: session.subtopic,
        status: session.status,
        participants: session.participants,
        currentQuestionIndex: session.currentQuestionIndex,
        totalQuestions: session.totalQuestions,
        durationSeconds: session.durationSeconds,
        questionTimeoutSeconds: session.questionTimeoutSeconds,
        nextQuestionReadyUsers: session.nextQuestionReadyUsers || [],
        startAt: session.startAt,
        endAt: session.endAt,
        completedAt: session.completedAt
      },
      currentQuestion: currentQuestionData,
      hasAnsweredCurrent,
      currentQuestionResult
    });
  } catch (err) {
    console.error("getSession error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch session." });
  }
};

/**
 * 3. POST /api/multiplayer-quiz/:sessionId/ready
 *    Toggle participant ready status in waiting room.
 */
exports.setPlayerReady = async (req, res) => {
  try {
    const userId = req.student?._id || req.student?.id;
    const { sessionId } = req.params;

    const session = await MultiplayerQuizSession.findOne({ sessionId });
    if (!session) return res.status(404).json({ success: false, message: "Session not found." });

    const participant = session.participants.find(p => p.userId.toString() === userId.toString());
    if (!participant) return res.status(403).json({ success: false, message: "Not a participant." });

    participant.status = "READY";
    participant.lastActiveAt = new Date();

    const allReady = session.participants.length >= 2 && session.participants.every(p => p.status === "READY");

    if (allReady) {
      session.status = "COUNTDOWN";
      const startAt = new Date(Date.now() + 3000);
      session.startAt = startAt;
      session.endAt = new Date(startAt.getTime() + session.durationSeconds * 1000);
      session.currentQuestionStartedAt = startAt;
    }

    await session.save();

    const io = req.app.get("io");
    if (io) {
      io.to(`quiz:${sessionId}`).emit("quiz:player-ready", {
        sessionId,
        userId,
        participants: session.participants
      });

      if (allReady) {
        io.to(`quiz:${sessionId}`).emit("quiz:countdown", {
          sessionId,
          startAt: session.startAt,
          seconds: 3
        });

        setTimeout(async () => {
          try {
            const liveSession = await MultiplayerQuizSession.findOne({ sessionId });
            if (liveSession && liveSession.status === "COUNTDOWN") {
              liveSession.status = "LIVE";
              liveSession.currentQuestionStartedAt = new Date();
              liveSession.participants.forEach(p => p.status = "ANSWERING");
              await liveSession.save();

              const qDoc = await findQuestionById(liveSession.questionIds[0]);
              const qData = qDoc ? sanitizeQuestionForClient(qDoc, 1, liveSession.totalQuestions) : null;
              const questionDeadline = new Date(liveSession.currentQuestionStartedAt.getTime() + (liveSession.questionTimeoutSeconds || 45) * 1000);

              io.to(`quiz:${sessionId}`).emit("quiz:started", {
                sessionId,
                status: "LIVE",
                questionNumber: 1,
                totalQuestions: liveSession.totalQuestions,
                question: qData,
                questionStartedAt: liveSession.currentQuestionStartedAt,
                questionDeadline,
                participants: liveSession.participants
              });
            }
          } catch (e) {
            console.error("Countdown trigger error:", e);
          }
        }, 3000);
      }
    }

    res.status(200).json({ success: true, session });
  } catch (err) {
    console.error("setPlayerReady error:", err);
    res.status(500).json({ success: false, message: "Failed to set ready state." });
  }
};

/**
 * 4. POST /api/multiplayer-quiz/:sessionId/answer
 *    Server-evaluated answer submission.
 */
exports.submitAnswer = async (req, res) => {
  try {
    const userId = req.student?._id || req.student?.id;
    const { sessionId } = req.params;
    const { questionId, questionIndex, selectedOption, responseTime } = req.body;
    const io = req.app.get("io");

    const result = await processUserAnswer({
      sessionId,
      userId,
      questionId,
      selectedOption,
      responseTime,
      io
    });

    res.status(200).json({
      success: true,
      evaluated: result
    });
  } catch (err) {
    console.error("submitAnswer error:", err.message);
    if (err.message === "Question already answered" || err.message === "Answer is for an inactive question") {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message || "Failed to submit answer." });
  }
};

/**
 * 5. POST /api/multiplayer-quiz/:sessionId/next-ready
 *    User clicks Next Question button.
 */
exports.markNextQuestionReady = async (req, res) => {
  try {
    const userId = req.student?._id || req.student?.id;
    const { sessionId } = req.params;
    const { questionId } = req.body;
    const io = req.app.get("io");

    const result = await markUserReadyForNext({
      sessionId,
      userId,
      questionId,
      io
    });

    res.status(200).json({
      success: true,
      result
    });
  } catch (err) {
    console.error("markNextQuestionReady error:", err.message);
    res.status(500).json({ success: false, message: err.message || "Failed to mark ready for next question." });
  }
};

/**
 * 6. POST /api/multiplayer-quiz/:sessionId/timeout
 *    Process question timer timeout
 */
exports.handleQuestionTimeout = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const io = req.app.get("io");

    await checkAndEnforceQuestionTimeout(sessionId, io);

    res.status(200).json({ success: true, message: "Question timeout processed." });
  } catch (err) {
    console.error("handleQuestionTimeout error:", err);
    res.status(500).json({ success: false, message: "Failed to process question timeout." });
  }
};

/**
 * 7. GET /api/multiplayer-quiz/:sessionId/results
 *    Final game result payload.
 */
exports.getSessionResults = async (req, res) => {
  try {
    const userId = req.student?._id || req.student?.id;
    const { sessionId } = req.params;

    const session = await MultiplayerQuizSession.findOne({ sessionId });
    if (!session) return res.status(404).json({ success: false, message: "Session not found." });

    const answers = await MultiplayerQuizAnswer.find({ sessionId }).lean();

    const results = session.participants.map(p => {
      const pAnswers = answers.filter(a => a.userId.toString() === p.userId.toString());
      const correct = pAnswers.filter(a => a.isCorrect).length;
      const total = session.totalQuestions;
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

      return {
        userId: p.userId,
        name: p.name,
        score: p.score,
        correctCount: correct,
        totalQuestions: total,
        accuracyPercent: accuracy
      };
    });

    results.sort((a, b) => b.score - a.score);

    res.status(200).json({
      success: true,
      topic: session.topic,
      subtopic: session.subtopic,
      status: session.status,
      completedAt: session.completedAt,
      results
    });
  } catch (err) {
    console.error("getSessionResults error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch results." });
  }
};

/**
 * 8. GET /api/multiplayer-quiz/:sessionId/review
 *    Full review with questions, user answer, correct answer, explanation & weak topic analysis.
 */
exports.getReviewData = async (req, res) => {
  try {
    const userId = req.student?._id || req.student?.id;
    const { sessionId } = req.params;

    const session = await MultiplayerQuizSession.findOne({ sessionId });
    if (!session) return res.status(404).json({ success: false, message: "Session not found." });

    const questions = await Promise.all((session.questionIds || []).map(qId => findQuestionById(qId)));
    const myAnswers = await MultiplayerQuizAnswer.find({ sessionId, userId }).lean();

    const qMap = {};
    questions.forEach((q, idx) => {
      if (q) {
        if (q._id) qMap[q._id.toString()] = q;
        if (q.questionId) qMap[q.questionId.toString()] = q;
        qMap[String(session.questionIds[idx])] = q;
      }
    });

    const answerMap = {};
    myAnswers.forEach(a => answerMap[a.questionId.toString()] = a);

    const strongTopics = [];
    const weakTopics = [];

    const reviewItems = session.questionIds.map((qId, idx) => {
      const qDoc = qMap[qId.toString()] || {};
      const myAns = answerMap[qId.toString()];

      const topicTag = qDoc.domainName || qDoc.category || session.topic;
      if (myAns?.isCorrect) {
        if (!strongTopics.includes(topicTag)) strongTopics.push(topicTag);
      } else if (myAns) {
        if (!weakTopics.includes(topicTag)) weakTopics.push(topicTag);
      }

      return {
        questionIndex: idx + 1,
        questionText: qDoc.questionText,
        options: qDoc.options || [],
        userAnswer: myAns?.selectedOption || "Not Answered",
        correctAnswer: qDoc.correctOption,
        isCorrect: Boolean(myAns?.isCorrect),
        explanation: qDoc.explanation || "No explanation provided."
      };
    });

    res.status(200).json({
      success: true,
      topic: session.topic,
      subtopic: session.subtopic,
      reviewItems,
      analysis: {
        strongTopics: strongTopics.length > 0 ? strongTopics : [session.topic],
        weakTopics: weakTopics.length > 0 ? weakTopics : []
      }
    });
  } catch (err) {
    console.error("getReviewData error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch review data." });
  }
};

/**
 * 9. POST /api/multiplayer-quiz/:sessionId/end
 *    Ends/cancels an active multiplayer quiz session.
 */
exports.endQuizSession = async (req, res) => {
  try {
    const userId = req.student?._id || req.student?.id;
    const { sessionId: paramId } = req.params;
    const mongoose = require("mongoose");

    let session = await MultiplayerQuizSession.findOne({
      $or: [
        { sessionId: paramId },
        { inviteId: mongoose.Types.ObjectId.isValid(paramId) ? paramId : null }
      ].filter(c => c.sessionId || c.inviteId)
    });

    if (!session && mongoose.Types.ObjectId.isValid(paramId)) {
      session = await MultiplayerQuizSession.findOne({ inviteId: paramId });
    }

    if (session) {
      const isParticipant = session.participants.some(p => p.userId.toString() === userId.toString());
      if (!isParticipant) {
        return res.status(403).json({ success: false, message: "Unauthorized to end this quiz session." });
      }

      session.status = "CANCELLED";
      session.completedAt = new Date();
      session.nextQuestionReadyUsers = [];
      session.participants.forEach(p => { p.status = "FINISHED"; });
      await session.save();

      if (session.inviteId) {
        try {
          const msg = await PeerMessage.findById(session.inviteId);
          if (msg && msg.studyInvite) {
            msg.studyInvite.status = "ended";
            await msg.save();
          }
        } catch (msgErr) {
          console.error("Error updating invite message status on end:", msgErr);
        }
      }

      const io = req.app.get("io");
      if (io) {
        console.log(`[QUIZ] Broadcasting quiz:ended for session ${session.sessionId}`);
        io.to(`quiz:${session.sessionId}`).emit("quiz:ended", {
          sessionId: session.sessionId,
          status: "CANCELLED",
          message: "Quiz session has been ended by a participant."
        });

        session.participants.forEach(p => {
          io.to(`user_${p.userId}`).emit("study:ended", {
            sessionId: session.sessionId,
            inviteId: session.inviteId,
            conversationId: session.conversationId
          });
          io.to(`user_${p.userId}`).emit("quiz:ended", {
            sessionId: session.sessionId,
            inviteId: session.inviteId,
            conversationId: session.conversationId
          });
        });
      }

      return res.status(200).json({
        success: true,
        message: "Quiz session ended successfully.",
        session
      });
    }

    // Fallback: If no session document exists, check if paramId is a PeerMessage inviteId
    if (mongoose.Types.ObjectId.isValid(paramId)) {
      const msg = await PeerMessage.findById(paramId);
      if (msg && msg.studyInvite) {
        msg.studyInvite.status = "ended";
        await msg.save();

        const io = req.app.get("io");
        if (io) {
          io.to(`user_${msg.senderId}`).emit("study:ended", {
            inviteId: msg._id,
            conversationId: msg.conversationId
          });
          const convo = await PeerConversation.findById(msg.conversationId);
          if (convo) {
            convo.participants.forEach(pId => {
              io.to(`user_${pId}`).emit("study:ended", {
                inviteId: msg._id,
                conversationId: msg.conversationId
              });
            });
          }
        }

        return res.status(200).json({
          success: true,
          message: "Study invite ended successfully."
        });
      }
    }

    return res.status(404).json({ success: false, message: "Quiz session or study invite not found." });
  } catch (err) {
    console.error("endQuizSession error:", err);
    res.status(500).json({ success: false, message: "Failed to end quiz session." });
  }
};

module.exports.advanceToNextQuestion = advanceToNextQuestion;
module.exports.processUserAnswer = processUserAnswer;
module.exports.markUserReadyForNext = markUserReadyForNext;
module.exports.checkAndEnforceQuestionTimeout = checkAndEnforceQuestionTimeout;

