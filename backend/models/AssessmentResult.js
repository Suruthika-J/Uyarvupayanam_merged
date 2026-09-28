const mongoose = require("mongoose");

// Collection: assessment_results
// One document per (student × skill × attempt) — the per-skill row the admin
// results view and the student result screen aggregate. Overall scores are
// derived from these rows, so the admin view can filter by grade and skill.
const assessmentResultSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        studentName: { type: String },
        studentEmail: { type: String },
        grade: { type: String, required: true }, // "Class 5" | "Class 8" | "Class 10" | "Class 12"
        skill: { type: String, required: true }, // skillTag, e.g. Communication
        score: { type: Number, required: true }, // correct answers for this skill
        totalQuestions: { type: Number, required: true },
        percentage: { type: Number, required: true },
        submittedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

assessmentResultSchema.index({ grade: 1, skill: 1, submittedAt: -1 });

module.exports = mongoose.model("AssessmentResult", assessmentResultSchema);