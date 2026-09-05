const mongoose = require("mongoose");

const collegeCourseMappingSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    source: {
      type: String, // "Import", "Manual Verification", "Cutoff Sync"
      default: "Import",
    },
    importBatchId: {
      type: String,
      default: null,
    },
    sourceFileName: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    collegeName: {
      type: String,
      trim: true,
    },
    courseName: {
      type: String,
      trim: true,
    },
    degree: {
      type: String,
      trim: true,
    },
    courseLevel: {
      type: String,
      trim: true,
    },
    specialization: {
      type: String,
      trim: true,
    },
    duration: {
      type: String,
      trim: true,
    },
    eligibility: {
      type: String,
      trim: true,
    },
    admissionMode: {
      type: String,
      trim: true,
    },
    hostel: {
      type: String,
      trim: true,
    },
    collegeType: {
      type: String,
      trim: true,
    },
    universityAffiliation: {
      type: String,
      trim: true,
    },
    stream: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    }
  },
  {
    timestamps: true,
  }
);

// Unique constraint to prevent duplicate mappings
collegeCourseMappingSchema.index({ collegeId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("CollegeCourseMapping", collegeCourseMappingSchema);
