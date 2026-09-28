const mongoose = require("mongoose");

const collegeOnboardingQuestionSchema = new mongoose.Schema(
  {
    field: {
      type: String,
      required: true,
      trim: true
    },
    degree: {
      type: String,
      trim: true
    },
    domain: {
      type: String,
      required: true,
      trim: true
    },
    specialization: {
      type: String,
      trim: true
    },
    academicYear: {
      type: String,
      trim: true
    },
    semester: {
      type: String,
      trim: true
    },
    topic: {
      type: String,
      required: true,
      trim: true
    },
    questionText: {
      type: String,
      required: true,
      trim: true
    },
    options: [
      {
        type: String,
        required: true,
        trim: true
      }
    ],
    correctAnswer: {
      type: String,
      required: true,
      trim: true
    },
    explanation: {
      type: String,
      trim: true
    },
    difficulty: {
      type: String,
      enum: ["VERY_EASY", "EASY", "MODERATE"],
      required: true,
      default: "VERY_EASY"
    },
    questionType: {
      type: String,
      default: "MULTIPLE_CHOICE"
    },
    source: {
      type: String,
      enum: ["DATABASE", "AI_GENERATED"],
      default: "DATABASE"
    },
    status: {
      type: String,
      enum: ["ACTIVE", "DRAFT", "ARCHIVED"],
      default: "ACTIVE"
    }
  },
  { timestamps: true }
);

// Indexes for fast lookup by taxonomy hierarchy and difficulty
collegeOnboardingQuestionSchema.index({ domain: 1, difficulty: 1, status: 1 });
collegeOnboardingQuestionSchema.index({ specialization: 1, domain: 1, difficulty: 1 });
collegeOnboardingQuestionSchema.index({ field: 1, degree: 1 });

module.exports = mongoose.model("CollegeOnboardingQuestion", collegeOnboardingQuestionSchema);
