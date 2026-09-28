const mongoose = require("mongoose");

const studentCareerBadgeSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    badgeKey: { type: String, required: true },
    name: { type: String, default: "" },
    emoji: { type: String, default: "🎖️" },
    iconUrl: { type: String, default: "" },
    category: { type: String, enum: ["skill", "streak", "event", "seasonal"], default: "skill" },
    earnedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

studentCareerBadgeSchema.index({ studentId: 1, badgeKey: 1 }, { unique: true });

module.exports = mongoose.model("StudentCareerBadge", studentCareerBadgeSchema);