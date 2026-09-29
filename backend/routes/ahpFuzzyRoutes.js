const express = require("express");
const router = express.Router();
const verifyStudent = require("../middleware/verifyStudent");
const {
  getAhpFuzzyQuestions,
  evaluateStudentAssessment,
  getDiscoveryResult
} = require("../controllers/ahpFuzzyController");

// Public / Authenticated discovery questions
router.get("/questions", getAhpFuzzyQuestions);
router.get("/discovery/questions", getAhpFuzzyQuestions);

// Student answer & fuzzy evaluation
router.post("/evaluate", evaluateStudentAssessment);
router.post("/discovery/evaluate", evaluateStudentAssessment);
router.post("/answer", evaluateStudentAssessment);
router.post("/discovery/answer", evaluateStudentAssessment);

// Result endpoints (PART 12)
router.get("/result", verifyStudent, getDiscoveryResult);
router.get("/discovery/result", verifyStudent, getDiscoveryResult);

module.exports = router;
