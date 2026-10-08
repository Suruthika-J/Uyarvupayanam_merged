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
  getPracticeQuestions,
  generatePracticeQuestions,
  askAdvisorChat,
  generateResumeSuggestions,
  saveResumeVersion,
  getResumeVersions,
  deleteResumeVersion,
  generateAiSummary,
  getAtsHistory,
  generateInterviewQuestions,
  getPeerMentors,
  getCollegeDashboardSummary,
  getAtsPresets,
  checkResumeAtsScore
} = require("../controllers/collegeStudyToolsController");
const {
  createPracticeSession,
  submitAnswer,
  getPracticeSession,
  getSessionResults
} = require("../controllers/practiceSessionController");
const {
  researchCompany,
  generatePracticeQuestions: generateCompanyPracticeQuestions,
  startMockInterview,
  respondMockInterview,
  submitInterviewResult: submitCompanyInterviewResult
} = require("../controllers/companyInterviewPrepController");
const requireTestFlag = require("../middleware/requireTestFlag");

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
router.get("/planner/test", requireTestFlag, runPlannerAcceptanceTest);
router.post("/assessment/submit", verifyStudent, submitAssessmentResult);
router.get("/analytics", verifyStudent, getAnalyticsData);
router.post("/mentors/doubt-request", verifyStudent, submitMentorDoubtRequest);
router.get("/mentors/student-requests", verifyStudent, getMentorRequestsForStudent);
router.post("/mentors/request-action", verifyStudent, handleMentorRequestAction);
router.post("/interview-prep/research", verifyStudent, researchCompany);
router.post("/interview-prep/generate-practice", verifyStudent, generateCompanyPracticeQuestions);
router.post("/interview-prep/mock-interview/start", verifyStudent, startMockInterview);
router.post("/interview-prep/mock-interview/respond", verifyStudent, respondMockInterview);
router.post("/interview-prep/submit", verifyStudent, submitCompanyInterviewResult);
router.post("/summarize", verifyStudent, summarizeNotes);

// LLM Adaptive Practice Session Routes
router.post("/practice/session", verifyStudent, createPracticeSession);
router.post("/practice/session/:sessionId/answer", verifyStudent, submitAnswer);
router.get("/practice/session/:sessionId", verifyStudent, getPracticeSession);
router.get("/practice/session/:sessionId/results", verifyStudent, getSessionResults);

router.get("/practice/questions", verifyStudent, getPracticeQuestions);
router.get("/practice-questions", verifyStudent, getPracticeQuestions);
router.post("/practice-questions", verifyStudent, generatePracticeQuestions);
router.post("/chat", verifyStudent, askAdvisorChat);

// Resume Builder Routes
router.get("/resume-builder", verifyStudent, generateResumeSuggestions);
router.post("/resume-builder/save", verifyStudent, saveResumeVersion);
router.get("/resume-builder/versions", verifyStudent, getResumeVersions);
router.delete("/resume-builder/:id", verifyStudent, deleteResumeVersion);
router.post("/resume-builder/generate-summary", verifyStudent, generateAiSummary);

router.post("/interview-prep", verifyStudent, generateInterviewQuestions);
router.get("/mentors", verifyStudent, getPeerMentors);

// ATS Resume Score & Keyword Checker Routes
router.get("/ats-presets", verifyStudent, getAtsPresets);
router.post("/ats-checker", verifyStudent, uploadResume.single("resumeFile"), checkResumeAtsScore);
router.get("/ats-history", verifyStudent, getAtsHistory);

module.exports = router;



