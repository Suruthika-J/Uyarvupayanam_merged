// backend/config/ldnbs/recommendationWeights.js
//
// LD-NBSE configurable weights and thresholds. These are the DEFAULTS; an
// admin can override any of them via the ldnbs_config document (see
// loadEffectiveConfig.js). Engines always receive an effective config object
// and never hard-code these numbers elsewhere.
"use strict";

const DEFAULT_WEIGHTS = {
    // Next Best Skill score weights (must sum to 1.00).
    skillGap: 0.35,
    prerequisiteImportance: 0.25,
    cognitiveGap: 0.20,
    interestAlignment: 0.10,
    recentProgress: 0.10,
};

const DEFAULT_THRESHOLDS = {
    // Evidence gates — never judge a subskill on a single question.
    evidence: {
        minForJudgment: 2, // below this → status "insufficient_evidence"
        highConfidenceAt: 3, // >= this → confidence "high"
    },
    // Weighted score → status. Grade-aware curves (younger classes get a
    // slightly softer bar); the "default" applies to any unmapped grade.
    status: {
        default: { foundationUnder: 45, developingUnder: 70, readyUnder: 85, advancedAt: 85 },
        "Class 5": { foundationUnder: 40, developingUnder: 65, readyUnder: 80, advancedAt: 80 },
        "Class 8": { foundationUnder: 40, developingUnder: 65, readyUnder: 80, advancedAt: 80 },
        "Class 10": { foundationUnder: 45, developingUnder: 70, readyUnder: 85, advancedAt: 85 },
        "Class 12": { foundationUnder: 45, developingUnder: 70, readyUnder: 85, advancedAt: 85 },
    },
    // Progress classification deltas (percentage points).
    progress: {
        improveBy: 10,
        declineBy: -10,
    },
    // A subskill's difficulty-level gap that counts as a "transfer" concern.
    transfer: {
        easyHardGapMin: 30, // easy% − hard% >= this → transfer_gap candidate
        dimensionGapMin: 25, // strong dim − weak dim >= this → cognitive gap
    },
    // Success condition target % for a recommendation.
    successTarget: 70,
};

const DEFAULT_EFFORT = {
    // estimatedEffort + recommendedDifficulty per current status.
    foundation: { difficulty: "easy", effort: "2–3 short sessions (~20 minutes each)" },
    developing: { difficulty: "medium", effort: "15 minutes daily for a week" },
    ready: { difficulty: "medium", effort: "20 minutes of advanced practice" },
    advanced: { difficulty: "hard", effort: "challenge-level tasks weekly" },
    insufficient_evidence: { difficulty: "easy", effort: "one short practice session, then reassess" },
};

const DEFAULT_SUCCESS_MESSAGES = {
    foundation: "Reach at least {target}% on a targeted prerequisite check before moving on.",
    developing: "Reach at least {target}% across two targeted assessments.",
    ready: "Move to the next dependent skill and complete a 70%+ practice set.",
    advanced: "Maintain above 80% on advanced practice to keep the skill sharp.",
    insufficient_evidence: "Complete a short focused practice set so we can diagnose this properly.",
};

module.exports = {
    DEFAULT_WEIGHTS,
    DEFAULT_THRESHOLDS,
    DEFAULT_EFFORT,
    DEFAULT_SUCCESS_MESSAGES,
    validateWeights(weights) {
        const w = { ...DEFAULT_WEIGHTS, ...(weights || {}) };
        const sum = ["skillGap", "prerequisiteImportance", "cognitiveGap", "interestAlignment", "recentProgress"]
            .reduce((acc, k) => acc + Number(w[k] || 0), 0);
        if (Math.abs(sum - 1) > 0.0001) {
            // Normalize instead of throwing so admin edits can never brick the engine.
            const keys = ["skillGap", "prerequisiteImportance", "cognitiveGap", "interestAlignment", "recentProgress"];
            for (const k of keys) w[k] = Number(w[k] || 0) / sum;
        }
        return w;
    },
};