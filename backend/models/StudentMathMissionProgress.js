const mongoose = require("mongoose");

// Per-student progress for a Class 8 Maths topic (Fractions, then the rest).
// One document per (studentId, topic). Missions are completed in order; the
// topic completes when every mission in it is done, which unlocks the next
// topic on the mission map.
const studentMathMissionProgressSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    topic: { type: String, required: true },
    completedMissions: { type: [String], default: [] },
    score: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    hintsUsed: { type: Number, default: 0 },
    mistakes: { type: mongoose.Schema.Types.Mixed, default: [] },
    masteryPercentage: { type: Number, default: 0 },
    currentLevel: { type: Number, default: 1 },
    topicCompleted: { type: Boolean, default: false },
    // Per-mission star rating (1–3) awarded at first completion; the map and
    // planet journeys read this back to show progress at a glance.
    missionStars: { type: mongoose.Schema.Types.Mixed, default: {} },
    // Transient state for the current mission run (used to judge stars):
    // { mission, mistakes, hints }. Reset when a new session starts.
    run: { type: mongoose.Schema.Types.Mixed, default: null },
    lastPlayed: { type: Date, default: null },
  },
  { timestamps: true }
);

studentMathMissionProgressSchema.index({ studentId: 1, topic: 1 }, { unique: true });
module.exports = mongoose.model("StudentMathMissionProgress", studentMathMissionProgressSchema);