const express = require("express");
const router = express.Router();
const verifyStudent = require("../middleware/verifyStudent");
const {
  generateStudyPlan,
  summarizeNotes,
  generatePracticeQuestions,
  askAdvisorChat,
  generateResumeSuggestions,
  generateInterviewQuestions,
  getPeerMentors
} = require("../controllers/collegeStudyToolsController");

router.post("/planner", verifyStudent, generateStudyPlan);
router.post("/summarize", verifyStudent, summarizeNotes);
router.post("/practice-questions", verifyStudent, generatePracticeQuestions);
router.post("/chat", verifyStudent, askAdvisorChat);
router.get("/resume-builder", verifyStudent, generateResumeSuggestions);
router.post("/interview-prep", verifyStudent, generateInterviewQuestions);
router.get("/mentors", verifyStudent, getPeerMentors);

module.exports = router;
