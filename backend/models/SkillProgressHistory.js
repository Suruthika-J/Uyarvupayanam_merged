const mongoose = require("mongoose");

// Collection: skill_progress_history
// One row per (student × subskill × assessment event) so change-over-time and
// progress classification (Part 18) can be computed without guesswork.
const skillProgressHistorySchema = new mongoose.Schema(
    {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        grade: { type: String },
        skill: { type: String, required: true },
        subskill: { type: String, required: true },
        assessmentId: { type: mongoose.Schema.Types.ObjectId }, // LearningRecommendation cycle ref
        score: { type: Number }, // weighted %
        status: { type: String },
        attemptedCount: { type: Number },
        recordedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

skillProgressHistorySchema.index({ studentId: 1, subskill: 1, recordedAt: -1 });

module.exports = mongoose.model("SkillProgressHistory", skillProgressHistorySchema);