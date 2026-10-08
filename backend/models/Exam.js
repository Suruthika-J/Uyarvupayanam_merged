const mongoose = require("mongoose");

const examSectionSchema = new mongoose.Schema({
  sectionId: { type: String, required: true },
  name: { type: String, required: true },
  questionCount: { type: Number, default: 0 },
  marks: { type: Number, default: 0 },
  durationMinutes: { type: Number, default: 0 },
  negativeMarking: { type: String, default: "0.25" },
  weightage: { type: Number, default: 1.0 },
  syllabusTopics: [{
    topicId: { type: String, required: true },
    name: { type: String, required: true },
    normalizedKey: { type: String, required: true },
    estimatedHours: { type: Number, default: 4 },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    syllabusWeight: { type: Number, default: 50 },
    historicalFrequency: { type: Number, default: 50 },
    recentFrequency: { type: Number, default: 50 },
    prerequisites: [{ type: String }],
    conceptsToLearn: [{ type: String }],
    revisionChecklist: [{ type: String }]
  }]
}, { _id: false });

const examStageSchema = new mongoose.Schema({
  stageName: { type: String, required: true }, // e.g. "Tier 1", "Prelims", "GATE CBT", "CAT CBT"
  durationMinutes: { type: Number, default: 120 },
  totalQuestions: { type: Number, default: 100 },
  totalMarks: { type: Number, default: 200 },
  negativeMarking: { type: Boolean, default: true },
  sections: [examSectionSchema]
}, { _id: false });

const previousPaperSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  stage: { type: String, default: "Main" },
  section: { type: String, default: "All Sections" },
  paperTitle: { type: String, required: true },
  paperUrl: { type: String, required: true },
  officialSource: { type: String, default: "Official Portal" },
  sourceType: { type: String, enum: ["OFFICIAL_PDF", "OFFICIAL_PORTAL", "VERIFIED_PARTNER"], default: "OFFICIAL_PDF" },
  verifiedAt: { type: Date, default: Date.now }
}, { _id: false });

const examSourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  sourceType: { type: String, default: "Official Notification" },
  confidence: { type: String, enum: ["HIGH", "MEDIUM", "LOW"], default: "HIGH" },
  description: { type: String }
}, { _id: false });

const examSchema = new mongoose.Schema({
  examId: { type: String, required: true, unique: true, index: true }, // e.g. 'ssc-cgl', 'gate-cse', 'upsc-cse', 'cat'
  name: { type: String, required: true }, // e.g. "SSC Combined Graduate Level Examination"
  shortName: { type: String, required: true }, // e.g. "SSC CGL"
  category: {
    type: String,
    enum: [
      "Government",
      "Engineering",
      "Management",
      "Higher Studies",
      "Banking",
      "Railway",
      "Defence",
      "State PSC",
      "PSU",
      "International",
      "University Entrance"
    ],
    required: true,
    index: true
  },
  subCategory: { type: String, default: "National" },
  conductingOrganization: { type: String, required: true }, // e.g. "Staff Selection Commission"
  description: { type: String },
  purpose: { type: String },
  careerOpportunities: [{ type: String }],

  // Degree and Branch Matching
  eligibleDegrees: [{ type: String }], // e.g. ["B.E.", "B.Tech", "Degree in any discipline"]
  eligibleBranches: [{ type: String }], // e.g. ["Computer Science", "Information Technology", "All Branches"]
  minimumQualification: { type: String, default: "Bachelor Degree" },

  // Eligibility details
  eligibility: {
    qualificationRequirements: { type: String },
    minDegree: { type: String, default: "Bachelor Degree" },
    minPercentage: { type: String, default: "Passing Marks or 50%" },
    ageRequirements: { type: String, default: "18 to 30 years (relaxations apply)" },
    nationality: { type: String, default: "Indian Citizen" }
  },

  selectionProcess: [{ type: String }],

  // Date tracking for dynamic status calculation
  applicationStartDate: { type: Date },
  applicationEndDate: { type: Date },
  examDate: { type: Date },

  importantDates: {
    notificationDate: { type: String },
    applicationStart: { type: String },
    applicationDeadline: { type: String },
    examDate: { type: String },
    resultDate: { type: String }
  },

  // Official URLs
  applicationUrl: { type: String, required: true },
  officialWebsite: { type: String, required: true },
  notificationUrl: { type: String },
  syllabusUrl: { type: String },
  examPatternUrl: { type: String },

  status: {
    type: String,
    enum: ["UPCOMING", "OPEN", "CLOSING_SOON", "CLOSED", "COMPLETED", "NOT_VERIFIED", "VERIFIED"],
    default: "OPEN"
  },
  sourceType: { type: String, default: "Official Authority Portal" },
  sourceUrl: { type: String },
  sourceConfidence: { type: String, enum: ["HIGH", "MEDIUM", "LOW"], default: "HIGH" },
  lastVerifiedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },

  // Structured Exam Intelligence
  stages: [examStageSchema],
  previousPapers: [previousPaperSchema],
  sources: [examSourceSchema]
}, { timestamps: true });

module.exports = mongoose.model("Exam", examSchema);
