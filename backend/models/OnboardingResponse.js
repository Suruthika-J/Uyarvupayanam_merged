const mongoose = require("mongoose");

const onboardingResponseSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        grade: {
            type: String,
            required: true,
        },
        answers: [
            {
                questionId: { type: mongoose.Schema.Types.ObjectId, ref: "OnboardingQuestion" },
                selectedAnswer: String,
                isCorrect: Boolean,
            },
        ],
        totalQuestions: { type: Number, required: true },
        correctAnswers: { type: Number, required: true },
        wrongAnswers: { type: Number, required: true },
        scorePercentage: { type: Number, required: true },
        performanceLevel: { type: String, required: true },
        skillWiseScore: [
            {
                skillTag: String,
                score: Number,
                total: Number,
                percentage: Number,
                status: String, // Strong Skill, Average Skill, Improvement Needed
            },
        ],
        strongSkills: [String],
        averageSkills: [String],
        weakSkills: [String],
    },
    { timestamps: true }
);

module.exports = mongoose.model("OnboardingResponse", onboardingResponseSchema);
