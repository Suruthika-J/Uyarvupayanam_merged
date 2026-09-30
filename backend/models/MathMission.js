const mongoose = require("mongoose");

// Mission content for the Class 8 Maths Missions (a "concept chain").
// Concept + Simple Example cards are content, not questions — the graded
// questions for each mission live in MathMissionQuestion.
const mathMissionSchema = new mongoose.Schema(
  {
    missionId: { type: String, required: true, unique: true },
    topic: { type: String, required: true, index: true },
    order: { type: Number, required: true },
    name: { type: String, required: true },
    tagline: { type: String, default: "" },
    reward: { type: String, default: "" },
    concept: { type: mongoose.Schema.Types.Mixed, default: {} },
    example: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

mathMissionSchema.index({ topic: 1, order: 1 });
module.exports = mongoose.model("MathMission", mathMissionSchema);