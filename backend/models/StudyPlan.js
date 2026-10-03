const mongoose = require("mongoose");

const studySessionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  day: { type: String, required: true },
  date: { type: String },
  timeSlot: { type: String, required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  activityType: {
    type: String,
    enum: ["Theory", "Coding Practice", "Problem Solving", "Videos", "Notes", "Practice Questions", "Revision", "Projects", "Mock Test", "Exam Prep"],
    default: "Theory"
  },
  category: { type: String, default: "Core Subject" }, // Exam Prep, Weak Subject, Roadmap Skill, Core Subject, Revision
  priority: { type: String, enum: ["HIGH", "MED", "LOW"], default: "MED" },
  duration: { type: String, default: "60 mins" },
  plannedDurationMinutes: { type: Number, default: 60 },
  status: { type: String, enum: ["pending", "completed", "skipped"], default: "pending" },
  completedAt: { type: Date }
});

const studyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    goal: { type: String, required: true }, // e.g. "Semester Examination"
    goalType: { type: String, default: "semester_exam" }, // semester_exam, placement, new_skill, project, internal_exam, competitive_exam, weak_subjects, custom
    goalDescription: { type: String, trim: true },

    subjects: [
      {
        name: { type: String, required: true },
        priority: { type: String, enum: ["High", "Medium", "Low", "Auto"], default: "Medium" },
        difficulty: { type: String, enum: ["Easy", "Moderate", "Difficult", "Very Difficult"], default: "Moderate" },
        topics: [{ type: String }]
      }
    ],

    startDate: { type: Date, default: Date.now },
    deadline: { type: Date, required: true },
    durationDays: { type: Number, required: true },

    dailyAvailability: {
      Monday: { type: Number, default: 2 },
      Tuesday: { type: Number, default: 2 },
      Wednesday: { type: Number, default: 2 },
      Thursday: { type: Number, default: 2 },
      Friday: { type: Number, default: 2 },
      Saturday: { type: Number, default: 3 },
      Sunday: { type: Number, default: 3 }
    },

    timeSlots: [{ type: String }], // Morning, Afternoon, Evening, Night, or custom "6:00 PM – 7:00 PM"
    learningPreferences: [{ type: String }], // Theory, Coding Practice, Problem Solving, Videos, Notes, Practice Questions, Revision, Projects
    constraints: [{ type: String }], // College hours, Travel time, Hostel restrictions, Work/internship, Weekend unavailable, No late-night, Personal commitments

    recommendedDomain: { type: String, trim: true },
    totalAvailableHours: { type: Number, default: 0 },
    allocatedHours: { type: Number, default: 0 },

    schedule: [
      {
        day: { type: String, required: true },
        date: { type: String, required: true },
        dailyTargetHours: { type: String, default: "2.0 Hours" },
        tasks: [studySessionSchema]
      }
    ],

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudyPlan", studyPlanSchema);
