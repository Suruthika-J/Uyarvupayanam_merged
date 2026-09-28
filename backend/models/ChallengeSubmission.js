const mongoose = require("mongoose");

const challengeSubmissionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: "WeeklyChallenge", required: true },
    response: { type: String, default: "" },
    responseIndex: { type: Number, default: -1 },
    submittedAt: { type: Date, default: Date.now },
    classId: { type: String, default: "5" },
    schoolId: { type: String, default: "default" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChallengeSubmission", challengeSubmissionSchema);