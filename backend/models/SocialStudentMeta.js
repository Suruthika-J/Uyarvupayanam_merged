const mongoose = require("mongoose");

// Per-student resume pointer: which world and question they were last on, so
// "Continue Learning" picks up exactly where they stopped.
const socialStudentMetaSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    lastWorld: { type: String, default: "" },
    lastQuestionId: { type: Number, default: null },
    lastAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SocialStudentMeta", socialStudentMetaSchema);