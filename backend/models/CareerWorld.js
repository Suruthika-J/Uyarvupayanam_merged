const mongoose = require("mongoose");

const careerWorldSchema = new mongoose.Schema(
  {
    worldKey: { type: String, required: true, unique: true }, // e.g. "ocean-explorer", "story-weaver"
    name: { type: String, required: true },
    tagline: { type: String, default: "" },
    emoji: { type: String, default: "" },
    image: { type: String, default: "" },
    colorTag: { type: String, default: "blue" }, // matches SBadge color palette
    description: { type: String, default: "" },
    videoIds: { type: [String], default: [] },
    skillTags: { type: [String], default: [] },
    classId: { type: String, default: "5" },
    schoolId: { type: String, default: "default" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CareerWorld", careerWorldSchema);