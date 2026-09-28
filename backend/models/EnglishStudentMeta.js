const mongoose = require("mongoose");

// One row per student: the full "English Adventure" reward & learning state.
// Stars, streak, level, badges, completed activities and common mistakes are
// all stored here so progress survives across devices and sessions. Content
// (questions, writing topics, scenes...) lives on the frontend data layer;
// this record is the source of truth for HOW the child is doing.
const englishStudentMetaSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    stars: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    lastActiveDay: { type: String, default: "" }, // local date "YYYY-MM-DD"
    activitiesCompleted: { type: Number, default: 0 },

    // Times each activity type was completed (for badge + difficulty logic)
    activityCounts: [
      {
        activity: { type: String, default: "" },
        count: { type: Number, default: 0 },
        lastAt: { type: Date, default: null },
      },
    ],

    // Earned badge keys (English Adventure badges, not college badges)
    badges: [{ type: String }],

    // Grammar topic progress: how many questions solved per topic
    grammarTopics: [
      {
        topicId: { type: String, default: "" },
        solved: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        lastAt: { type: Date, default: null },
      },
    ],

    // Repeated mistakes -> used for "Things I'm Learning" + extra practice
    commonMistakes: [
      {
        topic: { type: String, default: "" },
        count: { type: Number, default: 0 },
        updatedAt: { type: Date, default: null },
      },
    ],

    // Daily challenge completion marker per calendar day
    dailyChallenge: { date: { type: String, default: "" }, activityKey: { type: String, default: "" } },

    // Weekly English Explorer Challenge completion marker per week
    weeklyChallenge: { weekKey: { type: String, default: "" }, rounds: { type: Number, default: 0 } },

    classId: { type: String, default: "5" },
    schoolId: { type: String, default: "default" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EnglishStudentMeta", englishStudentMetaSchema);