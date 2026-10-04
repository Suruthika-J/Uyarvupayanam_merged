const mongoose = require("mongoose");

// Per-student AI-generated assessment attempt for one Class 8 English topic.
// The full question set (INCLUDING the answer key) lives only here, server-side.
//   - GET payloads strip correctAnswer before anything goes to the browser.
//   - POST submit grades against this stored set; frontend claims are never
//     trusted.
//   - status "pending" = set generated, not yet submitted (reused untouched
//     if the student reloads mid-attempt, so the set stays stable).
//   - status "submitted" = graded; best score is rolled into
//     StudentEnglishProgress.
const englishAssessmentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    areaId: { type: String, required: true },
    topic: { type: String, required: true, index: true },
    attempt: { type: Number, required: true },
    status: { type: String, enum: ["pending", "submitted"], default: "pending" },
    source: { type: String, enum: ["ai", "curated"], default: "ai" },
    questions: { type: mongoose.Schema.Types.Mixed, required: true },
    answers: { type: mongoose.Schema.Types.Mixed, default: [] },
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    percent: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

englishAssessmentSchema.index({ studentId: 1, topic: 1, attempt: 1 }, { unique: true });
module.exports = mongoose.model("EnglishAssessment", englishAssessmentSchema);