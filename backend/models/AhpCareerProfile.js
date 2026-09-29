const mongoose = require("mongoose");

const pairwiseComparisonSchema = new mongoose.Schema({
  domainA: { type: String, required: true },
  domainB: { type: String, required: true },
  selectedDomain: { type: String, required: true },
  intensity: { type: Number, required: true, default: 3 }
}, { _id: false });

const candidateDomainSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, default: "General" },
  icon: { type: String, default: "FiBriefcase" },
  description: { type: String, default: "" },
  weight: { type: Number, default: 0 },
  scorePercent: { type: Number, default: 0 }
}, { _id: false });

const ahpCareerProfileSchema = new mongoose.Schema(
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
    branchId: {
      type: String,
      default: "cse"
    },
    selectedSpecializations: [{ type: String }],
    candidateDomains: [candidateDomainSchema],
    pairwiseComparisons: [pairwiseComparisonSchema],
    ahpMatrix: [[Number]],
    priorityWeights: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    consistencyIndex: { type: Number, default: 0 },
    consistencyRatio: { type: Number, default: 0 },
    consistencyStatus: {
      type: String,
      enum: ["Acceptable", "Inconsistent"],
      default: "Acceptable"
    },
    isConsistent: { type: Boolean, default: true },
    lambdaMax: { type: Number, default: 0 },
    topDomain: candidateDomainSchema,
    secondDomain: candidateDomainSchema,
    thirdDomain: candidateDomainSchema,
    candidateDomainsForStep6: [candidateDomainSchema],
    completedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AhpCareerProfile", ahpCareerProfileSchema);
