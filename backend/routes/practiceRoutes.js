const express = require("express");
const router = express.Router();
const verifyStudent = require("../middleware/verifyStudent");
const { getPracticeQuestions, generatePracticeQuestions } = require("../controllers/collegeStudyToolsController");
const {
  createPracticeSession,
  submitAnswer,
  getPracticeSession,
  getSessionResults
} = require("../controllers/practiceSessionController");

// LLM Adaptive Practice Session Endpoints (Section 19 & 20)
router.post("/session", verifyStudent, createPracticeSession);
router.post("/session/:sessionId/answer", verifyStudent, submitAnswer);
router.get("/session/:sessionId", verifyStudent, getPracticeSession);
router.get("/session/:sessionId/results", verifyStudent, getSessionResults);

// Legacy & Direct Question Bank Queries
router.get("/questions", verifyStudent, getPracticeQuestions);
router.post("/questions", verifyStudent, generatePracticeQuestions);

module.exports = router;
