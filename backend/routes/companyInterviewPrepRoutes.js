const express = require("express");
const router = express.Router();
const verifyStudent = require("../middleware/verifyStudent");
const {
  researchCompany,
  generatePracticeQuestions,
  startMockInterview,
  respondMockInterview,
  submitInterviewResult
} = require("../controllers/companyInterviewPrepController");

router.post("/research", verifyStudent, researchCompany);
router.post("/generate-practice", verifyStudent, generatePracticeQuestions);
router.post("/mock-interview/start", verifyStudent, startMockInterview);
router.post("/mock-interview/respond", verifyStudent, respondMockInterview);
router.post("/submit", verifyStudent, submitInterviewResult);

// Backward compatibility legacy route fallback
router.post("/", verifyStudent, generatePracticeQuestions);

module.exports = router;
