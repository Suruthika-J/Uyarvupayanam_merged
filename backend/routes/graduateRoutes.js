const express = require("express");
const router = express.Router();
const {
  getMyProfile,
  completeGraduateOnboarding,
  getDashboardSummary,
  getOpportunities,
  getOpportunityById,
  getGovernmentExams,
  getHigherStudiesGuide,
  getUserApplications,
  createOrUpdateApplication,
  setOpportunityReminder,
  refreshOpportunityResearch
} = require("../controllers/graduateController");

const {
  getIncomingMentorRequests,
  acceptMentorRequest,
  rejectMentorRequest,
  getActiveMentees,
  getRelationshipMessages,
  sendRelationshipMessage,
  getMentorProfile,
  updateMentorProfile
} = require("../controllers/graduateMentorController");

const {
  askAdvisorChat,
  generateResumeSuggestions,
  saveResumeVersion,
  getResumeVersions,
  deleteResumeVersion,
  generateAiSummary,
  getAtsPresets,
  checkResumeAtsScore,
  getAtsHistory
} = require("../controllers/collegeStudyToolsController");

const {
  getExams,
  getExamById,
  getExamPattern,
  getExamSyllabus,
  getExamPapers,
  researchExam,
  getStudyPlan,
  createOrUpdateStudyPlan,
  getExamProgress,
  recordTopicProgress,
  submitMockTest
} = require("../controllers/examPreparationController");
const verifyStudent = require("../middleware/verifyStudent");
const { rateLimit } = require("../middleware/rateLimit");

const multer = require("multer");
const uploadResume = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ── Profile & Onboarding ───────────────────────────────────────────────────────
router.get("/profile", verifyStudent, getMyProfile);
router.put("/profile", verifyStudent, completeGraduateOnboarding);
router.post("/onboarding", verifyStudent, completeGraduateOnboarding);
router.post("/onboarding/complete", verifyStudent, completeGraduateOnboarding);
router.post("/profile/step", verifyStudent, completeGraduateOnboarding);

// ── Dashboard & Opportunities ──────────────────────────────────────────────────
router.get("/dashboard", verifyStudent, getDashboardSummary);
router.get("/opportunities", verifyStudent, getOpportunities);
router.get("/opportunities/:id", verifyStudent, getOpportunityById);
router.post("/opportunities/:id/reminder", verifyStudent, setOpportunityReminder);

// ── Categorized Guides & Exams ────────────────────────────────────────────────
router.get("/government-exams", verifyStudent, getGovernmentExams);
router.get("/higher-studies", verifyStudent, getHigherStudiesGuide);
router.get("/entrance-exams", verifyStudent, getHigherStudiesGuide);
router.get("/upcoming-exams", verifyStudent, getGovernmentExams);

// ── Application Tracker ───────────────────────────────────────────────────────
router.get("/applications", verifyStudent, getUserApplications);
router.post("/applications", verifyStudent, createOrUpdateApplication);
router.put("/applications/:id", verifyStudent, createOrUpdateApplication);

// ── Web Research & Refresh ────────────────────────────────────────────────────
router.post("/research/refresh", verifyStudent, refreshOpportunityResearch);

// ── AI Advisor Chat ───────────────────────────────────────────────────────────
router.post(
  "/advisor/chat",
  verifyStudent,
  rateLimit({ keyFn: (req) => `grad-chat:${req.student._id || req.student?.id}`, max: 30, windowMs: 60000 }),
  askAdvisorChat
);

// ── Peer Mentorship (Graduate-side) ───────────────────────────────────────────
router.get("/mentor/requests", verifyStudent, getIncomingMentorRequests);
router.post("/mentor/requests/:id/accept", verifyStudent, acceptMentorRequest);
router.post("/mentor/requests/:id/reject", verifyStudent, rejectMentorRequest);
router.get("/mentor/mentees", verifyStudent, getActiveMentees);
router.get("/mentor/relationships/:id/messages", verifyStudent, getRelationshipMessages);
router.post("/mentor/relationships/:id/messages", verifyStudent, sendRelationshipMessage);
router.get("/mentor/profile", verifyStudent, getMentorProfile);
router.put("/mentor/profile", verifyStudent, updateMentorProfile);

// ── Resume Builder & ATS Score Checker (Graduate Portal) ───────────────────────
router.get("/resume", verifyStudent, generateResumeSuggestions);
router.get("/resume/versions", verifyStudent, getResumeVersions);
router.post("/resume/save", verifyStudent, saveResumeVersion);
router.delete("/resume/:id", verifyStudent, deleteResumeVersion);
router.post("/resume/generate-summary", verifyStudent, generateAiSummary);

router.get("/ats-presets", verifyStudent, getAtsPresets);
router.post("/ats-checker", verifyStudent, uploadResume.single("resumeFile"), checkResumeAtsScore);
router.get("/ats-history", verifyStudent, getAtsHistory);

const optionalStudent = require("../middleware/optionalStudent");

// ── Exam Intelligence & Exam-Specific Study Roadmap ───────────────────────────
router.get("/exams", optionalStudent, getExams);
router.get("/exams/:examId", optionalStudent, getExamById);
router.get("/exams/:examId/pattern", optionalStudent, getExamPattern);
router.get("/exams/:examId/syllabus", optionalStudent, getExamSyllabus);
router.get("/exams/:examId/papers", optionalStudent, getExamPapers);
router.post("/exams/:examId/research", optionalStudent, researchExam);
router.get("/exams/:examId/study-plan", optionalStudent, getStudyPlan);
router.post("/exams/:examId/study-plan", verifyStudent, createOrUpdateStudyPlan);
router.post("/exams/:examId/recalculate-plan", verifyStudent, createOrUpdateStudyPlan);
router.get("/exams/:examId/progress", optionalStudent, getExamProgress);
router.post("/exams/:examId/topic/:topicId/progress", verifyStudent, recordTopicProgress);
router.post("/exams/:examId/mock/submit", verifyStudent, submitMockTest);

module.exports = router;