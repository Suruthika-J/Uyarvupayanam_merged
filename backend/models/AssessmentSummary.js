const mongoose = require("mongoose");

// Collection: assessment_summaries
// Persisted snapshot of the recommendation engine output for one completed
// onboarding attempt (per the spec: persist the result against the student).
// The GET /onboarding/result/:studentId endpoint recomputes freshly from the
// per-skill assessment_results rows, so this document is an audit/at-a-glance
// record rather than the source of truth for scoring.
const assessmentSummarySchema = new mongoose.Schema(
    {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        sessionId: { type: String, default: "" },
        grade: { type: String, required: true },
        overallScore: { type: Number, required: true },
        overallLevel: { type: String, enum: ["Strong", "Average", "Needs Improvement"], required: true },
        skillBreakdown: [
            {
                skill: String,
                correct: Number,
                total: Number,
                percentage: Number,
                level: { type: String, enum: ["Strong", "Average", "Needs Improvement", "insufficient_evidence", "foundation", "developing", "ready", "advanced"] },
            },
        ],
        strongSkills: [String],
        needsImprovement: [String],
        recommendedSkillsToFocus: [String],
        suggestedActivities: [String],
        recommendedExams: [String],
        quickGuideline: { type: String },
        submittedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

assessmentSummarySchema.index({ studentId: 1, submittedAt: -1 });

module.exports = mongoose.model("AssessmentSummary", assessmentSummarySchema);