const mongoose = require("mongoose");

const studentTestResultSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        classLevel: {
            type: String,
            required: true,
        },
        answers: [
            {
                questionId: { type: mongoose.Schema.Types.ObjectId, ref: "AssessmentQuestion" },
                selectedAnswer: String,
                isCorrect: Boolean,
                category: String,
                marks: Number,
            },
        ],
        categoryScores: [
            {
                category: String,
                score: Number,
                total: Number,
                percentage: Number,
            },
        ],
        totalScore: {
            score: Number,
            total: Number,
            percentage: Number,
        },
        performanceLevel: {
            type: String,
            enum: ["Excellent", "Good", "Average", "Needs Improvement"],
        },
        strengths: [String],
        weaknesses: [String],
        averageAreas: [String],
        recommendations: {
            careers: [String],
            courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
            colleges: [{ type: mongoose.Schema.Types.ObjectId, ref: "College" }],
            exams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exam" }],
            scholarships: [{ type: mongoose.Schema.Types.ObjectId, ref: "Scholarship" }],
        },
        improvementPlan: [
            {
                area: String,
                guideline: String,
                actions: [String],
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("StudentTestResult", studentTestResultSchema);
