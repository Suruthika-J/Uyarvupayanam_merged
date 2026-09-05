const mongoose = require("mongoose");

const mentorRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },
    studentName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    classLevel: {
      type: String,
      required: true,
    },
    interest: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    preferredContact: {
      type: String,
      enum: ["Phone", "Email", "WhatsApp"],
      default: "Phone",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Rejected"],
      default: "Pending",
    },
    assignedMentor: {
      type: String,
      default: "",
    },
    adminNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MentorRequest", mentorRequestSchema);
