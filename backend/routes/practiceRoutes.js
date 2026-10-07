const express = require("express");
const router = express.Router();
const verifyStudent = require("../middleware/verifyStudent");
const { getPracticeQuestions, generatePracticeQuestions } = require("../controllers/collegeStudyToolsController");

// GET /api/practice/questions?subjectId=dbms&difficulty=EASY&limit=5
router.get("/questions", verifyStudent, getPracticeQuestions);

// POST /api/practice/questions
router.post("/questions", verifyStudent, generatePracticeQuestions);

module.exports = router;
