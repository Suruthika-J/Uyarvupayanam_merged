const mongoose = require("mongoose");

// Collection: student_interest_profiles
// Interest profile (Part 10) — separate from ability. category → 0–100.
const studentInterestProfileSchema = new mongoose.Schema(
    {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        grade: { type: String },
        interests: { type: Map, of: Number }, // e.g. technology: 80
        source: { type: String, enum: ["onboarding", "reassess", "manual"], default: "onboarding" },
        lastUpdatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

studentInterestProfileSchema.index({ studentId: 1 });

module.exports = mongoose.model("StudentInterestProfile", studentInterestProfileSchema);