const mongoose = require("mongoose");

// One row per student + Class 5 subject + calendar day: the single place the
// "Today's Challenge" state lives for Math Adventure, World Explorer and Science
// World.
//
// Why this exists rather than reusing MathsProgress / SocialProgress /
// ScienceDaily:
//
//   * The daily challenge must be date-scoped, so it comes back to "not done"
//     tomorrow. The per-world progress stores are keyed by question and are
//     never cleared, so reading "solved" from them made today's challenge show
//     as permanently finished as soon as that question had been solved anywhere.
//   * The daily challenge is a free daily spark, not adaptive practice. Writing
//     it into the per-world store used to inflate a world's "x / 5" count, move
//     the student's adaptive difficulty and (via the unlock chain) open the next
//     world without the student ever playing it.
//
// Kept separate on purpose so fixing the daily challenge can never touch the
// maps or the per-world progression.
const class5DailyChallengeSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // "maths" | "social" | "science"
    subject: { type: String, required: true, trim: true, lowercase: true },
    dateKey: { type: String, required: true }, // "YYYY-MM-DD" in server local time
    questionId: { type: Number, required: true },
    solved: { type: Boolean, default: false },
    // True once the student answered correctly, even if they later saw the
    // explanation instead. "Finished today" means this.
    completed: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
    solvedAt: { type: Date, default: null },
    classId: { type: String, default: "5" },
    schoolId: { type: String, default: "default" },
  },
  { timestamps: true }
);

// One row per student per subject per day. The questionId is deliberately not
// part of the key: if the bank changes mid-day the student keeps the record
// they already earned rather than silently losing it.
class5DailyChallengeSchema.index({ studentId: 1, subject: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model("Class5DailyChallenge", class5DailyChallengeSchema);