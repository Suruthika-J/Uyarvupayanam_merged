const AssessmentQuestion = require("../models/AssessmentQuestion");
const StudentTestResult = require("../models/StudentTestResult");
const Course = require("../models/Course");
const College = require("../models/College");
const Exam = require("../models/Exam");
const Scholarship = require("../models/Scholarship");
const User = require("../models/User");

// GET /api/assessment/questions/:classLevel
exports.getQuestionsByLevel = async (req, res) => {
    try {
        const { classLevel } = req.params;
        const questions = await AssessmentQuestion.find({ classLevel });
        res.json({ success: true, questions });
    } catch (error) {
        console.error("Get questions error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch questions" });
    }
};

// POST /api/assessment/submit
exports.submitAssessment = async (req, res) => {
    try {
        const { userId, classLevel, answers } = req.body;

        if (!userId || !classLevel || !answers) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // 1. Process Answers and Calculate Scores
        let totalMarksObtained = 0;
        let totalPossibleMarks = 0;
        const processedAnswers = [];
        const categoryData = {};

        for (const ans of answers) {
            const question = await AssessmentQuestion.findById(ans.questionId);
            if (!question) continue;

            const isCorrect = question.correctAnswer === ans.selectedAnswer;
            const marks = isCorrect ? question.marks : 0;

            totalMarksObtained += marks;
            totalPossibleMarks += question.marks;

            processedAnswers.push({
                questionId: question._id,
                selectedAnswer: ans.selectedAnswer,
                isCorrect,
                category: question.category,
                marks: marks,
            });

            if (!categoryData[question.category]) {
                categoryData[question.category] = { score: 0, total: 0 };
            }
            categoryData[question.category].score += marks;
            categoryData[question.category].total += question.marks;
        }

        // 2. Finalize category scores and identify strengths/weaknesses
        const categoryScores = [];
        const strengths = [];
        const weaknesses = [];
        const averageAreas = [];

        for (const cat in categoryData) {
            const percentage = (categoryData[cat].score / categoryData[cat].total) * 100;
            categoryScores.push({
                category: cat,
                score: categoryData[cat].score,
                total: categoryData[cat].total,
                percentage,
            });

            if (percentage >= 75) strengths.push(cat);
            else if (percentage < 50) weaknesses.push(cat);
            else averageAreas.push(cat);
        }

        const totalPercentage = (totalMarksObtained / totalPossibleMarks) * 100;
        let performanceLevel = "Needs Improvement";
        if (totalPercentage >= 80) performanceLevel = "Excellent";
        else if (totalPercentage >= 60) performanceLevel = "Good";
        else if (totalPercentage >= 40) performanceLevel = "Average";

        // 3. Generate Recommendations based on Strengths
        const recommendedCareers = [];
        const recommendationKeywords = [];

        if (strengths.includes("Logical Thinking") || strengths.includes("Mathematics / Quantitative Ability")) {
            recommendedCareers.push("Engineering", "Computer Science", "Data Science", "IT", "Polytechnic");
            recommendationKeywords.push("Engineering", "IT", "Technology", "Computer");
        }
        if (strengths.includes("Communication") || strengths.includes("Creativity")) {
            recommendedCareers.push("Arts", "Design", "Media", "Teaching", "Law", "Journalism", "Management");
            recommendationKeywords.push("Arts", "Design", "Management", "Law");
        }
        if (strengths.includes("Science Understanding")) {
            recommendedCareers.push("Medical", "Nursing", "Agriculture", "Pharmacy", "Biotechnology");
            recommendationKeywords.push("Medical", "Science", "Agriculture");
        }
        if (strengths.includes("General Awareness") || strengths.includes("Decision Making")) {
            recommendedCareers.push("Civil Services", "Law", "Public Administration", "Commerce", "Management");
            recommendationKeywords.push("Commerce", "Management", "Civil Services");
        }

        // Filter and fetch dynamic recommendations from DB
        // Based on keywords and class level
        const query = {
            $or: [
                { targetClass: { $in: [classLevel, "All"] } },
                { gradeLevel: { $in: [classLevel, "All"] } },
                { eligibleClasses: { $in: [classLevel, "All"] } }
            ]
        };

        // This is a simplified search logic, can be refined
        const [courses, colleges, scholarships, exams] = await Promise.all([
            Course.find({ ...query, category: { $in: recommendationKeywords } }).limit(5),
            College.find({ ...query }).limit(5), // Colleges might need better filtering
            Scholarship.find({ ...query }).limit(5),
            Exam.find({ ...query }).limit(5)
        ]);

        // 4. Generate Improvement Plan
        const improvementPlan = [];
        for (const area of weaknesses) {
            let plan = { area, guideline: "", actions: [] };
            if (area === "Mathematics / Quantitative Ability") {
                plan.guideline = "Practice basic arithmetic, algebra, and problem-solving";
                plan.actions = ["Take weekly math quiz", "Explore beginner aptitude resources", "Retake assessment after 2 weeks"];
            } else if (area === "Communication") {
                plan.guideline = "Practice reading daily and improve spoken communication";
                plan.actions = ["Read English/Tamil news daily", "Complete short writing tasks", "Attend communication skill activities"];
            } else if (area === "Career Interest") {
                plan.guideline = "Explore different career paths to find your passion";
                plan.actions = ["View career exploration cards", "Ask additional interest questions", "Talk to a mentor"];
            } else {
                plan.guideline = `Focus on improving your understanding of ${area}`;
                plan.actions = [`Review ${area} fundamentals`, "Practice related exercises"];
            }
            improvementPlan.push(plan);
        }

        const result = new StudentTestResult({
            userId,
            classLevel,
            answers: processedAnswers,
            categoryScores,
            totalScore: {
                score: totalMarksObtained,
                total: totalPossibleMarks,
                percentage: totalPercentage,
            },
            performanceLevel,
            strengths,
            weaknesses,
            averageAreas,
            recommendations: {
                careers: recommendedCareers,
                courses: courses.map(c => c._id),
                colleges: colleges.map(c => c._id),
                exams: exams.map(e => e._id),
                scholarships: scholarships.map(s => s._id),
            },
            improvementPlan,
        });

        await result.save();

        res.status(201).json({ success: true, result });
    } catch (error) {
        console.error("Submit assessment error:", error);
        res.status(500).json({ success: false, message: "Failed to submit assessment" });
    }
};

// GET /api/assessment/result/:userId
exports.getLatestResult = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await StudentTestResult.findOne({ userId })
            .sort({ createdAt: -1 })
            .populate("recommendations.courses")
            .populate("recommendations.colleges")
            .populate("recommendations.exams")
            .populate("recommendations.scholarships");
        
        if (!result) {
            return res.status(404).json({ success: false, message: "No test results found" });
        }
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch results" });
    }
};

// Admin APIs for Question Management
exports.createQuestion = async (req, res) => {
    try {
        const question = await AssessmentQuestion.create(req.body);
        res.status(201).json({ success: true, question });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create question" });
    }
};

exports.getAllQuestions = async (req, res) => {
    try {
        const { grade } = req.query;
        const filter = {};
        if (grade && grade !== "all") {
            filter.classLevel = grade;
        }
        const questions = await AssessmentQuestion.find(filter).sort({ classLevel: 1, category: 1 });
        res.json({ success: true, questions });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch questions" });
    }
};

exports.updateQuestion = async (req, res) => {
    try {
        const question = await AssessmentQuestion.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, question });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update question" });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        await AssessmentQuestion.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Question deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete question" });
    }
};
