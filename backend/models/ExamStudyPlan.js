const mongoose = require("mongoose");

const topicMasterySchema = new mongoose.Schema({
  topicId: { type: String, required: true },
  topicName: { type: String, required: true },
  sectionId: { type: String },
  normalizedKey: { type: String },
  questionsAttempted: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 }, // 0 to 100
  averageTimeSeconds: { type: Number, default: 60 },
  speedScore: { type: Number, default: 70 },
  consistencyScore: { type: Number, default: 70 },
  masteryScore: { type: Number, default: 0 }, // 0 to 100
  status: {
    type: String,
    enum: ["REINFORCE", "PRACTICE", "ADVANCE", "MASTERED"],
    default: "PRACTICE"
  },
  lastPracticedAt: { type: Date }
}, { _id: false });

const studyDayTaskSchema = new mongoose.Schema({
  topicId: { type: String, required: true },
  topicName: { type: String, required: true },
  sectionName: { type: String },
  taskType: { type: String, enum: ["Concept", "Practice", "Revision", "Mock", "PYQ"], default: "Concept" },
  durationMinutes: { type: Number, default: 40 },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date }
}, { _id: false });

const studyPlanDaySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  dayName: { type: String }, // e.g. "Day 1", "Mon"
  dateStr: { type: String },
  totalMinutes: { type: Number, default: 120 },
  completedMinutes: { type: Number, default: 0 },
  tasks: [studyDayTaskSchema]
}, { _id: false });

const studyPlanPhaseSchema = new mongoose.Schema({
  phaseNumber: { type: Number, required: true },
  title: { type: String, required: true }, // e.g. "Phase 1: Foundation & Core Concepts"
  description: { type: String },
  durationWeeks: { type: Number, default: 3 },
  weekRange: { type: String }, // e.g. "Weeks 1-3"
  focusTopics: [{ type: String }],
  completed: { type: Boolean, default: false }
}, { _id: false });

const mockTestAttemptSchema = new mongoose.Schema({
  mockId: { type: String, required: true },
  mockTitle: { type: String, required: true },
  mockType: { type: String, enum: ["SECTIONAL", "FULL_MOCK", "PYQ_MOCK", "TOPIC_TEST"], default: "FULL_MOCK" },
  score: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  percentage: { type: Number, required: true },
  accuracy: { type: Number, default: 0 },
  timeTakenMinutes: { type: Number, default: 0 },
  attemptedAt: { type: Date, default: Date.now }
}, { _id: false });

const examStudyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  examId: { type: String, required: true, index: true }, // e.g. 'ssc-cgl', 'gate-cse'
  targetExamDate: { type: Date },
  hoursPerDay: { type: Number, default: 2 },
  studentLevel: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Intermediate" },
  readinessScore: { type: Number, default: 0 }, // 0 to 100
  readinessStatus: {
    type: String,
    enum: ["Getting Started", "Building Foundation", "Good Progress", "Exam Ready Soon", "Highly Prepared"],
    default: "Getting Started"
  },
  syllabusCompletion: { type: Number, default: 0 },

  phases: [studyPlanPhaseSchema],
  dailySchedule: [studyPlanDaySchema],
  topicMastery: [topicMasterySchema],
  weakTopics: [{ type: String }],
  strongTopics: [{ type: String }],
  mockTestHistory: [mockTestAttemptSchema]
}, { timestamps: true });

examStudyPlanSchema.index({ userId: 1, examId: 1 }, { unique: true });

module.exports = mongoose.model("ExamStudyPlan", examStudyPlanSchema);
