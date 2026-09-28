const express = require("express");
const router = express.Router();
const verifyStudent = require("../middleware/verifyStudent");
const {
  generateStudyPlan,
  completeStudyTask,
  runPlannerAcceptanceTest,
  submitAssessmentResult,
  getAnalyticsData,
  submitMentorDoubtRequest,
  getMentorRequestsForStudent,
  handleMentorRequestAction,
  submitInterviewResult,
  summarizeNotes,
  generatePracticeQuestions,
  askAdvisorChat,
  generateResumeSuggestions,
  generateInterviewQuestions,
  getPeerMentors,
  getCollegeDashboardSummary
} = require("../controllers/collegeStudyToolsController");

router.get("/dashboard-summary", verifyStudent, getCollegeDashboardSummary);
router.post("/planner", verifyStudent, generateStudyPlan);
router.post("/planner/complete-task", verifyStudent, completeStudyTask);
router.get("/planner/test", runPlannerAcceptanceTest);
router.post("/assessment/submit", verifyStudent, submitAssessmentResult);
router.get("/analytics", verifyStudent, getAnalyticsData);
router.post("/mentors/doubt-request", verifyStudent, submitMentorDoubtRequest);
router.get("/mentors/student-requests", verifyStudent, getMentorRequestsForStudent);
router.post("/mentors/request-action", verifyStudent, handleMentorRequestAction);
router.post("/interview-prep/submit", verifyStudent, submitInterviewResult);
router.post("/summarize", verifyStudent, summarizeNotes);
router.post("/practice-questions", verifyStudent, generatePracticeQuestions);
router.post("/chat", verifyStudent, askAdvisorChat);
router.get("/resume-builder", verifyStudent, generateResumeSuggestions);
router.post("/interview-prep", verifyStudent, generateInterviewQuestions);
router.get("/mentors", verifyStudent, getPeerMentors);

module.exports = router;


