const mongoose = require("mongoose");

// One row per student + question so repeat visits serve fresh questions first.
// Tracked per student, never shown as a score - it only drives "which question
// comes next" and the world's completion/lock state.
const socialProgressSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    questionId: { type: Number, required: true },
    world: { type: String, required: true },
    solved: { type: Boolean, default: false },
    solvedAt: { type: Date, default: null },
    attemptCount: { type: Number, default: 0 },
    attempts: [{ correct: { type: Boolean }, at: { type: Date, default: Date.now } }],
    classId: { type: String, default: "5" },
    schoolId: { type: String, default: "default" },
  },
  { timestamps: true }
);

socialProgressSchema.index({ studentId: 1, questionId: 1 }, { unique: true });
module.exports = mongoose.model("SocialProgress", socialProgressSchema);