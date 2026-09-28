const mongoose = require("mongoose");

// Question bank for the Math Adventure Worlds. Purely content - no theme
// fields here. The frontend renders each question through one of the 7
// generic question-type components driven entirely by this JSON.
const mathQuestionSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    topic: { type: String, required: true }, // matches MathWorld.id
    type: {
      type: String,
      required: true,
      enum: [
        "visual",
        "story",
        "numerical",
        "multiple-choice",
        "drag",
        "fill-blank",
        "matching",
        "clock",
        "shape-touch",
        "fraction-slice",
        "chart-build",
      ],
    },
    difficulty: { type: String, enum: ["easy", "medium", "challenge"], default: "easy" },
    question: { type: String, required: true },
    objects: { type: mongoose.Schema.Types.Mixed, default: {} },
    options: { type: mongoose.Schema.Types.Mixed, default: [] },
    answer: { type: mongoose.Schema.Types.Mixed, required: true },
    explanation: { type: String, default: "" },
  },
  { timestamps: true }
);

mathQuestionSchema.index({ topic: 1, difficulty: 1 });
module.exports = mongoose.model("MathQuestion", mathQuestionSchema);