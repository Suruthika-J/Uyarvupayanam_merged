const mongoose = require("mongoose");

// Collection: learning_recommendations
// The LD-NBSE decision output for one assessment cycle (Part 14). Every
// recommendation is traceable to the evidence that produced it (we store the
// evidence snapshot + decision records).
const learningRecommendationSchema = new mongoose.Schema(
    {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        grade: { type: String },
        cycle: { type: Number, default: 1 },
        mode: { type: String, enum: ["onboarding", "reassess"], default: "onboarding" },
        recommendationType: {
            type: String,
            enum: ["FOUNDATION", "DEVELOPMENT", "ADVANCEMENT", "EXPLORATION"],
            required: true,
        },
        confidence: { type: String },
        primaryFocus: {
            skill: String,
            subskill: String,
            currentScore: Number,
            currentStatus: String,
            targetStatus: String,
            reason: String, // student-friendly "why"
            reasonCode: String, // decision code, e.g. "prerequisite_gap"
            prerequisite: String,
            recommendedDifficulty: String,
            estimatedEffort: String,
            successCondition: String,
            confidence: String,
        },
        secondaryFocus: [
            {
                skill: String,
                subskill: String,
                currentScore: Number,
                currentStatus: String,
                targetStatus: String,
                reason: String,
                recommendedDifficulty: String,
                confidence: String,
            },
        ],
        strengthsToMaintain: [{ skill: String, subskill: String, currentScore: Number }],
        detectedGaps: [
            {
                type: { type: String },
                label: String,
                relatedSkills: [String],
                severity: { type: String, enum: ["low", "medium", "high"] },
                description: String,
            },
        ],
        lockedSkills: [{ skill: String, subskill: String, reason: String }],
        unlockedSkills: [{ skill: String, subskill: String }],
        learningPath: [{ step: Number, skill: String, subskill: String, milestone: String }],
        areasToExplore: [String],
        progress: [
            {
                skill: String,
                subskill: String,
                previousScore: Number,
                currentScore: Number,
                change: Number,
                classification: { type: String, enum: ["improving", "stable", "declining", "mastered", "insufficient_data"] },
            },
        ],
        explanation: {
            summary: String,
            decision: Object, // final internal decision record (why this skill)
            confidence: String,
        },
        // Evidence traceability: the question rows that drove the decision.
        evidence: {
            sessionId: String,
            questionCount: Number,
            assessedSubskills: [String],
        },
        submittedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

learningRecommendationSchema.index({ studentId: 1, submittedAt: -1 });

module.exports = mongoose.model("LearningRecommendation", learningRecommendationSchema);