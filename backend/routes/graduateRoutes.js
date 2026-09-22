const express = require("express");
const router = express.Router();
const graduateController = require("../controllers/graduateController");
const graduateAdvisorController = require("../controllers/graduateAdvisorController");
const verifyStudent = require("../middleware/verifyStudent");

// ── Profile & Onboarding ───────────────────────────────────────────────────────
router.get("/profile", verifyStudent, graduateController.getMyProfile);
router.post("/profile/step", verifyStudent, graduateController.saveOnboardingStep);
router.post("/onboarding/complete", verifyStudent, graduateController.completeOnboarding);

// ── Dashboard & Specialized Intelligence ──────────────────────────────────────
router.get("/dashboard", verifyStudent, graduateController.getDashboardSummary);
router.get("/careers", verifyStudent, graduateController.getCareerRecommendations);
router.get("/skill-gap", verifyStudent, graduateController.getSkillGapAnalysis);
router.get("/exams", verifyStudent, graduateController.getExamsGuide);
router.get("/higher-studies", verifyStudent, graduateController.getHigherStudiesGuide);
router.get("/roadmap", verifyStudent, graduateController.getUpskillingRoadmap);

// ── AI Graduate Advisor ────────────────────────────────────────────────────────
router.post("/advisor/chat", verifyStudent, graduateAdvisorController.chatWithGraduateAdvisor);

module.exports = router;
