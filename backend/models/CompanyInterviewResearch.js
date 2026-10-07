const mongoose = require("mongoose");

const OfficialSourceSchema = new mongoose.Schema({
  sourceTitle: { type: String, required: true },
  website: { type: String, required: true },
  url: { type: String, default: "" },
  date: { type: String, default: "" },
  sourceType: { type: String, default: "official" },
  snippet: { type: String, default: "" }
});

const CandidateSourceSchema = new mongoose.Schema({
  sourceTitle: { type: String, required: true },
  website: { type: String, required: true },
  url: { type: String, default: "" },
  date: { type: String, default: "" },
  sourceType: { type: String, default: "candidate_reported" },
  snippet: { type: String, default: "" }
});

const NormalizedRoundSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true },
  roundType: {
    type: String,
    enum: [
      "ONLINE_ASSESSMENT",
      "APTITUDE",
      "LOGICAL_REASONING",
      "CODING",
      "TECHNICAL_INTERVIEW",
      "DSA",
      "SYSTEM_DESIGN",
      "DOMAIN_INTERVIEW",
      "PROJECT_DISCUSSION",
      "MANAGERIAL",
      "BEHAVIORAL",
      "HR",
      "COMMUNICATION",
      "GROUP_DISCUSSION",
      "CASE_STUDY",
      "OTHER"
    ],
    default: "TECHNICAL_INTERVIEW"
  },
  roundName: { type: String, required: true },
  description: { type: String, default: "" },
  role: { type: String, default: "" },
  hiringType: { type: String, default: "" },
  sourceType: { type: String, enum: ["official", "candidate_reported"], default: "candidate_reported" },
  sourceUrl: { type: String, default: "" },
  sourceDate: { type: String, default: "" },
  confidence: { type: Number, default: 0.8 },
  evidenceText: { type: String, default: "" }
});

const ProcessVariationSchema = new mongoose.Schema({
  variationName: { type: String, required: true }, // e.g., "Variation A"
  rounds: [{ type: String }], // e.g. ["OA", "Technical", "HR"]
  reportedCount: { type: Number, default: 1 }
});

const ReportedQuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  category: {
    type: String,
    enum: [
      "Technical",
      "DSA",
      "Coding",
      "SQL",
      "Projects",
      "System Design",
      "Domain",
      "Behavioral",
      "HR"
    ],
    default: "Technical"
  },
  role: { type: String, default: "" },
  sourceTitle: { type: String, default: "Candidate Interview Experience" },
  sourceWebsite: { type: String, default: "Glassdoor / GeeksforGeeks" },
  sourceUrl: { type: String, default: "" },
  reportedDate: { type: String, default: "2025" },
  sourceType: { type: String, default: "candidate_reported" },
  sampleAnswerHint: { type: String, default: "" }
});

const TopicPatternSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  percentage: { type: Number, required: true },
  sampleCount: { type: Number, default: 0 }
});

const CompanyInterviewResearchSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    normalizedCompanyName: { type: String, required: true, index: true },
    role: { type: String, required: true, default: "Software Engineer" },
    normalizedRole: { type: String, required: true, index: true },
    hiringType: {
      type: String,
      enum: ["Campus", "Internship", "Full-Time", "Experienced", "Not Sure"],
      default: "Full-Time"
    },
    researchConfidence: {
      type: String,
      enum: ["HIGH", "MEDIUM", "LOW"],
      default: "MEDIUM"
    },
    confidenceReason: { type: String, default: "" },
    officialSources: [OfficialSourceSchema],
    candidateSources: [CandidateSourceSchema],
    rounds: [NormalizedRoundSchema],
    reportedVariations: [ProcessVariationSchema],
    mostReportedPattern: [{ type: String }],
    reportedQuestions: [ReportedQuestionSchema],
    topicPatterns: [TopicPatternSchema],
    researchedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } // 7 days cache
  },
  { timestamps: true }
);

CompanyInterviewResearchSchema.index(
  { normalizedCompanyName: 1, normalizedRole: 1, hiringType: 1 },
  { unique: true }
);

module.exports = mongoose.model("CompanyInterviewResearch", CompanyInterviewResearchSchema);
