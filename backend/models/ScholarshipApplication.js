const mongoose = require("mongoose");

const scholarshipApplicationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },

    // Link to the specific college scholarship document
    scholarshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CollegeScholarship",
      default: null
    },

    scholarshipName: { type: String, required: true },
    scholarshipProvider: { type: String, default: "" },

    // "college" or "school" — allows queries to distinguish systems
    scholarshipType: {
      type: String,
      enum: ["college", "school"],
      default: "college"
    },

    // Student-side tracking status
    applicationStatus: {
      type: String,
      enum: ["Interested", "Applied", "Not Interested"],
      default: "Interested"
    },

    // Legacy field — kept for backward compat with any existing school scholarship records
    status: { type: String, default: "Pending" },

    appliedDate: { type: Date, default: Date.now },
    notes: { type: String, default: "" }
  },
  { collection: "scholarshipApplications", timestamps: true }
);

// Unique per student per scholarship — prevent duplicate tracking entries
scholarshipApplicationSchema.index({ studentId: 1, scholarshipId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("ScholarshipApplication", scholarshipApplicationSchema);

