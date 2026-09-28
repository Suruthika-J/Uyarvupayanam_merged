const mongoose = require("mongoose");

// Per-student resume pointer: which world they were on and which stage
// (explore -> experiment -> play) so "Continue" picks up exactly where they
// stopped, like the social module's lastQuestionId but across experiment phases.
const scienceStudentMetaSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    lastWorld: { type: String, default: "" },
    stage: { type: String, enum: ["explore", "experiment", "play"], default: "explore" },
    lastAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ScienceStudentMeta", scienceStudentMetaSchema);