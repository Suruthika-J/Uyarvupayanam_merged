const mongoose = require("mongoose");

// Invisible adaptive difficulty signal, per student + topic.
// 3 consecutive correct -> step up one level; 2 consecutive wrong -> step down.
// Never returned to the child - it only selects which question comes next.
const mathsStudentLevelSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "challenge"], default: "easy" },
    correctStreak: { type: Number, default: 0 },
    wrongStreak: { type: Number, default: 0 },
    classId: { type: String, default: "5" },
    schoolId: { type: String, default: "default" },
  },
  { timestamps: true }
);

mathsStudentLevelSchema.index({ studentId: 1, topic: 1 }, { unique: true });
module.exports = mongoose.model("MathsStudentLevel", mathsStudentLevelSchema);