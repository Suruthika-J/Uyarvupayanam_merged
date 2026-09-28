const mongoose = require("mongoose");

// Weekly 5-minute "Try it" challenge, rotated weekly. Not graded — self-check only.
const weeklyChallengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    oneLiner: { type: String, default: "" },
    emoji: { type: String, default: "🧪" },
    taskType: { type: String, default: "open" }, // "open" | "choose"
    taskPrompt: { type: String, default: "" },
    options: { type: [String], default: [] },
    worldTag: { type: String, default: "" },
    activeFrom: { type: Date, required: true },
    activeTo: { type: Date, required: true },
    classId: { type: String, default: "5" },
    schoolId: { type: String, default: "default" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WeeklyChallenge", weeklyChallengeSchema);