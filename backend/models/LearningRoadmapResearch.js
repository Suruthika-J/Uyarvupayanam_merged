const mongoose = require("mongoose");

const SourceItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, default: "" },
  sourceType: {
    type: String,
    enum: ["OFFICIAL_DOCS", "UNIVERSITY_SYLLABUS", "CERTIFICATION_EXAM", "EDUCATIONAL_PORTAL", "PRACTICE_PLATFORM", "AI_ESTIMATED"],
    default: "EDUCATIONAL_PORTAL"
  },
  credibility: { type: String, enum: ["HIGH", "MEDIUM", "LOW"], default: "HIGH" },
  publishedDate: { type: String, default: "" },
  retrievedAt: { type: Date, default: Date.now }
});

const LearningRoadmapResearchSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", index: true },
    topic: { type: String, required: true },
    normalizedTopic: { type: String, required: true, index: true },
    sources: [SourceItemSchema],
    identifiedSections: [{ type: String }],
    identifiedTopics: [{ type: String }],
    researchSummary: { type: String, default: "" },
    confidence: { type: String, enum: ["HIGH", "MEDIUM", "LOW"], default: "HIGH" },
    confidenceReason: { type: String, default: "" }
  },
  { timestamps: true }
);

LearningRoadmapResearchSchema.index({ normalizedTopic: 1 });

module.exports = mongoose.model("LearningRoadmapResearch", LearningRoadmapResearchSchema);
