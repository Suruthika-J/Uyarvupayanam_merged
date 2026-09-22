const mongoose = require("mongoose");

const class5StreakSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    classId: { type: String, default: "5" },
    schoolId: { type: String, default: "default" },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Class5Streak", class5StreakSchema);