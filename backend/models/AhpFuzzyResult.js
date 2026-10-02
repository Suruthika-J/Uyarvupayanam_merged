const mongoose = require("mongoose");

const domainScoreSchema = new mongoose.Schema({
  domainId: { type: String, required: true },
  domainName: { type: String, required: true },
  score: { type: Number, required: true }
}, { _id: false });

const recommendedDomainSchema = new mongoose.Schema({
  domainId: { type: String, required: true },
  domainName: { type: String, required: true },
  score: { type: Number, required: true },
  category: { type: String, default: "CSE Specialization" },
  icon: { type: String, default: "🧠" }
}, { _id: false });

const ahpFuzzyResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    studentId: {
      type: String,
      trim: true
    },
    branch: {
      type: String,
      default: "CSE"
    },
    ahpCandidates: [domainScoreSchema],
    fuzzyScores: [domainScoreSchema],
    finalScores: [domainScoreSchema],
    rankings: [mongoose.Schema.Types.Mixed],
    recommendedDomain: {
      type: recommendedDomainSchema,
      required: true
    },
    confidenceLevel: {
      type: String,
      enum: ["high", "close_match"],
      default: "high"
    },
    scoreDiff: {
      type: Number,
      default: 0
    },
    strongDimensions: [{ type: String }],
    totalQuestionsAnswered: {
      type: Number,
      default: 15
    },
    assessmentCompleted: {
      type: Boolean,
      default: true
    },
    answers: [{ type: mongoose.Schema.Types.Mixed }],
    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AhpFuzzyResult", ahpFuzzyResultSchema);
