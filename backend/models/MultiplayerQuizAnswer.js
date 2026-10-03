const mongoose = require("mongoose");

const multiplayerQuizAnswerSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "AhpFuzzyQuestion", required: true, index: true },
  questionIndex: { type: Number, required: true },
  selectedOption: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  score: { type: Number, default: 0 },
  responseTime: { type: Number, default: 0 }, // ms
  answeredAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Prevent duplicate answer per user per question in a session
multiplayerQuizAnswerSchema.index({ sessionId: 1, userId: 1, questionId: 1 }, { unique: true });

module.exports = mongoose.model("MultiplayerQuizAnswer", multiplayerQuizAnswerSchema);
