const mongoose = require("mongoose");

// Collection: skill_dependencies
// Admin-editable skill dependency/prerequisite graph (Part 8). One document
// per (grade × skill × subskill) with the list of prerequisite subskills.
const skillDependencySchema = new mongoose.Schema(
    {
        grade: { type: String, required: true },
        skill: { type: String, required: true },
        subskill: { type: String, required: true },
        prerequisites: [{ type: String }],
    },
    { timestamps: true }
);

skillDependencySchema.index({ grade: 1, skill: 1, subskill: 1 }, { unique: true });

module.exports = mongoose.model("SkillDependency", skillDependencySchema);