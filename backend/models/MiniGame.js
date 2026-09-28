const mongoose = require("mongoose");

// Mini-game catalogue. Categories: logic | creative | debate | budgeting | coding
const miniGameSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // slug key e.g. "pattern-bridge"
    category: {
      type: String,
      required: true,
      enum: ["logic", "creative", "debate", "budgeting", "coding"],
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    oneLiner: { type: String, default: "" }, // "why this matters" in kid-friendly language
    emoji: { type: String, default: "🎮" },
    order: { type: Number, default: 0 },
    gradient: { type: String, default: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" },
    image: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    xpValue: { type: Number, default: 15 },
    skillTags: { type: [String], default: [] },
    axisGains: {
      creativity: { type: Number, default: 0 },
      logic: { type: Number, default: 0 },
      empathy: { type: Number, default: 0 },
      leadership: { type: Number, default: 0 },
      focus: { type: Number, default: 0 },
    },
    play: {
      type: { type: String, enum: ["choose", "order", "write", "budget", "sequence"], default: "choose" },
      prompt: { type: String, default: "" },
      options: { type: [String], default: [] },
      correctIndex: { type: Number, default: 0 },
      items: { type: [String], default: [] }, // for order/sequence games
      hint: { type: String, default: "" },
    },
    classId: { type: String, default: "5" },
    schoolId: { type: String, default: "default" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MiniGame", miniGameSchema);