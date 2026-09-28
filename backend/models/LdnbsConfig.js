const mongoose = require("mongoose");

// Collection: ldnbs_config
// Single document holding admin-overridable LD-NBSE configuration:
// weights, thresholds, effort map, success messages. Defaults live in
// config/ldnbs/* and are merged (DB overrides win). Blueprint, taxonomy and
// dependency overrides live in their own collections (skill_taxonomy,
// skill_dependencies) + the blueprint override map here.
const ldnbsConfigSchema = new mongoose.Schema(
    {
        key: { type: String, default: "default" },
        weights: {
            skillGap: Number,
            prerequisiteImportance: Number,
            cognitiveGap: Number,
            interestAlignment: Number,
            recentProgress: Number,
        },
        thresholds: { type: mongoose.Schema.Types.Mixed },
        effortByStatus: { type: mongoose.Schema.Types.Mixed },
        successMessages: { type: mongoose.Schema.Types.Mixed },
        blueprintOverrides: { type: mongoose.Schema.Types.Mixed }, // grade → rows
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

ldnbsConfigSchema.index({ key: 1 }, { unique: true });

module.exports = mongoose.model("LdnbsConfig", ldnbsConfigSchema);