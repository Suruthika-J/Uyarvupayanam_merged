const mongoose = require("mongoose");

// One row per student + question so repeat visits can serve new questions
// first and loop back to reviewed ones only once the bank is exhausted.
const studentDiscoverProgressSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    questionId: { type: String, required: true },
    worldKey: { type: String, default: "" },
    solved: { type: Boolean, default: false },
    attemptCount: { type: Number, default: 0 },
    attempts: [{ correct: { type: Boolean }, at: { type: Date, default: Date.now } }],
    classId: { type: String, default: "5" },
    schoolId: { type: String, default: "default" },
  },
  { timestamps: true }
);

studentDiscoverProgressSchema.index({ studentId: 1, questionId: 1 }, { unique: true });

module.exports = mongoose.model("StudentDiscoverProgress", studentDiscoverProgressSchema);