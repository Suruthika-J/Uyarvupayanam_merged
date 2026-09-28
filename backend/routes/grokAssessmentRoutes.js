const express = require("express");
const router = express.Router();
const { generateGrokQuestions } = require("../controllers/grokAssessmentController");

router.post("/generate-grok-questions", generateGrokQuestions);

module.exports = router;
