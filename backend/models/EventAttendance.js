const mongoose = require("mongoose");

const eventAttendanceSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "CareerEvent", required: true },
    attendedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

eventAttendanceSchema.index({ studentId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model("EventAttendance", eventAttendanceSchema);