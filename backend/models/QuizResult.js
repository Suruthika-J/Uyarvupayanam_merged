const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    answers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId },
        optionIndex: { type: Number, default: 0 },
      },
    ],
    resultWorldKey: { type: String, required: true },
    resultWorldName: { type: String, default: "" },
    takenAt: { type: Date, default: Date.now },
    classId: { type: String, default: "5" },
    schoolId: { type: String, default: "default" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizResult", quizResultSchema);