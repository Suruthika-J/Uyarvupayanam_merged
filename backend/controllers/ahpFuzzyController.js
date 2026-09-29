const AhpFuzzyQuestion = require("../models/AhpFuzzyQuestion");
const { evaluateAhpFuzzy } = require("../utils/ahpFuzzyEngine");

// GET 15 Default Questions (Easy, Medium, Hard)
const getAhpFuzzyQuestions = async (req, res) => {
  try {
    let questions = await AhpFuzzyQuestion.find({ status: "active" }).sort({ questionNumber: 1 });
    const missingDifficulty = questions.some(q => !q.difficulty);
    if (!questions || questions.length === 0 || missingDifficulty) {
      const { seedAhpFuzzyQuestions } = require("../seeders/seedAhpFuzzyQuestions");
      await seedAhpFuzzyQuestions();
      questions = await AhpFuzzyQuestion.find({ status: "active" }).sort({ questionNumber: 1 });
    }

    res.status(200).json({
      success: true,
      count: questions.length,
      questions
    });
  } catch (error) {
    console.error("Get AHP Fuzzy questions error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch AHP + Fuzzy questions" });
  }
};

// Evaluate Answers using AHP + Fuzzy Logic Algorithm
const evaluateStudentAssessment = async (req, res) => {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: "Please provide student answers for evaluation." });
    }

    const questions = await AhpFuzzyQuestion.find({ status: "active" }).sort({ questionNumber: 1 });
    const result = evaluateAhpFuzzy(answers, questions);

    res.status(200).json({
      success: true,
      evaluation: result
    });
  } catch (error) {
    console.error("Evaluate AHP Fuzzy error:", error);
    res.status(500).json({ success: false, message: "AHP + Fuzzy evaluation error" });
  }
};

module.exports = { getAhpFuzzyQuestions, evaluateStudentAssessment };
