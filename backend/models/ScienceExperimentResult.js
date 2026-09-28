const mongoose = require("mongoose");

// One row per student + world recording that the prediction experiment was run
// and what its outcome was. This keeps the "experiment done" state separate
// from question progress so a child can't re-run (or skip) wildly and the
// world page resumes sensibly after a refresh.
const scienceExperimentResultSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    world: { type: String, required: true },
    pick: { type: mongoose.Schema.Types.Mixed, default: {} }, // itemKey -> predicted bucket
    results: { type: mongoose.Schema.Types.Mixed, default: {} }, // itemKey -> real outcome
    correct: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    ranAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

scienceExperimentResultSchema.index({ studentId: 1, world: 1 }, { unique: true });
module.exports = mongoose.model("ScienceExperimentResult", scienceExperimentResultSchema);