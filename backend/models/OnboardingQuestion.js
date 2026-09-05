const mongoose = require("mongoose");

const onboardingQuestionSchema = new mongoose.Schema(
    {
        grade: {
            type: String,
            required: true,
            enum: ["Class 5", "Class 8", "Class 10", "Class 12"],
        },
        questionText: {
            type: String,
            required: true,
        },
        options: [{ type: String }],
        correctAnswer: {
            type: String,
            required: true,
        },
        skillTag: {
            type: String,
            required: true,
        },
        difficultyLevel: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            default: "Easy",
        },
        recommendationCategory: {
            type: String,
            required: true,
        },
        explanation: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("OnboardingQuestion", onboardingQuestionSchema);
