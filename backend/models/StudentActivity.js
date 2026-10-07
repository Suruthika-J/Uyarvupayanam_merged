// backend/models/StudentActivity.js
//
// Reusable, per-student activity feed used by the "Recent Activity" feature
// (dashboard card + /student/recent-activity page).
//
// Schema deliberately mirrors the requested generic shape:
//   { studentId, type, title, description, metadata, createdAt }
//
// Notes on existing models:
//   - Activity.js is an admin-facing, un-owned feed (no studentId) used only by
//     the admin dashboard — not suitable for a per-student history.
//   - StudentActivityHistory.js is Class 5 communication-lab specific
//     (activityType / activityDetail / xpEarned).
//   Neither is reused here; this model is the generic per-student feed.

const mongoose = require("mongoose");

const studentActivitySchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Canonical activity types:
    //   course_viewed, course_saved, course_completed
    //   college_viewed, college_saved
    //   scholarship_viewed, scholarship_saved
    //   exam_viewed
    //   career_assessment_completed, career_explored
    //   quiz_completed, module_completed
    //   recommendation_viewed
    type: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    // Free-form: { entityId, link, category, ... } — used to dedupe view
    // events and to surface deep links from the activity feed.
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true, // provides createdAt / updatedAt
  }
);

// Feed is always per-student, newest first.
studentActivitySchema.index({ studentId: 1, createdAt: -1 });

module.exports = mongoose.model("StudentActivity", studentActivitySchema);