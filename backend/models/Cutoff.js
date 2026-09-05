const mongoose = require("mongoose");

const cutoffSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    // Category-wise cutoff marks (e.g., OC: 198.5, BC: 195.0, etc.)
    cutoffData: [
      {
        category: { type: String, required: true },
        score: { type: Number, required: true },
      }
    ],
    round: {
      type: String,
      default: "Round 1",
    },
    downloadUrl: {
      type: String,
      default: "",
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookup by course and year
cutoffSchema.index({ courseId: 1, collegeId: 1, year: -1 });

module.exports = mongoose.model("Cutoff", cutoffSchema);
