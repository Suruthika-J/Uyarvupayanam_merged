const express = require("express");
const router = express.Router();
const { getAhpFuzzyQuestions, evaluateStudentAssessment } = require("../controllers/ahpFuzzyController");

router.get("/questions", getAhpFuzzyQuestions);
router.post("/evaluate", evaluateStudentAssessment);

module.exports = router;
