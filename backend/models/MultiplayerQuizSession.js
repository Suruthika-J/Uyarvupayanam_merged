const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, default: "Student Peer" },
  joinedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["WAITING", "READY", "ANSWERING", "ANSWERED", "FINISHED", "DISCONNECTED"],
    default: "WAITING"
  },
  score: { type: Number, default: 0 },
  answeredCount: { type: Number, default: 0 },
  correctCount: { type: Number, default: 0 },
  currentQuestionIndex: { type: Number, default: 0 },
  lastActiveAt: { type: Date, default: Date.now }
}, { _id: false });

const multiplayerQuizSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  inviteId: { type: mongoose.Schema.Types.ObjectId, ref: "PeerMessage", required: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "PeerConversation" },

  topic: { type: String, required: true },
  subtopic: { type: String, default: "General" },
  difficulty: { type: String, default: "Medium" },

  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "AhpFuzzyQuestion" }],

  participants: [participantSchema],

  status: {
    type: String,
    enum: ["WAITING", "READY", "COUNTDOWN", "LIVE", "WAITING_FOR_NEXT", "COMPLETED", "CANCELLED", "SOLO_AFTER_DISCONNECT"],
    default: "WAITING",
    index: true
  },

  totalQuestions: { type: Number, default: 10 },
  durationSeconds: { type: Number, default: 1500 }, // 25 mins default
  questionTimeoutSeconds: { type: Number, default: 45 },

  startAt: { type: Date },
  endAt: { type: Date },

  currentQuestionIndex: { type: Number, default: 0 },
  currentQuestionStartedAt: { type: Date },

  nextQuestionReadyUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  completedAt: { type: Date }
}, { timestamps: true });

multiplayerQuizSessionSchema.index({ inviteId: 1 });
multiplayerQuizSessionSchema.index({ "participants.userId": 1 });

module.exports = mongoose.model("MultiplayerQuizSession", multiplayerQuizSessionSchema);
