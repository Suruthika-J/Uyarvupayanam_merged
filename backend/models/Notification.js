const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null = broadcast to all users
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "announcement",
        "exam",
        "scholarship",
        "career",
        "college",
        "course",
        "system",
        "counselling",
      ],
      default: "announcement",
    },
    targetLevel: {
      type: String,
      enum: ["All", "5th", "8th", "10th", "12th", "Graduate"],
      default: "All",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isBroadcast: {
      type: Boolean,
      default: false, // true = sent to all users
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    sentByAdmin: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for fast query by userId
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ isBroadcast: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
