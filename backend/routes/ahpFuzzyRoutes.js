const express = require("express");
const router = express.Router();
const verifyStudent = require("../middleware/verifyStudent");
const {
  getAhpFuzzyQuestions,
  evaluateStudentAssessment,
  getDiscoveryResult,
  importQuestionBankPdf
} = require("../controllers/ahpFuzzyController");

// Public / Authenticated discovery questions & assessment start
router.get("/questions", getAhpFuzzyQuestions);
router.get("/discovery/questions", getAhpFuzzyQuestions);
router.post("/start", getAhpFuzzyQuestions);
router.post("/assessment/start", getAhpFuzzyQuestions);

// PDF Master Question Bank Import
router.post("/import", importQuestionBankPdf);
router.post("/import-pdf", importQuestionBankPdf);

// Student answer & fuzzy evaluation
router.post("/evaluate", verifyStudent, evaluateStudentAssessment);
router.post("/discovery/evaluate", verifyStudent, evaluateStudentAssessment);
router.post("/answer", verifyStudent, evaluateStudentAssessment);
router.post("/discovery/answer", verifyStudent, evaluateStudentAssessment);

// Result endpoints (PART 12)
router.get("/result", verifyStudent, getDiscoveryResult);
router.get("/discovery/result", verifyStudent, getDiscoveryResult);

module.exports = router;
