const mongoose = require("mongoose");

// A shared, collaborative class expedition goal. Progress is a group total, never ranked per student.
const expeditionSchema = new mongoose.Schema(
  {
    classId: { type: String, required: true, default: "5" },
    schoolId: { type: String, default: "default" },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    goalWorldKey: { type: String, default: "" },
    goalWorldName: { type: String, default: "" },
    targetXp: { type: Number, default: 1000 },
    currentXp: { type: Number, default: 0 },
    starsToUnlock: { type: Number, default: 3 }, // worlds unlocked at milestones
    startsAt: { type: Date, default: Date.now },
    endsAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expedition", expeditionSchema);