const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  id: { type: String }, // e.g. "A", "B", "C", "D"
  optionId: { type: String }, // e.g. "opt_aiml_e1_a"
  text: { type: String, required: true },
  fuzzyImpact: { type: Map, of: Number, default: {} },
  skillMappings: { type: mongoose.Schema.Types.Mixed, default: {} },
  fuzzyIntensity: { type: Number, default: 5 }
}, { _id: false });

const ahpFuzzyQuestionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true, unique: true },
    questionNumber: { type: Number },
    branch: { type: String, default: "CSE", index: true },
    domainId: { type: String, required: true, index: true }, // e.g. 'ai_ml', 'cyber_security'
    domainName: { type: String, required: true }, // e.g. 'Artificial Intelligence & Machine Learning'
    domain: { type: String, index: true }, // alias for domainId
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "Easy", "Medium", "Hard"],
      default: "medium",
      required: true,
      index: true
    },
    questionType: {
      type: String,
      enum: ["conceptual", "scenario", "problem_solving", "debugging", "architecture", "decision", "technical"],
      default: "scenario"
    },
    category: { type: String, default: "General" },
    dimension: { type: String, default: "Skill & Behaviour" },
    questionText: { type: String, required: true },
    options: [optionSchema],
    correctOption: { type: String },
    explanation: { type: String, default: "" },
    skillDimensions: [{ type: String }],
    skillVariables: [{ type: String }], // alias for skillDimensions
    fuzzyMappings: { type: mongoose.Schema.Types.Mixed, default: {} },
    xp: { type: Number, default: 10 },
    source: { type: String, default: "master-question-bank-pdf" },
    active: { type: Boolean, default: true, index: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" }
  },
  { timestamps: true }
);

ahpFuzzyQuestionSchema.index({ branch: 1, domainId: 1, difficulty: 1, active: 1 });
ahpFuzzyQuestionSchema.index({ domainId: 1, difficulty: 1, active: 1 });
ahpFuzzyQuestionSchema.index({ domain: 1, difficulty: 1, status: 1 });

module.exports = mongoose.model("AhpFuzzyQuestion", ahpFuzzyQuestionSchema);

