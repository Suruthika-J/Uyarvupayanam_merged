const mongoose = require("mongoose");

// Limited-time seasonal event (e.g. an online festival career fair). Renders only when live.
const seasonalEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    emoji: { type: String, default: "" },
    image: { type: String, default: "" },
    worldKey: { type: String, default: "" },
    worldName: { type: String, default: "" },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    classId: { type: String, default: "5" },
    schoolId: { type: String, default: "default" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SeasonalEvent", seasonalEventSchema);