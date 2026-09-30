const mongoose = require("mongoose");

// Question bank for the Class 8 Maths Missions (Fractions reference
// implementation). `correctAnswer` is validated server-side on
// POST /missions/:questionId/answer and is NEVER returned in GET payloads.
// `hint1`/`hint2` are served only through the hint endpoint, one at a time.
const mathMissionQuestionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true, unique: true },
    topic: { type: String, required: true, index: true },
    mission: { type: String, required: true, index: true }, // MathMission.missionId
    slot: {
      type: String,
      enum: ["q1", "q2", "q3", "boss", "reinforce"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "challenge", "boss"],
      default: "easy",
    },
    questionType: {
      type: String,
      required: true,
      enum: [
        "multiple-choice",
        "true-false",
        "numeric-input",
        "fill-in-the-blank",
        "arrange-steps",
        "find-the-mistake",
        "word-problem",
        "drag-and-drop",
      ],
    },
    question: { type: String, required: true },
    options: { type: mongoose.Schema.Types.Mixed, default: [] },
    correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true },
    explanation: { type: String, default: "" },
    hint1: { type: String, default: "" },
    hint2: { type: String, default: "" },
    visual: { type: mongoose.Schema.Types.Mixed, default: null },
    realLife: { type: Boolean, default: false },
    mistakeType: { type: String, default: "" },
  },
  { timestamps: true }
);

mathMissionQuestionSchema.index({ mission: 1, slot: 1, difficulty: 1, questionType: 1 });
module.exports = mongoose.model("MathMissionQuestion", mathMissionQuestionSchema);