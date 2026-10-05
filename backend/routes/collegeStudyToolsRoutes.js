const express = require("express");
const router = express.Router();
const verifyStudent = require("../middleware/verifyStudent");
const {
  getActiveStudyPlan,
  createPersonalizedStudyPlan,
  parseNaturalLanguageGoal,
  generateStudyPlan,
  completeStudyTask,
  rescheduleStudyTask,
  skipStudyTask,
  editStudyTaskTopic,
  deleteActiveStudyPlan,
  researchPlacementCompany,
  createPlacementPlan,
  getActivePlacementPlan,
  completePlacementTask,
  deleteActivePlacementPlan,
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
  getCollegeDashboardSummary,
  getAtsPresets,
  checkResumeAtsScore
} = require("../controllers/collegeStudyToolsController");

const multer = require("multer");
const uploadResume = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.get("/dashboard-summary", verifyStudent, getCollegeDashboardSummary);

// Study Planner Engine Routes
router.get("/planner/active", verifyStudent, getActiveStudyPlan);
router.post("/planner/create", verifyStudent, createPersonalizedStudyPlan);
router.post("/planner/parse-goal", verifyStudent, parseNaturalLanguageGoal);
router.post("/planner", verifyStudent, generateStudyPlan);
router.post("/planner/complete-task", verifyStudent, completeStudyTask);
router.post("/planner/reschedule-task", verifyStudent, rescheduleStudyTask);
router.post("/planner/skip-task", verifyStudent, skipStudyTask);
router.post("/planner/edit-task", verifyStudent, editStudyTaskTopic);
router.delete("/planner/active", verifyStudent, deleteActiveStudyPlan);

// Placement Preparation Routes
router.post("/placement/research", verifyStudent, researchPlacementCompany);
router.post("/placement/create-plan", verifyStudent, createPlacementPlan);
router.get("/placement/active", verifyStudent, getActivePlacementPlan);
router.post("/placement/complete-task", verifyStudent, completePlacementTask);
router.delete("/placement/active", verifyStudent, deleteActivePlacementPlan);
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

// ATS Resume Score & Keyword Checker Routes
router.get("/ats-presets", verifyStudent, getAtsPresets);
router.post("/ats-checker", verifyStudent, uploadResume.single("resumeFile"), checkResumeAtsScore);

module.exports = router;



