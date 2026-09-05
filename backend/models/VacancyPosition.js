const mongoose = require("mongoose");

const vacancyPositionSchema = new mongoose.Schema(
  {
    collegeCode: {
      type: String,
      trim: true,
      required: true,
      index: true,
    },
    collegeName: {
      type: String,
      trim: true,
      required: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      default: null,
    },
    branchCode: {
      type: String,
      trim: true,
      required: true,
    },
    branchName: {
      type: String,
      trim: true,
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    year: {
      type: Number,
      required: true,
      default: 2024,
    },
    counsellingRound: {
      type: String,
      default: "After SCA to SC Conversion",
    },
    // Vacancy counts by reservation category
    vacancyData: [
      {
        category: { type: String, required: true }, // OC, BC, BCM, MBC, SC, SCA, ST
        seats: { type: Number, default: 0 },
      },
    ],
    // Convenience total
    totalVacancy: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Unique constraint per college+branch+year
vacancyPositionSchema.index(
  { collegeCode: 1, branchCode: 1, year: 1 },
  { unique: true }
);
vacancyPositionSchema.index({ collegeName: "text", branchName: "text" });

module.exports = mongoose.model("VacancyPosition", vacancyPositionSchema);
