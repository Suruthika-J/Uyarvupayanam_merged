const mongoose = require("mongoose");

const studentActivityHistorySchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activityType: {
      type: String,
      required: true, // e.g. "video", "emotion_detective", "one_minute_talk", etc.
    },
    activityDetail: {
      type: String,
    },
    xpEarned: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentActivityHistory", studentActivityHistorySchema);
