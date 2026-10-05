const mongoose = require("mongoose");

const resultParticipantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, default: "Student Peer" },
  totalScore: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  incorrectAnswers: { type: Number, default: 0 },
  unanswered: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  averageResponseTime: { type: Number, default: 0 }, // in seconds
  bestStreak: { type: Number, default: 0 },
  badges: [{ type: String }]
}, { _id: false });

const multiplayerQuizResultSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  inviteId: { type: mongoose.Schema.Types.ObjectId, ref: "PeerMessage" },
  topicId: { type: String, required: true },
  topicLabel: { type: String, required: true },
  winnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isTie: { type: Boolean, default: false },
  participants: [resultParticipantSchema],
  totalQuestions: { type: Number, default: 10 },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("MultiplayerQuizResult", multiplayerQuizResultSchema);
