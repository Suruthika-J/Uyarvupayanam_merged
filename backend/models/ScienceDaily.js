const mongoose = require("mongoose");

// Per-student daily challenge completion. One row per student + day + question
// so "has today's challenge been solved?" is a quick lookup and completion is
// preserved across refreshes without inventing a second progress system.
const scienceDailySchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dateKey: { type: String, required: true }, // "YYYY-MM-DD"
    questionId: { type: Number, required: true },
    solved: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
    solvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

scienceDailySchema.index({ studentId: 1, dateKey: 1, questionId: 1 }, { unique: true });
module.exports = mongoose.model("ScienceDaily", scienceDailySchema);