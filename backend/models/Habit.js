const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    daysCompleted: [
      {
        type: String, // ISO Date string (YYYY-MM-DD)
      }
    ],
    lastCompleted: {
        type: String,
    },
    streak: {
        type: Number,
        default: 0
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Habit", habitSchema);
