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
    // TNEA seat-matrix seat counts (admin-only; never projected publicly)
    seatsOC: { type: Number, default: 0 },
    seatsBC: { type: Number, default: 0 },
    seatsBCM: { type: Number, default: 0 },
    seatsMBC: { type: Number, default: 0 },
    seatsSC: { type: Number, default: 0 },
    seatsSCA: { type: Number, default: 0 },
    seatsST: { type: Number, default: 0 },
    seatsTotal: { type: Number, default: 0 },
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
