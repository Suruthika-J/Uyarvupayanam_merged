const mongoose = require("mongoose");

const TopicSchema = new mongoose.Schema({
  topicId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: "" },
  priority: { type: String, enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"], default: "HIGH" },
  priorityScore: { type: Number, default: 70 },
  difficulty: { type: String, enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"], default: "BEGINNER" },
  estimatedHours: { type: Number, default: 4 },
  conceptHours: { type: Number, default: 1.5 },
  practiceHours: { type: Number, default: 1.5 },
  revisionHours: { type: Number, default: 0.5 },
  assessmentHours: { type: Number, default: 0.5 },
  practiceMinutes: { type: Number, default: 90 },
  revisionMinutes: { type: Number, default: 30 },
  recommendedQuestions: { type: Number, default: 30 },
  prerequisites: [{ type: String }],
  skillsGained: [{ type: String }],
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  masteryScore: { type: Number, default: 0 },
  accuracyScore: { type: Number, default: 0 },
  userAttemptsCount: { type: Number, default: 0 }
});

const SectionSchema = new mongoose.Schema({
  sectionId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  priority: { type: String, enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"], default: "HIGH" },
  priorityScore: { type: Number, default: 70 },
  estimatedHours: { type: Number, default: 10 },
  topics: [TopicSchema]
});

const MilestoneSchema = new mongoose.Schema({
  phase: { type: String, default: "" },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  targetWeek: { type: Number, default: 1 },
  isCompleted: { type: Boolean, default: false }
});

const DailyTaskSchema = new mongoose.Schema({
  topicId: { type: String, default: "" },
  topicName: { type: String, required: true },
  activityType: { type: String, default: "Concept Study" }, // Concept Study | Practice Questions | Revision | Assessment Test
  durationMinutes: { type: Number, default: 45 },
  isCompleted: { type: Boolean, default: false }
});

const DailyPlanSchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  dateLabel: { type: String, default: "" },
  tasks: [DailyTaskSchema]
});

const WeeklyScheduleSchema = new mongoose.Schema({
  day: { type: String, enum: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"], required: true },
  activity: { type: String, required: true },
  durationHours: { type: Number, default: 2 }
});

const WeeklyPlanSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  theme: { type: String, default: "" },
  schedule: [WeeklyScheduleSchema]
});

const WeakTopicSchema = new mongoose.Schema({
  topicId: { type: String, required: true },
  topicName: { type: String, required: true },
  accuracy: { type: Number, default: 0 },
  reinforcementAddedHours: { type: Number, default: 1 },
  extraQuestionsCount: { type: Number, default: 20 }
});

const StrongTopicSchema = new mongoose.Schema({
  topicId: { type: String, required: true },
  topicName: { type: String, required: true },
  accuracy: { type: Number, default: 90 }
});

const SourceRefSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, default: "" },
  sourceType: { type: String, default: "EDUCATIONAL_PORTAL" },
  credibility: { type: String, default: "HIGH" }
});

const LearningRoadmapSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    title: { type: String, required: true },
    topic: { type: String, required: true },
    normalizedTopic: { type: String, required: true, index: true },
    category: { type: String, default: "computer_science" },
    level: { type: String, enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"], default: "BEGINNER" },
    goal: { type: String, enum: ["PLACEMENT", "EXAM", "CERTIFICATION", "PROJECT", "GENERAL"], default: "PLACEMENT" },
    availableHoursPerDay: { type: Number, default: 2 },
    targetDate: { type: Date },
    totalEstimatedHours: { type: Number, default: 40 },
    estimatedWeeks: { type: Number, default: 4 },
    progressPercentage: { type: Number, default: 0 },
    placementReadyScore: { type: Number, default: 0 },
    readinessStatus: { type: String, default: "Building Foundation" },
    status: { type: String, enum: ["ACTIVE", "COMPLETED", "PAUSED"], default: "ACTIVE" },
    isCurrentActive: { type: Boolean, default: true },

    sections: [SectionSchema],
    milestones: [MilestoneSchema],
    dailyPlans: [DailyPlanSchema],
    weeklyPlans: [WeeklyPlanSchema],

    completedTopics: [{ type: String }],
    weakTopics: [WeakTopicSchema],
    strongTopics: [StrongTopicSchema],

    sources: [SourceRefSchema],
    researchConfidence: { type: String, enum: ["HIGH", "MEDIUM", "LOW"], default: "HIGH" },
    confidenceReason: { type: String, default: "" }
  },
  { timestamps: true }
);

LearningRoadmapSchema.index({ userId: 1, isCurrentActive: 1 });
LearningRoadmapSchema.index({ userId: 1, normalizedTopic: 1, level: 1, goal: 1 });

module.exports = mongoose.model("LearningRoadmap", LearningRoadmapSchema);
