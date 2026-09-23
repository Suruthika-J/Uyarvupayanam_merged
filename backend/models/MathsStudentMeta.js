const mongoose = require("mongoose");

// One row per student: lightweight record of the last Maths activity they
// touched so "Continue Learning" can resume exactly where they left off.
const mathsStudentMetaSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    lastTopic: { type: String, default: "" }, // world id last opened
    lastQuestionId: { type: Number, default: null },
    lastAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MathsStudentMeta", mathsStudentMetaSchema);