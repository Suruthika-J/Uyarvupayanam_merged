const mongoose = require("mongoose");

const expeditionContributionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expeditionId: { type: mongoose.Schema.Types.ObjectId, ref: "Expedition", required: true },
    xpContributed: { type: Number, default: 0 },
    source: { type: String, default: "game" }, // game | challenge | quiz | manual
    contributedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExpeditionContribution", expeditionContributionSchema);