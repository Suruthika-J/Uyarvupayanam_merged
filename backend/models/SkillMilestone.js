const mongoose = require("mongoose");

// Collection: skill_milestones
// Deterministic, evidence-backed milestones for the Class 8 Skill Adventure.
// A milestone is earned ONLY from real completed activity evidence — never
// for opening a page or pressing random answers.
const skillMilestoneSchema = new mongoose.Schema(
    {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        code: { type: String, required: true }, // unique per student
        title: { type: String, required: true },
        description: { type: String, default: "" },
        skillId: { type: String, default: "" },
        earnedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

skillMilestoneSchema.index({ studentId: 1, code: 1 }, { unique: true });
skillMilestoneSchema.index({ studentId: 1, earnedAt: -1 });

module.exports = mongoose.model("SkillMilestone", skillMilestoneSchema);