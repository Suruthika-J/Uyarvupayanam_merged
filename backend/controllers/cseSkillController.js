const CseSkillQuestion = require("../models/CseSkillQuestion");

// GET 18 Default CSE Skill MCQ Questions
const getCseSkillQuestions = async (req, res) => {
  try {
    let questions = await CseSkillQuestion.find({ status: "active" }).sort({ questionNumber: 1 });
    if (!questions || questions.length === 0) {
      const { seedCseSkillQuestions } = require("../seeders/seedCseSkillQuestions");
      await seedCseSkillQuestions();
      questions = await CseSkillQuestion.find({ status: "active" }).sort({ questionNumber: 1 });
    }

    res.status(200).json({
      success: true,
      count: questions.length,
      questions
    });
  } catch (error) {
    console.error("Get CSE Skill MCQ questions error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch CSE Skill MCQ questions" });
  }
};

// Evaluate Student CSE Skill MCQ Test Answers
const evaluateCseSkills = async (req, res) => {
  try {
    const { answers } = req.body; // Array of { questionNumber, optionId }
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: "Please provide answers for CSE Skill evaluation." });
    }

    const questions = await CseSkillQuestion.find({ status: "active" }).sort({ questionNumber: 1 });
    const answerMap = new Map();
    answers.forEach(a => answerMap.set(Number(a.questionNumber), a.optionId));

    let totalPointsEarned = 0;
    let totalMaxPoints = 0;
    let totalCorrectCount = 0;

    const domainScores = {
      "Full-Stack Web & Software": { points: 0, maxPoints: 0, correct: 0, total: 0, skillTag: "Full Stack Web (React / Node)" },
      "Artificial Intelligence & ML": { points: 0, maxPoints: 0, correct: 0, total: 0, skillTag: "AI & Machine Learning" },
      "Data Science & Analytics": { points: 0, maxPoints: 0, correct: 0, total: 0, skillTag: "Python / Data Science" },
      "Cybersecurity & DevSecOps": { points: 0, maxPoints: 0, correct: 0, total: 0, skillTag: "Cyber Security / Ethical Hacking" },
      "Cloud Computing & DevOps": { points: 0, maxPoints: 0, correct: 0, total: 0, skillTag: "Cloud Computing & DevOps" },
      "Algorithms & Data Structures": { points: 0, maxPoints: 0, correct: 0, total: 0, skillTag: "Problem Solving & Logic" }
    };

    const evaluatedDetails = [];
    const verifiedSkills = new Set();

    questions.forEach(q => {
      const selectedOptId = answerMap.get(q.questionNumber);
      const domain = q.domain;
      const correctOpt = q.options.find(o => o.isCorrect);
      const selectedOpt = q.options.find(o => o.optionId === selectedOptId);

      const maxPts = q.difficulty === "Hard" ? 3 : q.difficulty === "Medium" ? 2 : 1;
      totalMaxPoints += maxPts;

      if (domainScores[domain]) {
        domainScores[domain].maxPoints += maxPts;
        domainScores[domain].total += 1;
      }

      const isCorrect = selectedOpt && selectedOpt.isCorrect === true;
      if (isCorrect) {
        totalCorrectCount += 1;
        totalPointsEarned += maxPts;
        if (domainScores[domain]) {
          domainScores[domain].points += maxPts;
          domainScores[domain].correct += 1;
        }
        if (q.skillTag) {
          verifiedSkills.add(q.skillTag);
        }
      }

      evaluatedDetails.push({
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        domain: q.domain,
        difficulty: q.difficulty,
        selectedOptionId: selectedOptId || null,
        correctOptionId: correctOpt ? correctOpt.optionId : null,
        isCorrect: isCorrect || false,
        explanation: q.explanation
      });
    });

    const domainBreakdown = Object.entries(domainScores).map(([domName, data]) => {
      const pct = data.maxPoints > 0 ? Math.round((data.points / data.maxPoints) * 100) : 0;
      return {
        domainName: domName,
        skillTag: data.skillTag,
        scorePercent: pct,
        correctCount: data.correct,
        totalQuestions: data.total
      };
    }).sort((a, b) => b.scorePercent - a.scorePercent);

    const overallAccuracyPercent = questions.length > 0 ? Math.round((totalCorrectCount / questions.length) * 100) : 0;

    res.status(200).json({
      success: true,
      evaluation: {
        totalCorrectCount,
        totalQuestions: questions.length,
        totalPointsEarned,
        totalMaxPoints,
        overallAccuracyPercent,
        verifiedSkills: Array.from(verifiedSkills),
        topDomain: domainBreakdown[0] ? domainBreakdown[0].domainName : "Full-Stack Web & Software",
        domainBreakdown,
        evaluatedDetails
      }
    });
  } catch (error) {
    console.error("Evaluate CSE Skills error:", error);
    res.status(500).json({ success: false, message: "CSE Skill evaluation error" });
  }
};

module.exports = { getCseSkillQuestions, evaluateCseSkills };
