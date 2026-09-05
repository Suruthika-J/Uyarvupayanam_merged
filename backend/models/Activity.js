const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    type: {
      type: String,
      enum: ["registration", "exam", "scholarship", "course", "cutoff"],
      default: "registration",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
