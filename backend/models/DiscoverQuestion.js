const mongoose = require("mongoose");

// CMS-editable question bank for the Class 5 Discover Me quest cards.
// Each record belongs to a career world and is one of five interaction
// types. The client checks correctness locally for instant feedback; the
// shape is JSON-driven so teachers can add questions without a code deploy.
const discoverQuestionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true, unique: true },
    worldKey: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["drag_match", "tap_select", "sequence", "fill_blank", "sort"],
      required: true,
    },
    prompt: { type: String, required: true },
    hint: { type: String, default: "" },
    feedback: { type: String, default: "" },
    assets: { type: mongoose.Schema.Types.Mixed, default: {} },
    options: { type: mongoose.Schema.Types.Mixed, default: [] },
    targets: { type: mongoose.Schema.Types.Mixed, default: [] },
    buckets: { type: mongoose.Schema.Types.Mixed, default: [] },
    correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true },
    difficulty: { type: Number, default: 1, min: 1, max: 3 },
    classId: { type: String, default: "5" },
    schoolId: { type: String, default: "default" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DiscoverQuestion", discoverQuestionSchema);