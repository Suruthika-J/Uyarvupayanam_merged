const mongoose = require("mongoose");

const placementCompanyResearchSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true, index: true },
    targetRole: { type: String, required: true, trim: true, index: true },
    hiringType: {
      type: String,
      enum: ["Campus Placement", "Off Campus", "Internship", "Not Sure"],
      default: "Campus Placement"
    },
    researchDate: { type: Date, default: Date.now },

    reportedRounds: [
      {
        sequence: { type: Number, required: true },
        roundName: { type: String, required: true },
        normalizedCategory: {
          type: String,
          enum: [
            "ONLINE_ASSESSMENT",
            "APTITUDE",
            "LOGICAL_REASONING",
            "CODING",
            "TECHNICAL_INTERVIEW",
            "MANAGERIAL_INTERVIEW",
            "SYSTEM_DESIGN",
            "DOMAIN_INTERVIEW",
            "HR_INTERVIEW",
            "COMMUNICATION",
            "GROUP_DISCUSSION",
            "OTHER"
          ],
          default: "TECHNICAL_INTERVIEW"
        },
        topics: [{ type: String }],
        assessmentType: { type: String, default: "Mixed" },
        candidateDetails: { type: String },
        confidence: { type: String, default: "reported" } // reported, verified, common
      }
    ],

    sources: [
      {
        title: { type: String, required: true },
        website: { type: String },
        date: { type: String },
        url: { type: String }
      }
    ],

    conflicts: {
      hasVariations: { type: Boolean, default: false },
      commonRounds: [{ type: String }],
      additionalReportedRounds: [{ type: String }],
      note: { type: String }
    },

    isStale: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Compound index for caching lookup
placementCompanyResearchSchema.index({ companyName: 1, targetRole: 1 });

module.exports = mongoose.model("PlacementCompanyResearch", placementCompanyResearchSchema);
