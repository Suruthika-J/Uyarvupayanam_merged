const express = require("express");
const router = express.Router();
const assessmentController = require("../controllers/assessmentController");
const verifyAdmin = require("../middleware/verifyAdmin");

// Student Routes
router.get("/questions/:classLevel", assessmentController.getQuestionsByLevel);
router.post("/submit", assessmentController.submitAssessment);
router.get("/result/:userId", assessmentController.getLatestResult);

// Admin Routes
router.post("/admin/questions", verifyAdmin, assessmentController.createQuestion);
router.get("/admin/questions", verifyAdmin, assessmentController.getAllQuestions);
router.put("/admin/questions/:id", verifyAdmin, assessmentController.updateQuestion);
router.delete("/admin/questions/:id", verifyAdmin, assessmentController.deleteQuestion);

module.exports = router;
