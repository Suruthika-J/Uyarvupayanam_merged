const mongoose = require("mongoose");

const cutoffRecordSchema = new mongoose.Schema(
  {
    collegeCode: { type: String, default: "" },
    collegeName: { type: String, required: true },
    branch: { type: String, required: true },
    category: { type: String, required: true }, // OC/BC/MBC/SC/ST
    cutoff: { type: mongoose.Schema.Types.Mixed, default: null },
    year: { type: Number, required: true },
    type: { type: String, required: true }, // Engineering
  },
  { timestamps: true }
);

cutoffRecordSchema.index(
  { collegeName: 1, branch: 1, category: 1, year: 1, type: 1 },
  { unique: false }
);

module.exports = mongoose.model("CutoffRecord", cutoffRecordSchema);

