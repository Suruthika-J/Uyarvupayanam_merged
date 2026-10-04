const mongoose = require("mongoose");

// Per-student persistent progress for one Class 8 English topic. One document
// per (studentId, topic). The module's progression rule is:
//   1. Topics unlock one after another within an area (previous topic's
//      assessment must be completed).
//   2. Inside a topic, the AI assessment unlocks only after EVERY activity is
//      completed — checked server-side via requiredActivityIds().
// Activity completion is recorded ONLY by the backend after it has validated
// the student's answers against the curriculum seed (never from the client).
const studentEnglishProgressSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    areaId: { type: String, required: true },
    topic: { type: String, required: true, index: true },
    completedActivities: { type: [String], default: [] },
    activityAttempts: { type: mongoose.Schema.Types.Mixed, default: {} },
    assessmentAttempts: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    bestPercent: { type: Number, default: 0 },
    assessmentCompleted: { type: Boolean, default: false },
    lastPlayed: { type: Date, default: null },
  },
  { timestamps: true }
);

studentEnglishProgressSchema.index({ studentId: 1, topic: 1 }, { unique: true });
module.exports = mongoose.model("StudentEnglishProgress", studentEnglishProgressSchema);