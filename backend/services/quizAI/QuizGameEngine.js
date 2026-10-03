/**
 * backend/services/quizAI/QuizGameEngine.js
 *
 * Game State Machine Orchestrator for Multiplayer Quiz Rooms.
 * Handles state transitions: WAITING -> READY -> COUNTDOWN -> LIVE -> COMPLETED / CANCELLED / SOLO.
 */

const MultiplayerQuizSession = require("../../models/MultiplayerQuizSession");
const MultiplayerQuizAnswer = require("../../models/MultiplayerQuizAnswer");

async function checkAndAdvanceQuestion(session, io) {
  if (!session || session.status !== "LIVE") return;

  const currentQIndex = session.currentQuestionIndex;
  const currentQId = session.questionIds[currentQIndex];

  // Count answers for current question
  const answerCount = await MultiplayerQuizAnswer.countDocuments({
    sessionId: session.sessionId,
    questionId: currentQId
  });

  const activeParticipantsCount = session.participants.filter(p => p.status !== "DISCONNECTED").length;
  const bothAnswered = answerCount >= activeParticipantsCount;

  if (bothAnswered) {
    console.log(`[QuizGameEngine] All active players answered Q${currentQIndex + 1} in session ${session.sessionId}`);
    
    // Advance to next question or complete session
    if (currentQIndex + 1 < session.totalQuestions) {
      session.currentQuestionIndex += 1;
      session.currentQuestionStartedAt = new Date();
      await session.save();

      if (io) {
        io.to(`quiz:${session.sessionId}`).emit("quiz:next-question", {
          sessionId: session.sessionId,
          currentQuestionIndex: session.currentQuestionIndex,
          totalQuestions: session.totalQuestions
        });
      }
    } else {
      session.status = "COMPLETED";
      session.completedAt = new Date();
      await session.save();

      if (io) {
        io.to(`quiz:${session.sessionId}`).emit("quiz:completed", {
          sessionId: session.sessionId,
          status: "COMPLETED",
          completedAt: session.completedAt
        });
      }
    }
  }

  return { bothAnswered, currentQuestionIndex: session.currentQuestionIndex, status: session.status };
}

module.exports = {
  checkAndAdvanceQuestion
};
