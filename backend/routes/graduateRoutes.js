const express = require("express");
const router = express.Router();
const {
  getMyProfile,
  saveOnboardingStep,
  completeOnboarding,
  getDashboardSummary,
  getCareerRecommendations,
  getSkillGapAnalysis,
  getExamsGuide,
  getHigherStudiesGuide,
  getUpskillingRoadmap,
  getRecommendations,
  getNotifications,
} = require("../controllers/graduateController");
const { askAdvisorChat } = require("../controllers/collegeStudyToolsController");
const verifyStudent = require("../middleware/verifyStudent");
const { rateLimit } = require("../middleware/rateLimit");

// ── Graduate Career Portal ────────────────────────────────────────────────────
// All handlers derive the acting user exclusively from the verified token
// (req.student._id); no client-supplied user/profile identifiers are trusted.

router.get("/profile", verifyStudent, getMyProfile);
router.post(
  "/profile/step",
  verifyStudent,
  rateLimit({ keyFn: (req) => `grad-step:${req.student._id}`, max: 40, windowMs: 60000 }),
  saveOnboardingStep
);
router.post(
  "/onboarding/complete",
  verifyStudent,
  rateLimit({ keyFn: (req) => `grad-onb:${req.student._id}`, max: 10, windowMs: 60000 }),
  completeOnboarding
);
router.get("/dashboard", verifyStudent, getDashboardSummary);
router.get("/careers", verifyStudent, getCareerRecommendations);
router.get("/skill-gap", verifyStudent, getSkillGapAnalysis);
router.get("/exams", verifyStudent, getExamsGuide);
router.get("/higher-studies", verifyStudent, getHigherStudiesGuide);
router.get("/roadmap", verifyStudent, getUpskillingRoadmap);
router.get("/recommendations", verifyStudent, getRecommendations);
router.get("/notifications", verifyStudent, getNotifications);

// AI career advisor — reuses the shared study-tools chat handler (same identity
// contract: req.student, graceful fallback reply on provider errors/rate limits).
router.post(
  "/advisor/chat",
  verifyStudent,
  rateLimit({ keyFn: (req) => `grad-chat:${req.student._id}`, max: 20, windowMs: 60000 }),
  askAdvisorChat
);

module.exports = router;