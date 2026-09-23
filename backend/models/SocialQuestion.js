const mongoose = require("mongoose");

// One question/activity per row. The `type` drives which cartoon renderer the
// frontend uses; `objects`/`options` carry the interactive payload (map
// hotspots, matching pairs, ordering tiles...). `answer` stays the single
// source of truth for correct/incorrect decisions.
const socialQuestionSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    world: { type: String, required: true }, // matches SocialWorld.id
    type: {
      type: String,
      required: true,
      enum: [
        "multiple-choice",
        "image-choice",
        "true-false",
        "fact-myth",
        "fill-blank",
        "matching",
        "ordering",
        "image-map",
        "scenario",
      ],
    },
    difficulty: { type: String, enum: ["easy", "medium", "challenge"], default: "easy" },
    question: { type: String, required: true },
    options: { type: mongoose.Schema.Types.Mixed, default: [] },
    objects: { type: mongoose.Schema.Types.Mixed, default: {} },
    answer: { type: mongoose.Schema.Types.Mixed, required: true },
    explanation: { type: String, default: "" },
  },
  { timestamps: true }
);

socialQuestionSchema.index({ world: 1, difficulty: 1 });
module.exports = mongoose.model("SocialQuestion", socialQuestionSchema);