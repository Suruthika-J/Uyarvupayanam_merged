const mongoose = require("mongoose");

// One question/activity per row. The `type` drives which cartoon renderer the
// frontend uses; `objects`/`options` carry the interactive payload (map
// hotspots, matching sets, ordering tiles, sort items...). `answer` stays the
// single source of truth for correct/incorrect decisions and is validated
// server-side on POST /answer — it is never shipped in GET payloads.
const scienceQuestionSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    world: { type: String, required: true }, // matches ScienceWorld.id, or "daily" for the challenge pool
    topic: { type: String, default: "" },
    activity: { type: String, default: "" },
    concept: { type: String, default: "" },
    type: {
      type: String,
      required: true,
      enum: [
        "multiple-choice",
        "image-choice",
        "true-false",
        "fill-blank",
        "matching",
        "ordering",
        "sort",
        "image-map",
        "scenario",
        "predict",
        "compare",
      ],
    },
    difficulty: { type: String, enum: ["easy", "medium", "challenge"], default: "easy" },
    question: { type: String, required: true },
    options: { type: mongoose.Schema.Types.Mixed, default: [] },
    objects: { type: mongoose.Schema.Types.Mixed, default: {} },
    answer: { type: mongoose.Schema.Types.Mixed, required: true },
    hint: { type: String, default: "" }, // short nudge shown only after a first miss
    explanation: { type: String, default: "" }, // "why" shown after reveal / correct
    image: { type: String, default: "" }, // optional asset key for future rich items
  },
  { timestamps: true }
);

scienceQuestionSchema.index({ world: 1, difficulty: 1 });
module.exports = mongoose.model("ScienceQuestion", scienceQuestionSchema);