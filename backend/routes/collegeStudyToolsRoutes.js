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
  getPracticeConfig,
  askAdvisorChat,
  generateResumeSuggestions,
  saveResumeData,
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
router.get("/practice/config", verifyStudent, getPracticeConfig);
router.post("/chat", verifyStudent, askAdvisorChat);
router.get("/resume-builder", verifyStudent, generateResumeSuggestions);
router.post("/resume-builder/save", verifyStudent, saveResumeData);
router.post("/interview-prep", verifyStudent, generateInterviewQuestions);
router.get("/mentors", verifyStudent, getPeerMentors);

module.exports = router;


