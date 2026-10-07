const mongoose = require("mongoose");

const practiceSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: String,
      required: true,
      index: true
    },
    subjectId: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    subjectName: {
      type: String,
      required: true,
      trim: true
    },
    topic: {
      type: String,
      trim: true,
      default: null
    },
    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD", "ADVANCED"],
      required: true
    },
    questions: [
      {
        questionId: { type: String, required: true },
        questionText: { type: String, required: true, trim: true },
        topic: { type: String, default: "" },
        options: [
          {
            id: { type: String, required: true, enum: ["A", "B", "C", "D"] },
            text: { type: String, required: true, trim: true }
          }
        ],
        correctOption: { type: String, required: true, enum: ["A", "B", "C", "D"] },
        explanation: { type: String, required: true, trim: true }
      }
    ],
    currentQuestionIndex: {
      type: Number,
      default: 0
    },
    answers: [
      {
        questionId: { type: String, required: true },
        selectedOption: { type: String, default: null },
        isCorrect: { type: Boolean, default: false },
        answerTimeMs: { type: Number, default: 0 },
        score: { type: Number, default: 0 },
        speedBonus: { type: Number, default: 0 },
        answeredAt: { type: Date, default: Date.now }
      }
    ],
    score: {
      type: Number,
      default: 0
    },
    maxPossibleScore: {
      type: Number,
      default: 750
    },
    correctCount: {
      type: Number,
      default: 0
    },
    wrongCount: {
      type: Number,
      default: 0
    },
    skippedCount: {
      type: Number,
      default: 0
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "ABANDONED"],
      default: "IN_PROGRESS"
    }
  },
  { timestamps: true }
);

practiceSessionSchema.index({ userId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("PracticeSession", practiceSessionSchema);
