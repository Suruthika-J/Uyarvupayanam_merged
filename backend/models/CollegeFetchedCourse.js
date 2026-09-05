const mongoose = require("mongoose");

const collegeFetchedCourseSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true,
    },
    collegeName: {
      type: String,
      required: true,
    },
    courseFullName: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedCourseName: {
      type: String,
      required: true,
      trim: true,
    },
    stream: {
      type: String,
      default: "Other",
    },
    sourceUrl: {
      type: String,
      default: "",
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate courses for the same college
collegeFetchedCourseSchema.index({ collegeId: 1, normalizedCourseName: 1 }, { unique: true });

module.exports = mongoose.model("CollegeFetchedCourse", collegeFetchedCourseSchema);
