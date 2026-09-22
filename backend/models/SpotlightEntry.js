const mongoose = require("mongoose");

// "Explorer of the week" spotlight — selected by effort/consistency, never by score ranking.
const spotlightEntrySchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentName: { type: String, default: "" },
    weekOf: { type: String, required: true }, // ISO week start, e.g. "2026-09-21"
    reasonNote: { type: String, required: true },
    emoji: { type: String, default: "🌟" },
    classId: { type: String, default: "5" },
    schoolId: { type: String, default: "default" },
  },
  { timestamps: true }
);

spotlightEntrySchema.index({ classId: 1, weekOf: 1 }, { unique: true });

module.exports = mongoose.model("SpotlightEntry", spotlightEntrySchema);