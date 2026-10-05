const mongoose = require("mongoose");

// ── PeerMessage — individual chat message between two college students ─────────
const peerMessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "PeerConversation", required: true, index: true },
  senderId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content:        { type: String, required: true, trim: true, maxlength: 2000 },
  type: {
    type: String,
    enum: ["text", "study_invite", "system"],
    default: "text"
  },
  // For study_invite type
  studyInvite: {
    subject:         { type: String },
    topicId:         { type: String },
    topicLabel:      { type: String },
    goal:            { type: String },
    durationMinutes: { type: Number },
    status:          { type: String, enum: ["pending", "accepted", "declined", "PENDING", "ACCEPTED", "DECLINED", "EXPIRED", "QUIZ_CREATED", "IN_PROGRESS", "COMPLETED"], default: "pending" },
    sessionId:       { type: String }
  },
  readBy:     [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isDeleted:  { type: Boolean, default: false }
}, { timestamps: true });

// ── PeerConversation — a direct message thread between two college students ────
const peerConversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }],
  lastMessage:    { type: String, trim: true },
  lastMessageAt:  { type: Date, default: Date.now },
  lastSenderId:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  // Unread counts per user
  unreadCounts: {
    type: Map,
    of: Number,
    default: {}
  }
}, { timestamps: true });

// Ensure a conversation is unique between two participants
peerConversationSchema.index({ participants: 1 });
peerConversationSchema.index({ lastMessageAt: -1 });
peerMessageSchema.index({ conversationId: 1, createdAt: 1 });

const PeerConversation = mongoose.model("PeerConversation", peerConversationSchema);
const PeerMessage      = mongoose.model("PeerMessage",      peerMessageSchema);

module.exports = { PeerConversation, PeerMessage };
