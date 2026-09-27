const mongoose = require("mongoose");

// Collection: student_skill_profiles
// Per-subskill diagnosis for a student (Part 5). One document per
// (student × skill × subskill); upserted every assessment cycle.
const studentSkillProfileSchema = new mongoose.Schema(
    {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        grade: { type: String },
        skill: { type: String, required: true },
        subskill: { type: String, required: true },
        score: { type: Number, default: 0 }, // weighted % 0–100
        correctCount: { type: Number, default: 0 },
        attemptedCount: { type: Number, default: 0 },
        weightedScore: { type: Number, default: 0 },
        difficultyPerformance: {
            easy: { type: Number },
            medium: { type: Number },
            hard: { type: Number },
        },
        cognitivePerformance: { type: Map, of: Number }, // cognitiveType → %
        confidence: { type: String, enum: ["low", "medium", "high"], default: "low" },
        status: {
            type: String,
            enum: ["insufficient_evidence", "foundation", "developing", "ready", "advanced"],
            default: "insufficient_evidence",
        },
        lastAttemptAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

studentSkillProfileSchema.index({ studentId: 1, skill: 1, subskill: 1 }, { unique: true });

module.exports = mongoose.model("StudentSkillProfile", studentSkillProfileSchema);