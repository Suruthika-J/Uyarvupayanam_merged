const mongoose = require("mongoose");

// Badge catalogue. Categories: skill | streak | event | seasonal
const badgeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g. "streak-3", "first-mission"
    name: { type: String, required: true },
    iconUrl: { type: String, default: "" },
    emoji: { type: String, default: "🎖️" },
    category: { type: String, enum: ["skill", "streak", "event", "seasonal"], default: "skill" },
    description: { type: String, default: "" },
    classId: { type: String, default: "5" },
    schoolId: { type: String, default: "default" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Badge", badgeSchema);