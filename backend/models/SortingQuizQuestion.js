const mongoose = require("mongoose");

const sortingQuizQuestionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    emoji: { type: String, default: "✨" },
    // Each option maps to a career world (worldKey) and nudges one or more skill axes.
    options: [
      {
        label: { type: String, required: true },
        emoji: { type: String, default: "" },
        worldKey: { type: String, required: true },
        axes: {
          creativity: { type: Number, default: 0 },
          logic: { type: Number, default: 0 },
          empathy: { type: Number, default: 0 },
          leadership: { type: Number, default: 0 },
          focus: { type: Number, default: 0 },
        },
      },
    ],
    classId: { type: String, default: "5" },
    schoolId: { type: String, default: "default" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SortingQuizQuestion", sortingQuizQuestionSchema);