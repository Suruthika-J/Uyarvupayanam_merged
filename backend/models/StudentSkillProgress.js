const mongoose = require("mongoose");

const studentSkillProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    speakingConfidence: { type: Number, default: 10 },
    listening: { type: Number, default: 10 },
    empathy: { type: Number, default: 10 },
    observation: { type: Number, default: 10 },
    confidence: { type: Number, default: 10 },
    respect: { type: Number, default: 10 },
    leadership: { type: Number, default: 10 },
    logicalThinking: { type: Number, default: 10 },
    problemSolving: { type: Number, default: 10 },
    creativity: { type: Number, default: 10 },
    imagination: { type: Number, default: 10 },
    storytelling: { type: Number, default: 10 },
    logicalSequencing: { type: Number, default: 10 },
    expression: { type: Number, default: 10 },
    vocabulary: { type: Number, default: 10 },
    attention: { type: Number, default: 10 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    lastActivityDate: { type: Date },
    completedSteps: {
      type: [String],
      default: [], // e.g. ["video", "emotion_detective", ...]
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentSkillProgress", studentSkillProgressSchema);
