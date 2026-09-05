const express = require("express");
const router = express.Router();
const onboardingController = require("../controllers/onboardingController");
const verifyAdmin = require("../middleware/verifyAdmin");
const OnboardingQuestion = require("../models/OnboardingQuestion");

router.get("/questions/:grade", onboardingController.getQuestions);
router.post("/submit", onboardingController.submitOnboarding);
router.get("/recommendations/user/:userId", onboardingController.getRecommendations);
router.post("/retake/:userId", onboardingController.retakeAssessment);

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

module.exports = router;
