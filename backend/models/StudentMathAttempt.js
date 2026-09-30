const mongoose = require("mongoose");

// Audit log for the Class 8 Maths Missions: every graded answer and every
// hint request. The recent-failure signal from this collection drives the
// adaptive difficulty (a struggling student is served an easier
// reinforcement question on their next attempt).
const studentMathAttemptSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    topic: { type: String, required: true },
    mission: { type: String, required: true },
    questionId: { type: String, required: true },
    answer: { type: mongoose.Schema.Types.Mixed, default: null },
    correct: { type: Boolean, default: null }, // null = hint request only
    difficulty: { type: String, default: "" },
    hintsUsed: { type: Number, default: 0 },
    kind: { type: String, enum: ["answer", "hint"], default: "answer" },
  },
  { timestamps: true }
);

studentMathAttemptSchema.index({ studentId: 1, mission: 1, createdAt: -1 });
module.exports = mongoose.model("StudentMathAttempt", studentMathAttemptSchema);