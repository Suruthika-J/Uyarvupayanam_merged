const mongoose = require("mongoose");

const communicationContentSchema = new mongoose.Schema(
  {
    contentType: {
      type: String,
      required: true,
      enum: ["emotion_question", "talk_topic", "conversation_set", "simulator_scenario", "flip_tip", "daily_mission"],
      index: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    location: {
      type: String,
      default: null,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

communicationContentSchema.index({ contentType: 1, isActive: 1, order: 1 });

module.exports = mongoose.model("CommunicationContent", communicationContentSchema);
