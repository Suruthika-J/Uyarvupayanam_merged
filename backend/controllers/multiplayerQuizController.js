const MultiplayerQuizSession = require("../models/MultiplayerQuizSession");
const MultiplayerQuizAnswer = require("../models/MultiplayerQuizAnswer");
const { PeerMessage, PeerConversation } = require("../models/PeerChat");
const AhpFuzzyQuestion = require("../models/AhpFuzzyQuestion");
const User = require("../models/User");
const { sanitizeQuestionForClient } = require("../services/multiplayerQuizService");
const { createQuiz, analyzePerformance, calculateQuestionScore } = require("../services/quizAI/QuizAIEngine");

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

    // Check if session already created for this invite
    let session = await MultiplayerQuizSession.findOne({ inviteId: msg._id });

    if (!session) {
      const topic = msg.studyInvite?.subject || "DBMS";
      const subtopic = msg.studyInvite?.goal || "Queries";
      const durationMins = msg.studyInvite?.durationMinutes || 25;

      // Invoke QuizAIEngine pipeline (QuestionRetriever -> QuestionGenerator -> QuestionValidator -> DifficultyEngine -> QuizBuilder)
      const quizData = await createQuiz({
        topic,
        subtopic,
        questionCount: 10,
        duration: durationMins
      });

      const questionIds = quizData.questionIds;

      // Fetch user details for both participants
      const [senderUser, receiverUser] = await Promise.all([
        User.findById(msg.senderId).select("name").lean(),
        User.findById(userId).select("name").lean()
      ]);

      const sessionId = `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      session = await MultiplayerQuizSession.create({
        sessionId,
        inviteId: msg._id,
        conversationId: msg.conversationId,
        topic: quizData.normalizedTopic || topic,
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
        currentQuestionIndex: 0
      });

      msg.studyInvite.status = "accepted";
      msg.studyInvite.sessionId = sessionId;
      await msg.save();
    } else if (msg.studyInvite.status !== "accepted") {
      msg.studyInvite.status = "accepted";
      msg.studyInvite.sessionId = session.sessionId;
      await msg.save();
    }

    // Emit real-time Socket.IO notifications
    const io = req.app.get("io");
    if (io) {
      const payload = {
        sessionId: session.sessionId,
        topic: session.topic,
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

    const isParticipant = session.participants.some(p => p.userId.toString() === userId.toString());
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Unauthorized to access this quiz session." });
    }

    // Fetch current question
    let currentQuestionData = null;
    if (session.questionIds && session.questionIds.length > session.currentQuestionIndex) {
      const qDoc = await AhpFuzzyQuestion.findById(session.questionIds[session.currentQuestionIndex]).lean();
      if (qDoc) {
        currentQuestionData = sanitizeQuestionForClient(qDoc, session.currentQuestionIndex + 1, session.totalQuestions);
      }
    }

    // Check if user has already answered current question
    let hasAnsweredCurrent = false;
    if (currentQuestionData) {
      const myAnswer = await MultiplayerQuizAnswer.findOne({
        sessionId,
        userId,
        questionId: currentQuestionData.questionId
      });
      if (myAnswer) hasAnsweredCurrent = true;
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
        startAt: session.startAt,
        endAt: session.endAt,
        completedAt: session.completedAt
      },
      currentQuestion: currentQuestionData,
      hasAnsweredCurrent
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
      const startAt = new Date(Date.now() + 3000); // 3-second countdown
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

        // Trigger start after countdown
        setTimeout(async () => {
          try {
            const liveSession = await MultiplayerQuizSession.findOne({ sessionId });
            if (liveSession && liveSession.status === "COUNTDOWN") {
              liveSession.status = "LIVE";
              await liveSession.save();

              const qDoc = await AhpFuzzyQuestion.findById(liveSession.questionIds[0]).lean();
              const qData = qDoc ? sanitizeQuestionForClient(qDoc, 1, liveSession.totalQuestions) : null;

              io.to(`quiz:${sessionId}`).emit("quiz:started", {
                sessionId,
                status: "LIVE",
                currentQuestionIndex: 0,
                question: qData,
                startAt: liveSession.startAt
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

    const session = await MultiplayerQuizSession.findOne({ sessionId });
    if (!session) return res.status(404).json({ success: false, message: "Session not found." });

    if (session.status !== "LIVE" && session.status !== "COUNTDOWN") {
      return res.status(400).json({ success: false, message: "Quiz session is not active." });
    }

    const participant = session.participants.find(p => p.userId.toString() === userId.toString());
    if (!participant) return res.status(403).json({ success: false, message: "Not a participant." });

    // Verify question matches session
    const currentQId = session.questionIds[session.currentQuestionIndex];
    if (questionId && currentQId.toString() !== questionId.toString()) {
      return res.status(400).json({ success: false, message: "Answer is for an inactive question." });
    }

    // Check duplicate submission
    const existingAns = await MultiplayerQuizAnswer.findOne({ sessionId, userId, questionId: currentQId });
    if (existingAns) {
      return res.status(400).json({ success: false, message: "Question already answered." });
    }

    // Fetch full question with correctOption for server evaluation
    const qDoc = await AhpFuzzyQuestion.findById(currentQId).lean();
    if (!qDoc) return res.status(404).json({ success: false, message: "Question definition not found." });

    // Server-side answer evaluation
    const remainingRatio = 0.5; // default speed ratio
    const evalResult = evaluateAnswer(qDoc, selectedOption, remainingRatio);

    // Record answer in database
    const answerDoc = await MultiplayerQuizAnswer.create({
      sessionId,
      userId,
      questionId: currentQId,
      questionIndex: session.currentQuestionIndex,
      selectedOption,
      isCorrect: evalResult.isCorrect,
      score: evalResult.score,
      responseTime: responseTime || 0
    });

    // Update participant stats
    participant.answeredCount += 1;
    participant.score += evalResult.score;
    if (evalResult.isCorrect) participant.correctCount += 1;
    participant.status = "ANSWERED";
    participant.lastActiveAt = new Date();

    await session.save();

    const io = req.app.get("io");
    if (io) {
      io.to(`quiz:${sessionId}`).emit("quiz:player-progress", {
        sessionId,
        userId,
        questionIndex: session.currentQuestionIndex,
        answeredCount: participant.answeredCount,
        score: participant.score,
        status: "ANSWERED"
      });
    }

    // Check if all participants answered the current question
    const answersForCurrent = await MultiplayerQuizAnswer.find({
      sessionId,
      questionId: currentQId
    });

    const allAnswered = session.participants.every(p =>
      answersForCurrent.some(a => a.userId.toString() === p.userId.toString())
    );

    if (allAnswered) {
      // Broadcast question result with correct option & explanation
      if (io) {
        io.to(`quiz:${sessionId}`).emit("quiz:question-result", {
          sessionId,
          questionIndex: session.currentQuestionIndex,
          correctOption: evalResult.correctOption,
          explanation: evalResult.explanation,
          participants: session.participants
        });
      }

      // Transition to next question after 2.5 seconds
      setTimeout(async () => {
        try {
          const sLive = await MultiplayerQuizSession.findOne({ sessionId });
          if (!sLive) return;

          const nextIdx = sLive.currentQuestionIndex + 1;

          if (nextIdx >= sLive.totalQuestions) {
            // Quiz completed!
            sLive.status = "COMPLETED";
            sLive.completedAt = new Date();
            sLive.participants.forEach(p => p.status = "FINISHED");
            await sLive.save();

            if (io) {
              io.to(`quiz:${sessionId}`).emit("quiz:completed", {
                sessionId,
                status: "COMPLETED",
                participants: sLive.participants,
                totalQuestions: sLive.totalQuestions
              });
            }
          } else {
            // Advance to next question
            sLive.currentQuestionIndex = nextIdx;
            sLive.currentQuestionStartedAt = new Date();
            sLive.participants.forEach(p => p.status = "ANSWERING");
            await sLive.save();

            const nextQDoc = await AhpFuzzyQuestion.findById(sLive.questionIds[nextIdx]).lean();
            const nextQData = sanitizeQuestionForClient(nextQDoc, nextIdx + 1, sLive.totalQuestions);

            if (io) {
              io.to(`quiz:${sessionId}`).emit("quiz:next-question", {
                sessionId,
                currentQuestionIndex: nextIdx,
                question: nextQData,
                participants: sLive.participants
              });
            }
          }
        } catch (errNext) {
          console.error("Next question transition error:", errNext);
        }
      }, 2500);
    }

    res.status(200).json({
      success: true,
      evaluated: {
        isCorrect: evalResult.isCorrect,
        scoreGained: evalResult.score,
        totalScore: participant.score
      }
    });
  } catch (err) {
    console.error("submitAnswer error:", err);
    res.status(500).json({ success: false, message: "Failed to submit answer." });
  }
};

/**
 * 5. GET /api/multiplayer-quiz/:sessionId/results
 *    Final game result payload.
 */
exports.getSessionResults = async (req, res) => {
  try {
    const userId = req.student?._id || req.student?.id;
    const { sessionId } = req.params;

    const session = await MultiplayerQuizSession.findOne({ sessionId });
    if (!session) return res.status(404).json({ success: false, message: "Session not found." });

    const answers = await MultiplayerQuizAnswer.find({ sessionId }).lean();

    // Determine top score / completion metrics
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
 * 6. GET /api/multiplayer-quiz/:sessionId/review
 *    Full review with questions, user answer, correct answer, explanation & weak topic analysis.
 */
exports.getReviewData = async (req, res) => {
  try {
    const userId = req.student?._id || req.student?.id;
    const { sessionId } = req.params;

    const session = await MultiplayerQuizSession.findOne({ sessionId });
    if (!session) return res.status(404).json({ success: false, message: "Session not found." });

    const questions = await AhpFuzzyQuestion.find({ _id: { $in: session.questionIds } }).lean();
    const myAnswers = await MultiplayerQuizAnswer.find({ sessionId, userId }).lean();

    const qMap = {};
    questions.forEach(q => qMap[q._id.toString()] = q);

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
