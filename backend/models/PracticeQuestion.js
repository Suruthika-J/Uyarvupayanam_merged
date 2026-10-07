const mongoose = require("mongoose");

const practiceQuestionSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    subjectId: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true
    },
    subjectName: {
      type: String,
      required: true,
      trim: true
    },
    topicId: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    topicName: {
      type: String,
      required: true,
      trim: true
    },
    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD", "ADVANCED"],
      required: true,
      index: true
    },
    difficultyScore: {
      type: Number,
      required: true,
      default: 25
    },
    difficultyReason: {
      type: String,
      trim: true
    },
    questionText: {
      type: String,
      required: true,
      trim: true
    },
    normalizedQuestion: {
      type: String,
      required: true,
      index: true
    },
    options: [
      {
        id: { type: String, required: true, enum: ["A", "B", "C", "D"] },
        text: { type: String, required: true, trim: true }
      }
    ],
    correctOption: {
      type: String,
      required: true,
      enum: ["A", "B", "C", "D"]
    },
    explanation: {
      type: String,
      required: true,
      trim: true
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Compound index for fast difficulty-based subject lookups
practiceQuestionSchema.index({ subjectId: 1, difficulty: 1, active: 1 });

module.exports = mongoose.model("PracticeQuestion", practiceQuestionSchema);
