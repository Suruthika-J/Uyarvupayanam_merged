const mongoose = require("mongoose");

const studentDailyMissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    missionText: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    date: {
      type: String, // format YYYY-MM-DD
      required: true,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

studentDailyMissionSchema.index({ studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("StudentDailyMission", studentDailyMissionSchema);
