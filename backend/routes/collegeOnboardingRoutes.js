const express = require("express");
const router = express.Router();
const collegeOnboardingController = require("../controllers/collegeOnboardingController");
const verifyStudent = require("../middleware/verifyStudent");
const verifyAdmin = require("../middleware/verifyAdmin");
const CollegeOnboardingQuestion = require("../models/CollegeOnboardingQuestion");

// ── Student Routes ─────────────────────────────────────────────────────────────
router.get("/questions", verifyStudent, collegeOnboardingController.getCollegeQuestions);
router.post("/submit", verifyStudent, collegeOnboardingController.submitCollegeOnboarding);
router.get("/baseline", verifyStudent, collegeOnboardingController.getCollegeBaseline);
router.post("/retake", verifyStudent, collegeOnboardingController.retakeDomainAssessment);

// ── Admin Routes — Manage College Questions ────────────────────────────────────
router.get("/admin/questions", verifyAdmin, async (req, res) => {
  try {
    const { field, domain, difficulty, specialization } = req.query;
    const filter = {};
    if (field && field !== "all") filter.field = field;
    if (domain && domain !== "all") filter.domain = domain;
    if (difficulty && difficulty !== "all") filter.difficulty = difficulty;
    if (specialization && specialization !== "all") filter.specialization = specialization;

    const questions = await CollegeOnboardingQuestion.find(filter).sort({ domain: 1, difficulty: 1 });
    res.json({ success: true, questions });
  } catch (error) {
    console.error("Admin fetch college questions error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch college questions" });
  }
});

router.post("/admin/questions", verifyAdmin, async (req, res) => {
  try {
    const question = await CollegeOnboardingQuestion.create(req.body);
    res.status(201).json({ success: true, question });
  } catch (error) {
    console.error("Admin create college question error:", error);
    res.status(500).json({ success: false, message: "Failed to create college question" });
  }
});

router.put("/admin/questions/:id", verifyAdmin, async (req, res) => {
  try {
    const question = await CollegeOnboardingQuestion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, question });
  } catch (error) {
    console.error("Admin update college question error:", error);
    res.status(500).json({ success: false, message: "Failed to update college question" });
  }
});

router.delete("/admin/questions/:id", verifyAdmin, async (req, res) => {
  try {
    await CollegeOnboardingQuestion.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "College question deleted" });
  } catch (error) {
    console.error("Admin delete college question error:", error);
    res.status(500).json({ success: false, message: "Failed to delete college question" });
  }
});

module.exports = router;
