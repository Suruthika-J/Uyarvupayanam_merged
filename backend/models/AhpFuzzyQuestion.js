const mongoose = require("mongoose");

const ahpFuzzyQuestionSchema = new mongoose.Schema(
  {
    questionNumber: { type: Number, required: true, unique: true },
    questionText: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "Problem Solving & Logic",
        "System Architecture & Hardware",
        "Data & Artificial Intelligence",
        "Real-World Engineering & Infrastructure",
        "Innovation & Technology Trends"
      ],
      required: true
    },
    dimension: { type: String, required: true },
    options: [
      {
        optionId: { type: String, required: true },
        text: { type: String, required: true },
        // AHP Priority Weights for candidate domains (sums normalized during evaluation)
        ahpWeights: {
          cse: { type: Number, default: 0 },
          it: { type: Number, default: 0 },
          aids: { type: Number, default: 0 },
          ece: { type: Number, default: 0 },
          eee: { type: Number, default: 0 },
          mechanical: { type: Number, default: 0 },
          civil: { type: Number, default: 0 },
          chemical: { type: Number, default: 0 },
          mechatronics: { type: Number, default: 0 }
        },
        // Fuzzy membership intensity scale (1 to 10)
        fuzzyIntensity: { type: Number, required: true, min: 1, max: 10 }
      }
    ],
    status: { type: String, enum: ["active", "inactive"], default: "active" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AhpFuzzyQuestion", ahpFuzzyQuestionSchema);
