const mongoose = require("mongoose");

const graduateApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    opportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GraduateOpportunity",
      required: true
    },
    opportunityName: { type: String, required: true },
    category: { type: String, required: true },
    organization: { type: String },
    status: {
      type: String,
      enum: [
        "NOT_STARTED",
        "PLANNING",
        "APPLIED",
        "EXAM_COMPLETED",
        "RESULT_WAITING",
        "SELECTED",
        "REJECTED"
      ],
      default: "PLANNING"
    },
    appliedAt: { type: Date },
    deadline: { type: Date },
    officialApplicationUrl: { type: String },
    notes: { type: String, default: "" },
    reminderSet: { type: Boolean, default: false },
    reminderDate: { type: Date }
  },
  { timestamps: true }
);

graduateApplicationSchema.index({ userId: 1, opportunityId: 1 }, { unique: true });

module.exports = mongoose.model("GraduateApplication", graduateApplicationSchema);
