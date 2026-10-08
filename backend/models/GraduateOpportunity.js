const mongoose = require("mongoose");

const graduateOpportunitySchema = new mongoose.Schema(
  {
    opportunityName: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },
    category: {
      type: String,
      enum: [
        "HIGHER_STUDIES",
        "GOVERNMENT_EXAMS",
        "PSU",
        "PRIVATE_JOBS",
        "RESEARCH",
        "ENTREPRENEURSHIP",
        "ACADEMIA",
        "INTERNATIONAL_STUDIES",
        "OTHER"
      ],
      required: true,
      index: true
    },
    organization: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    eligibility: { type: String, required: true },
    eligibleDegrees: [{ type: String }], // e.g. ["B.E.", "B.Tech", "B.Sc", "MCA", "ALL"]
    eligibleDegreeIds: [{ type: String }], // e.g. ["be", "btech", "bsc", "mca", "all"]
    eligibleSpecializations: [{ type: String }], // e.g. ["Computer Science", "Information Technology", "ALL"]
    eligibleSpecializationIds: [{ type: String }], // e.g. ["cse", "it", "all"]
    minimumQualification: { type: String, default: "Graduation" },
    ageRequirement: {
      minAge: { type: Number, default: null },
      maxAge: { type: Number, default: null },
      description: { type: String, default: "" }
    },
    cgpaRequirement: { type: String, default: "Not Specified" },
    percentageRequirement: { type: String, default: "Not Specified" },
    experienceRequirement: { type: String, default: "Freshers Eligible" },
    applicationMode: { type: String, enum: ["Online", "Offline", "Hybrid"], default: "Online" },
    
    // Verified Official URLs
    applicationUrl: { type: String, required: true },
    officialWebsite: { type: String, required: true },
    
    applicationStartDate: { type: Date },
    applicationDeadline: { type: Date },
    examDate: { type: Date },
    
    status: {
      type: String,
      enum: ["OPEN", "UPCOMING", "CLOSING_SOON", "CLOSED", "RESULT_PENDING", "COMPLETED"],
      default: "OPEN",
      index: true
    },
    
    // Data Source & Freshness Metadata
    source: { type: String, required: true }, // e.g. "UPSC", "SSC", "NTA", "GATE Portal", "IIM CAT"
    sourceType: { type: String, enum: ["official", "secondary"], default: "official" },
    sourceUrl: { type: String },
    sourceTitle: { type: String },
    lastVerifiedAt: { type: Date, default: Date.now },
    dataFreshness: {
      type: String,
      enum: ["VERIFIED", "STALE", "UNVERIFIED"],
      default: "VERIFIED"
    },
    
    selectionProcess: [{ type: String }],
    importantNotes: { type: String },
    whyRecommendedDefault: { type: String },
    location: { type: String, default: "All India" },
    salaryPackage: { type: String, default: "As per rules / stipend" }
  },
  { timestamps: true }
);

graduateOpportunitySchema.index({ category: 1, status: 1 });
graduateOpportunitySchema.index({ eligibleDegreeIds: 1 });

module.exports = mongoose.model("GraduateOpportunity", graduateOpportunitySchema);
