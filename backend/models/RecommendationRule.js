const mongoose = require("mongoose");

// Collection: recommendation_rules
// Admin-editable lookups consumed by the recommendation engine:
// for a (grade, skill, skill_level) combo → what activity to suggest and/or
// which exam to recommend. grade "All" matches every grade.
const recommendationRuleSchema = new mongoose.Schema(
    {
        grade: { type: String, default: "All" }, // "Class 5" | ... | "All"
        skill: { type: String, required: true },
        skillLevel: { type: String, enum: ["Strong", "Average", "Needs Improvement"], required: true },
        recommendedActivity: { type: String, default: "" },
        recommendedExam: { type: String, default: "" },
    },
    { timestamps: true }
);

recommendationRuleSchema.index({ grade: 1, skill: 1, skillLevel: 1 });

module.exports = mongoose.model("RecommendationRule", recommendationRuleSchema);