const express = require("express");
const router = express.Router();
const onboardingController = require("../controllers/onboardingController");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyStudent = require("../middleware/verifyStudent");
const verifyOwnership = require("../middleware/verifyOwnership");
const onboardingAssessmentController = require("../controllers/onboardingAssessmentController");
const OnboardingQuestion = require("../models/OnboardingQuestion");

router.get("/questions/:grade", onboardingController.getQuestions);
router.post("/submit", onboardingController.submitOnboarding);
router.get("/recommendations/user/:userId", verifyStudent, verifyOwnership("userId"), onboardingController.getRecommendations);
router.get("/assessment/questions", onboardingAssessmentController.generateAssessment);
router.post("/generate-questions", onboardingAssessmentController.generateOnboardingQuestions);
router.get("/result/:studentId", verifyStudent, verifyOwnership("studentId"), onboardingAssessmentController.getOnboardingResult);
router.get("/response/user/:userId", verifyStudent, verifyOwnership("userId"), onboardingAssessmentController.getLatestResponse);
router.post("/retake/:userId", verifyStudent, verifyOwnership("userId"), onboardingController.retakeAssessment);

// Admin — student assessment results (per-skill rows grouped into attempts)
router.get("/admin/results", verifyAdmin, onboardingAssessmentController.getAdminResults);

// Admin — CRUD for recommendation rules (grade × skill × level → activity/exam)
router.get("/admin/rules", verifyAdmin, onboardingAssessmentController.getRecommendationRules);
router.post("/admin/rules", verifyAdmin, onboardingAssessmentController.createRecommendationRule);
router.put("/admin/rules/:id", verifyAdmin, onboardingAssessmentController.updateRecommendationRule);
router.delete("/admin/rules/:id", verifyAdmin, onboardingAssessmentController.deleteRecommendationRule);

// Admin — CRUD for guideline rules (overallLevel → quick guideline message)
router.get("/admin/guidelines", verifyAdmin, onboardingAssessmentController.getGuidelineRules);
router.post("/admin/guidelines", verifyAdmin, onboardingAssessmentController.createGuidelineRule);
router.put("/admin/guidelines/:id", verifyAdmin, onboardingAssessmentController.updateGuidelineRule);
router.delete("/admin/guidelines/:id", verifyAdmin, onboardingAssessmentController.deleteGuidelineRule);

// Admin — CRUD for onboarding questions
router.post("/admin/questions", verifyAdmin, async (req, res) => {
    try {
        const question = await OnboardingQuestion.create(req.body);
        res.status(201).json({ success: true, question });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create question" });
    }
});

router.get("/admin/questions", verifyAdmin, async (req, res) => {
    try {
        const { grade } = req.query;
        const filter = {};
        if (grade && grade !== "all") {
            filter.grade = grade;
        }
        const questions = await OnboardingQuestion.find(filter).sort({ grade: 1, skillTag: 1 });
        res.json({ success: true, questions });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch questions" });
    }
});

router.put("/admin/questions/:id", verifyAdmin, async (req, res) => {
    try {
        const question = await OnboardingQuestion.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, question });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update question" });
    }
});

router.delete("/admin/questions/:id", verifyAdmin, async (req, res) => {
    try {
        await OnboardingQuestion.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Question deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete question" });
    }
});

// ══════════════════════════════════════════════════════════════════════════
// LD-NBSE — Learning DNA · Next Best Skill Engine (student flow + admin)
// ══════════════════════════════════════════════════════════════════════════
const learningDiagnosis = require("../controllers/learningDiagnosisController");

// Student flow
router.post("/ld/generate-questions", learningDiagnosis.generateDiagnosticQuestions);
router.post("/ld/submit", learningDiagnosis.submitDiagnostic);
router.post("/ld/reassess", learningDiagnosis.reassessDiagnostic);
router.get("/ld/result/:studentId", verifyStudent, verifyOwnership("studentId"), learningDiagnosis.getDiagnosticResult);

// Admin configuration (Part 27)
router.get("/ld/admin/config", verifyAdmin, learningDiagnosis.getLdConfig);
router.put("/ld/admin/config", verifyAdmin, learningDiagnosis.updateLdConfig);
router.put("/ld/admin/taxonomy", verifyAdmin, learningDiagnosis.updateTaxonomy);
router.put("/ld/admin/dependencies", verifyAdmin, learningDiagnosis.updateDependencies);

module.exports = router;