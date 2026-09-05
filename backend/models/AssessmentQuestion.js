const mongoose = require("mongoose");

const assessmentQuestionSchema = new mongoose.Schema(
    {
        classLevel: {
            type: String,
            required: true,
            enum: ["5", "8", "10", "12"],
        },
        category: {
            type: String,
            required: true,
            enum: [
                "Logical Thinking",
                "Mathematics / Quantitative Ability",
                "Science Understanding",
                "Communication",
                "Creativity",
                "Career Interest",
                "Decision Making",
                "General Awareness",
            ],
        },
        questionText: {
            type: String,
            required: true,
        },
        options: [
            {
                text: { type: String, required: true },
            },
        ],
        correctAnswer: {
            type: String,
            required: true,
        },
        marks: {
            type: Number,
            default: 1,
        },
        recommendationTag: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AssessmentQuestion", assessmentQuestionSchema);
