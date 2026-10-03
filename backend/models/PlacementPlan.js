const mongoose = require("mongoose");

const placementSessionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  day: { type: String, required: true },
  date: { type: String },
  timeSlot: { type: String, required: true },
  roundType: { type: String, required: true }, // e.g. "Online Assessment", "Coding Round", "Technical Interview"
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  activityType: { type: String, default: "Practice" },
  duration: { type: String, default: "60 mins" },
  plannedDurationMinutes: { type: Number, default: 60 },
  priority: { type: String, enum: ["HIGH", "MED", "LOW"], default: "MED" },
  status: { type: String, enum: ["pending", "completed", "skipped"], default: "pending" },
  completedAt: { type: Date }
});

const placementPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlacementCompanyResearch"
    },
    companyName: { type: String, required: true },
    targetRole: { type: String, required: true },
    hiringType: { type: String, default: "Campus Placement" },

    deadline: { type: Date, required: true },
    durationDays: { type: Number, required: true },
    totalAvailableHours: { type: Number, default: 0 },
    allocatedHours: { type: Number, default: 0 },

    skillProfile: {
      Aptitude: { type: String, default: "Moderate" },
      LogicalReasoning: { type: String, default: "Moderate" },
      Coding: { type: String, default: "Moderate" },
      DSA: { type: String, default: "Moderate" },
      DBMS: { type: String, default: "Moderate" },
      OOP: { type: String, default: "Moderate" },
      ComputerNetworks: { type: String, default: "Moderate" },
      OperatingSystems: { type: String, default: "Moderate" },
      Projects: { type: String, default: "Moderate" },
      Communication: { type: String, default: "Moderate" },
      TechnicalInterview: { type: String, default: "Moderate" },
      HR: { type: String, default: "Moderate" }
    },

    reportedRounds: [{ type: mongoose.Schema.Types.Mixed }],

    schedule: [
      {
        day: { type: String, required: true },
        date: { type: String, required: true },
        dailyTargetHours: { type: String, default: "2.0 Hours" },
        tasks: [placementSessionSchema]
      }
    ],

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlacementPlan", placementPlanSchema);
