const mongoose = require("mongoose");

// One row per student + question so repeat visits serve new questions first
// (mirrors StudentDiscoverProgress). Tracked per student, never displayed as
// a score - it only drives "which question comes next".
const mathsProgressSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    questionId: { type: Number, required: true },
    topic: { type: String, required: true },
    solved: { type: Boolean, default: false },
    solvedAt: { type: Date, default: null },
    attemptCount: { type: Number, default: 0 },
    attempts: [{ correct: { type: Boolean }, at: { type: Date, default: Date.now } }],
    classId: { type: String, default: "5" },
    schoolId: { type: String, default: "default" },
  },
  { timestamps: true }
);

mathsProgressSchema.index({ studentId: 1, questionId: 1 }, { unique: true });
module.exports = mongoose.model("MathsProgress", mathsProgressSchema);