const mongoose = require("mongoose");

const gameAttemptSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: "MiniGame", required: true },
    gameKey: { type: String, default: "" },
    score: { type: Number, default: 0 },
    pct: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now },
    classId: { type: String, default: "5" },
    schoolId: { type: String, default: "default" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GameAttempt", gameAttemptSchema);