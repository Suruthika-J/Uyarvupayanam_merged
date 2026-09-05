const mongoose = require("mongoose");

const admissionHelpRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    email: {
      type: String,
      required: false,
    },
    cutoff: {
      type: Number,
      required: [true, "Cutoff/Marks is required"],
    },
    preferredCourse: {
      type: String,
      required: [true, "Preferred course is required"],
    },
    preferredLocation: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["Pending", "Contacted", "Closed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdmissionHelpRequest", admissionHelpRequestSchema);
