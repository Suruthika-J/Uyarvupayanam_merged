const mongoose = require("mongoose");

const collegeOnboardingResponseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    field: { type: String, required: true },
    degree: { type: String },
    domain: { type: String, required: true },
    specialization: { type: String },
    academicYear: { type: String },
    semester: { type: String },

    answers: [
      {
        questionId: { type: String },
        questionText: { type: String, required: true },
        topic: { type: String },
        difficulty: {
          type: String,
          enum: ["VERY_EASY", "EASY", "MODERATE"],
          required: true
        },
        selectedAnswer: { type: String, required: true },
        correctAnswer: { type: String, required: true },
        isCorrect: { type: Boolean, required: true },
        responseTime: { type: Number, default: 0 } // in seconds
      }
    ],

    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    wrongAnswers: { type: Number, required: true },
    scorePercentage: { type: Number, required: true },

    stageBreakdown: {
      veryEasy: {
        total: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 }
      },
      easy: {
        total: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 }
      },
      moderate: {
        total: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 }
      }
    },

    topicBreakdown: [
      {
        topic: { type: String },
        total: { type: Number },
        correct: { type: Number },
        percentage: { type: Number }
      }
    ],

    baselineResult: {
      currentBaseline: { type: String, required: true },
      strengths: [{ type: String }],
      areasToStrengthen: [{ type: String }],
      recommendedStartingTopics: [{ type: String }]
    },

    isCurrentDomainBaseline: { type: Boolean, default: true }
  },
  { timestamps: true }
);

collegeOnboardingResponseSchema.index({ userId: 1, domain: 1, createdAt: -1 });

module.exports = mongoose.model("CollegeOnboardingResponse", collegeOnboardingResponseSchema);
