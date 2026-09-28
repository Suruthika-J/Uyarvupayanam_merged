const mongoose = require("mongoose");

// Upcoming career-day / Q&A events. Attending grants an attendance badge.
const careerEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    dateTime: { type: Date, required: true },
    durationMin: { type: Number, default: 30 },
    type: { type: String, enum: ["live", "recorded"], default: "live" },
    attendanceBadgeKey: { type: String, default: "" },
    classId: { type: String, default: "5" },
    schoolId: { type: String, default: "default" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CareerEvent", careerEventSchema);