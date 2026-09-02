const mongoose = require("mongoose");

const studentBadgeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    badgeName: {
      type: String,
      required: true,
      enum: [
        "Emotion Detective",
        "Confident Speaker",
        "Good Listener",
        "Helping Friend",
        "Conversation Builder",
        "Communication Hero",
        "Kind Speaker",
        "Active Learner",
        "Pattern Master",
        "Creative Artist",
        "Storyteller",
        "Young Songwriter",
        "Treasure Hunter",
      ],
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate badges for the same student
studentBadgeSchema.index({ studentId: 1, badgeName: 1 }, { unique: true });

module.exports = mongoose.model("StudentBadge", studentBadgeSchema);
