const mongoose = require("mongoose");

const graduateMentorRelationshipSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MentorRequest"
    },
    studentName: { type: String, required: true },
    studentDegree: { type: String, default: "B.E. CSE" },
    studentYear: { type: String, default: "Final Year" },
    interest: { type: String, default: "Software Engineering & Placements" },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "COMPLETED", "REJECTED"],
      default: "PENDING",
      index: true
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PeerConversation"
    },
    acceptedAt: { type: Date },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("GraduateMentorRelationship", graduateMentorRelationshipSchema);
