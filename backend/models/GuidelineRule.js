const mongoose = require("mongoose");

// Collection: guideline_rules
// Small admin-editable list mapping an overall level to its quick-guideline
// message. "Fallback" is the generic catch-all row.
const guidelineRuleSchema = new mongoose.Schema(
    {
        overallLevel: { type: String, required: true }, // Strong | Average | Needs Improvement | Fallback
        guidelineText: { type: String, required: true },
    },
    { timestamps: true }
);

guidelineRuleSchema.index({ overallLevel: 1 }, { unique: true });

module.exports = mongoose.model("GuidelineRule", guidelineRuleSchema);