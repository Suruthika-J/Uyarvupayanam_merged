const mongoose = require("mongoose");

// Collection: skill_taxonomy
// Admin-editable per-grade skill/subskill taxonomy (seeded from
// config/ldnbs/skillTaxonomyConfig.js).
const skillTaxonomySchema = new mongoose.Schema(
    {
        grade: { type: String, required: true }, // "Class 5" | "Class 8" | "Class 10" | "Class 12"
        skill: { type: String, required: true },
        subskills: [{ type: String }],
    },
    { timestamps: true }
);

skillTaxonomySchema.index({ grade: 1, skill: 1 }, { unique: true });

module.exports = mongoose.model("SkillTaxonomy", skillTaxonomySchema);